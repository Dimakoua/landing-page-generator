import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

interface ThemeJson {
  colors?: Record<string, string>;
  [key: string]: unknown;
}

const FALLBACK_COLOR = "transparent";

function collectThemeTokens(root: string): Record<string, string> {
  var landingsDir = path.resolve(root, "src/landings");
  var entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(landingsDir, { withFileTypes: true });
  } catch {
    return {};
  }

  var colors: Record<string, string> = {};

  for (var entry of entries) {
    if (!entry.isDirectory()) continue;
    var themeFile = path.join(landingsDir, entry.name, "theme.json");
    if (!fs.existsSync(themeFile)) continue;

    try {
      var raw = fs.readFileSync(themeFile, "utf-8");
      var theme: ThemeJson = JSON.parse(raw);

      if (theme.colors && typeof theme.colors === "object") {
        for (var [key, value] of Object.entries(theme.colors)) {
          if (!(key in colors)) {
            colors[key] = value || FALLBACK_COLOR;
          }
        }
      }
    } catch {
      // skip malformed files
    }
  }

  return colors;
}

function generateThemeCSS(colors: Record<string, string>): string {
  var lines = Object.entries(colors)
    .sort(function (a, b) { return a[0].localeCompare(b[0]); })
    .map(function (pair) { return "  --color-" + pair[0] + ": " + pair[1] + ";"; });

  if (lines.length === 0) return "";

  return "@theme {\n" + lines.join("\n") + "\n}";
}

var MARKER_START = "/* @theme-collector:start */";
var MARKER_END = "/* @theme-collector:end */";
var PLACEHOLDER = "/* @theme-collector */";

function escapeForRegex(s: string): string {
  return s.replace(/[.*+?^${}()|\\[\]]/g, "\\$&");
}

export default function themeCollector(): Plugin {
  var projectRoot = "";
  var themeCSS = "";

  return {
    name: "vite-plugin-theme-collector",
    enforce: "pre",

    configResolved: function (config) {
      projectRoot = config.root;
    },

    buildStart: function () {
      var colors = collectThemeTokens(projectRoot);
      themeCSS = generateThemeCSS(colors);
      var count = Object.keys(colors).length;
      if (count > 0) {
        console.log("[theme-collector] Collected " + count + " color tokens from theme.json files");
      }
    },

    transform: function (code, id) {
      if (!id.endsWith(".css")) return null;

      var fencedPattern = escapeForRegex(MARKER_START) + "[\\s\\S]*?" + escapeForRegex(MARKER_END);
      var fencedRe = new RegExp(fencedPattern, "g");
      var replacement = MARKER_START + "\n" + themeCSS + "\n" + MARKER_END;

      if (fencedRe.test(code)) {
        return code.replace(new RegExp(fencedPattern, "g"), replacement);
      }

      if (code.includes(PLACEHOLDER)) {
        return code.replace(PLACEHOLDER, replacement);
      }

      return null;
    },

    handleHotUpdate: function (ctx) {
      var file = ctx.file;
      var server = ctx.server;
      if (file.endsWith("theme.json") && file.includes("/landings/")) {
        var colors = collectThemeTokens(projectRoot);
        themeCSS = generateThemeCSS(colors);
        console.log("[theme-collector] theme.json changed, refreshed " + Object.keys(colors).length + " tokens");
        server.ws.send({ type: "full-reload" });
      }
    },
  };
}
