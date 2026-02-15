import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

interface ThemeJson {
  colors?: Record<string, string>;
  [key: string]: unknown;
}

const FALLBACK_COLOR = "transparent";

function collectThemeTokens(root: string): Record<string, string> {
  const landingsDir = path.resolve(root, "src/landings");
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(landingsDir, { withFileTypes: true });
  } catch {
    return {};
  }

  const colors: Record<string, string> = {};

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const landingDir = path.join(landingsDir, entry.name);
    
    // Read all theme*.json files (theme.json, theme-A.json, theme-B.json, etc.)
    let themeFiles: string[];
    try {
      const allFiles = fs.readdirSync(landingDir);
      themeFiles = allFiles.filter(f => f.match(/^theme.*\.json$/));
    } catch {
      continue;
    }

    for (const themeFileName of themeFiles) {
      const themeFile = path.join(landingDir, themeFileName);
      try {
        const raw = fs.readFileSync(themeFile, "utf-8");
        const theme: ThemeJson = JSON.parse(raw);

        if (theme.colors && typeof theme.colors === "object") {
          for (const [key, value] of Object.entries(theme.colors)) {
            if (!(key in colors)) {
              colors[key] = value || FALLBACK_COLOR;
            }
          }
        }
      } catch {
        // skip malformed files
      }
    }
  }

  return colors;
}

function generateThemeCSS(colors: Record<string, string>): string {
  const lines = Object.entries(colors)
    .sort(function (a, b) { return a[0].localeCompare(b[0]); })
    .map(function (pair) { return "  --color-" + pair[0] + ": " + pair[1] + ";"; });

  if (lines.length === 0) return "";

  return "@theme {\n" + lines.join("\n") + "\n}";
}

const MARKER_START = "/* @theme-collector:start */";
const MARKER_END = "/* @theme-collector:end */";
const PLACEHOLDER = "/* @theme-collector */";

function escapeForRegex(s: string): string {
  return s.replace(/[.*+?^${}()|\\[\]]/g, "\\$&");
}

export default function themeCollector(): Plugin {
  let projectRoot = "";
  let themeCSS = "";

  return {
    name: "vite-plugin-theme-collector",
    enforce: "pre",

    configResolved: function (config) {
      projectRoot = config.root;
    },

    buildStart: function () {
      const colors = collectThemeTokens(projectRoot);
      themeCSS = generateThemeCSS(colors);
      const count = Object.keys(colors).length;
      if (count > 0) {
        console.log("[theme-collector] Collected " + count + " color tokens from theme.json files");
      }
    },

    transform: function (code, id) {
      if (!id.endsWith(".css")) return null;

      const fencedPattern = escapeForRegex(MARKER_START) + "[\\s\\S]*?" + escapeForRegex(MARKER_END);
      const fencedRe = new RegExp(fencedPattern, "g");
      const replacement = MARKER_START + "\n" + themeCSS + "\n" + MARKER_END;

      if (fencedRe.test(code)) {
        return code.replace(new RegExp(fencedPattern, "g"), replacement);
      }

      if (code.includes(PLACEHOLDER)) {
        return code.replace(PLACEHOLDER, replacement);
      }

      return null;
    },

    handleHotUpdate: function (ctx) {
      const file = ctx.file;
      const server = ctx.server;
      if (file.endsWith("theme.json") && file.includes("/landings/")) {
        const colors = collectThemeTokens(projectRoot);
        themeCSS = generateThemeCSS(colors);
        console.log("[theme-collector] theme.json changed, refreshed " + Object.keys(colors).length + " tokens");
        server.ws.send({ type: "full-reload" });
      }
    },
  };
}
