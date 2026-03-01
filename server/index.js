import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { GeminiAdapter } from './GeminiAdapter.js';
import { RateLimiter } from './RateLimiter.js';
import { 
  ANALYZE_SYSTEM_PROMPT, 
  getAnalyzeUserPrompt, 
  GENERATE_COMPONENT_SYSTEM_PROMPT, 
  getGenerateComponentUserPrompt 
} from './prompts.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

const app = express();
const port = process.env.DEV_SERVER_PORT || 3001;

app.use(cors());
app.use(express.json());

const gemini = new GeminiAdapter(process.env.GEMINI_API_KEY);
const limiter = new RateLimiter({ rpm: 3, bufferFactor: 1.2 });

const sessions = new Map();

if (process.env.NODE_ENV === 'production') {
  console.error('ERROR: Dev server should not run in production!');
  process.exit(1);
}

app.post('/api/dev/scrape', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  let browser;
  try {
    browser = await chromium.launch();
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      locale: 'en-US',
      extraHTTPHeaders: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    const page = await context.newPage();
    await page.setViewportSize({ width: 1280, height: 800 });

    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    if (response && response.status() === 403) throw new Error('Access Forbidden (403)');

    const pageInfo = await page.evaluate(() => {
      const getComputedStyle = (el) => window.getComputedStyle(el);
      
      // Extract CSS Variables
      const getVars = (el) => {
        const vars = {};
        const style = el.getAttribute('style') || '';
        const matches = style.matchAll(/--([\w-]+):\s*([^;]+)/g);
        for (const m of matches) vars[m[1]] = m[2].trim();
        return vars;
      };

      const rootVars = getVars(document.documentElement);
      const bodyVars = getVars(document.body);
      const allVars = { ...rootVars, ...bodyVars };

      // Better color extraction
      const colorCounts = {};
      const bgColorCounts = {};
      
      document.querySelectorAll('*').forEach(el => {
        if (el.children.length > 5) return; // Skip containers
        const style = getComputedStyle(el);
        if (style.color && style.color !== 'rgba(0, 0, 0, 0)') {
          colorCounts[style.color] = (colorCounts[style.color] || 0) + 1;
        }
        if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent') {
          bgColorCounts[style.backgroundColor] = (bgColorCounts[style.backgroundColor] || 0) + 1;
        }
      });

      const getDominant = (counts) => Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(e => e[0]);

      const bodyStyle = getComputedStyle(document.body);
      const h1Style = getComputedStyle(document.querySelector('h1') || document.body);

      return {
        title: document.title,
        theme: {
          colors: {
            primary: allVars['color-primary'] || allVars['primary'] || getDominant(bgColorCounts)[0],
            secondary: allVars['color-secondary'] || allVars['secondary'] || getDominant(bgColorCounts)[1],
            background: bodyStyle.backgroundColor,
            text: bodyStyle.color,
          },
          fonts: {
            display: h1Style.fontFamily,
            body: bodyStyle.fontFamily,
          },
          vars: allVars
        }
      };
    });

    const sections = await page.evaluate((baseUrl) => {
      const results = [];
      const resolveUrl = (url) => {
        if (!url || url.startsWith('data:') || url.startsWith('blob:')) return url;
        try { return new URL(url, baseUrl).href; } catch (e) { return url; }
      };

      const simplifyHtml = (el) => {
        const clone = el.cloneNode(true);
        // Remove scripts, styles, and large SVGs content
        clone.querySelectorAll('script, style, link, noscript').forEach(e => e.remove());
        clone.querySelectorAll('svg').forEach(svg => {
          // Keep the SVG tag but clear the path data if it's too long
          if (svg.innerHTML.length > 500) svg.innerHTML = '<path d="...truncated..."/>';
        });
        // Remove comments
        const iterator = document.createNodeIterator(clone, NodeFilter.SHOW_COMMENT);
        let node;
        while (node = iterator.nextNode()) node.remove();
        
        return clone.outerHTML.substring(0, 5000);
      };

      const isSection = (el) => {
        const semanticTags = ['SECTION', 'HEADER', 'FOOTER', 'NAV', 'MAIN', 'ARTICLE'];
        if (semanticTags.includes(el.tagName)) return true;
        
        const id = el.id?.toLowerCase() || '';
        const className = typeof el.className === 'string' ? el.className.toLowerCase() : '';
        
        if (id === 'root' || id === 'app' || id === '__next' || className.includes('app-container')) return false;
        
        if (el.tagName === 'DIV') {
          // If it contains semantic tags, it's a container, not the section itself
          if (el.querySelector('section, header, footer, nav, main, article')) return false;
          // Heuristic: large enough div with content
          const rect = el.getBoundingClientRect();
          return rect.height > 150 && el.innerText.trim().length > 20;
        }
        return false;
      };

      const processElement = (el) => {
        if (window.getComputedStyle(el).display === 'none') return;
        
        if (isSection(el)) {
          const style = window.getComputedStyle(el);
          const images = [];
          el.querySelectorAll('img').forEach(img => { 
            if (img.src) images.push({ src: resolveUrl(img.src), alt: img.alt, width: img.naturalWidth, height: img.naturalHeight }); 
          });
          
          if (style.backgroundImage !== 'none') {
            const matches = style.backgroundImage.matchAll(/url\(['"]?(.*?)['"]?\)/g);
            for (const m of matches) {
              if (m[1]) images.push({ src: resolveUrl(m[1]), type: 'background' });
            }
          }

          // Find first heading for a better section title
          const heading = el.querySelector('h1, h2, h3, h4');
          
          // Detect JS Features (Sliders, Accordions, etc.)
          const features = [];
          const htmlStr = el.innerHTML.toLowerCase();
          const classStr = typeof el.className === 'string' ? el.className.toLowerCase() : '';
          
          if (htmlStr.includes('swiper') || htmlStr.includes('slick') || htmlStr.includes('slider') || htmlStr.includes('carousel')) {
            features.push('has-slider');
          }
          if (htmlStr.includes('accordion') || htmlStr.includes('collapse')) {
            features.push('has-accordion');
          }
          if (style.animationName !== 'none' || style.transitionProperty !== 'none') {
            features.push('has-animation');
          }

          results.push({
            id: `section-${results.length}`,
            tagName: el.tagName.toLowerCase(),
            originalTitle: heading?.innerText.trim() || `Section ${results.length}`,
            innerText: el.innerText.substring(0, 1500),
            htmlSnippet: simplifyHtml(el),
            features,
            styles: {
              backgroundColor: style.backgroundColor,
              color: style.color,
              padding: style.padding,
              margin: style.margin,
              display: style.display,
              flexDirection: style.flexDirection,
              alignItems: style.alignItems,
              justifyContent: style.justifyContent,
              gap: style.gap,
              textAlign: style.textAlign,
              borderRadius: style.borderRadius,
              boxShadow: style.boxShadow,
              fontSize: style.fontSize,
              fontWeight: style.fontWeight,
              lineHeight: style.lineHeight,
              maxWidth: style.maxWidth,
              minHeight: style.minHeight,
              // Animations
              animationName: style.animationName,
              animationDuration: style.animationDuration,
              animationTimingFunction: style.animationTimingFunction,
              transitionProperty: style.transitionProperty,
              transitionDuration: style.transitionDuration,
              opacity: style.opacity,
              transform: style.transform,
            },
            images
          });
          return;
        }
        Array.from(el.children).forEach(child => processElement(child));
      };

      processElement(document.body);
      return results;
    }, url);

    res.json({ ...pageInfo, sections, sourceUrl: url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (browser) await browser.close();
  }
});

app.post('/api/dev/analyze', async (req, res) => {
  const { title, theme, sections } = req.body;
  try {
    const result = await limiter.schedule(() => gemini.generateJSON(ANALYZE_SYSTEM_PROMPT, getAnalyzeUserPrompt(title, theme, sections)));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Generation Endpoint with Resume Support
 */
app.post('/api/dev/generate', async (req, res) => {
  const { theme, mappings, sourceUrl, sessionId: existingSessionId } = req.body;

  let session;
  if (existingSessionId && sessions.has(existingSessionId)) {
    session = sessions.get(existingSessionId);
    console.log(`[Wizard] Resuming session: ${existingSessionId}`);
    session.status = 'processing';
    session.error = null;
  } else {
    if (!mappings || !Array.isArray(mappings)) return res.status(400).json({ error: 'Mappings are required' });
    
    const sessionId = Math.random().toString(36).substring(2, 11);
    const tasks = [
      { id: 'init', name: 'Initialize project structure', status: 'pending' },
      { id: 'configs', name: 'Generate JSON configurations', status: 'pending' }
    ];
    mappings.forEach(m => {
      if (m.isNew) tasks.push({ id: `comp-${m.sectionId}`, name: `Generate component for ${m.sectionId}`, status: 'pending' });
    });
    tasks.push({ id: 'flush', name: 'Write files to disk', status: 'pending' });

    session = { 
      id: sessionId, 
      status: 'processing', 
      tasks, 
      result: null, 
      error: null,
      fileBuffer: new Map() // Persist files in session
    };
    sessions.set(sessionId, session);
  }

  runGeneration(session, theme, mappings, sourceUrl).catch(err => {
    session.status = 'failed';
    session.error = err.message;
  });

  res.json({ sessionId: session.id });
});

app.get('/api/dev/generate/status/:sessionId', (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json(session);
});

/**
 * Safety Net: AI often misses camelCase React/SVG attributes.
 */
function sanitizeReactCode(code) {
  if (!code) return code;
  return code
    .replace(/\s+stroke-linecap=/g, ' strokeLinecap=')
    .replace(/\s+stroke-linejoin=/g, ' strokeLinejoin=')
    .replace(/\s+stroke-width=/g, ' strokeWidth=')
    .replace(/\s+fill-rule=/g, ' fillRule=')
    .replace(/\s+clip-rule=/g, ' clipRule=')
    .replace(/\s+stop-color=/g, ' stopColor=')
    .replace(/\s+stop-opacity=/g, ' stopOpacity=')
    .replace(/\s+tabindex=/g, ' tabIndex=')
    .replace(/\s+class=/g, ' className=')
    .replace(/\s+for=/g, ' htmlFor=')
    .replace(/\s+srcset=/g, ' srcSet=');
}

async function runGeneration(session, theme, mappings, sourceUrl) {
  const getTask = (id) => session.tasks.find(t => t.id === id);
  const updateTask = (id, status) => {
    const task = getTask(id);
    if (task) task.status = status;
  };

  try {
    const urlObj = new URL(sourceUrl);
    const slug = urlObj.hostname.replace(/\./g, '-');
    const landingPath = path.join(PROJECT_ROOT, 'src', 'landings', slug);
    const stepsPath = path.join(landingPath, 'steps', 'home');

    // 1. Init
    if (getTask('init').status !== 'done') {
      updateTask('init', 'processing');
      await fs.mkdir(landingPath, { recursive: true });
      await fs.mkdir(stepsPath, { recursive: true });
      updateTask('init', 'done');
    }

    // 2. Configs
    if (getTask('configs').status !== 'done') {
      updateTask('configs', 'processing');
      const themeJson = {
        colors: { 
          primary: theme.colors?.primary || "#3b82f6", 
          secondary: theme.colors?.secondary || "#64748b", 
          background: theme.colors?.background || "#ffffff", 
          text: theme.colors?.text || "#0f172a" 
        },
        fonts: { 
          display: theme.fonts?.display || "ui-sans-serif, system-ui, sans-serif", 
          body: theme.fonts?.body || "ui-sans-serif, system-ui, sans-serif" 
        },
        radius: { button: "0.5rem", card: "0.75rem" }
      };
      session.fileBuffer.set(path.join(landingPath, 'theme.json'), JSON.stringify(themeJson, null, 2));
      session.fileBuffer.set(path.join(landingPath, 'flow.json'), JSON.stringify({ steps: [{ id: "home", type: "normal", layout: null }], initialStepId: "home" }, null, 2));

      const layout = {
        sections: mappings.map(m => {
          const cleanId = m.sectionId.replace(/[^a-zA-Z0-9]/g, '');
          const pascalId = cleanId.charAt(0).toUpperCase() + cleanId.slice(1);
          const componentName = m.isNew ? `Auto${m.suggestedComponent}${pascalId}` : m.suggestedComponent;
          return { id: m.sectionId, component: componentName, props: m.props || { title: m.originalTitle }, actions: m.actions || {} };
        })
      };
      session.fileBuffer.set(path.join(stepsPath, 'desktop.json'), JSON.stringify(layout, null, 2));
      session.fileBuffer.set(path.join(stepsPath, 'mobile.json'), JSON.stringify(layout, null, 2));
      updateTask('configs', 'done');
    }

    // 3. Components
    for (const m of mappings) {
      if (m.isNew) {
        const taskId = `comp-${m.sectionId}`;
        if (getTask(taskId).status === 'done') continue;

        updateTask(taskId, 'processing');
        const cleanId = m.sectionId.replace(/[^a-zA-Z0-9]/g, '');
        const pascalId = cleanId.charAt(0).toUpperCase() + cleanId.slice(1);
        const componentName = `Auto${m.suggestedComponent}${pascalId}`;
        const componentPath = path.join(PROJECT_ROOT, 'src', 'components', 'wizard', `${componentName}.tsx`);
        
        try {
          const codeResponse = await limiter.schedule(() => gemini.generateJSON(GENERATE_COMPONENT_SYSTEM_PROMPT, getGenerateComponentUserPrompt(componentName, m.suggestedComponent, m.props, m.htmlSnippet, m.originalStyles, m.features)));
          session.fileBuffer.set(componentPath, sanitizeReactCode(codeResponse.code));
          updateTask(taskId, 'done');
        } catch (err) {
          // If a component fails, we stop the loop so the user can retry this specific task
          updateTask(taskId, 'failed');
          throw new Error(`AI generation failed for ${componentName}: ${err.message}`);
        }
      }
    }

    // 4. Signal READY for redirect
    session.status = 'ready';
    session.result = { slug, path: `/${slug}` };
    console.log(`[Wizard] Session ${session.id} is READY. Waiting for redirect before flush...`);

    // Wait 3 seconds to give the browser time to navigate away 
    // before the filesystem changes trigger a Vite reload.
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 5. Flush
    if (getTask('flush').status !== 'done') {
      updateTask('flush', 'processing');
      for (const [filePath, content] of session.fileBuffer) {
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, content);
      }
      updateTask('flush', 'done');
    }

    session.status = 'complete';
  } catch (err) {
    session.status = 'failed';
    session.error = err.message;
    throw err;
  }
}

const server = app.listen(port, () => console.log(`Dev backend listening at http://localhost:${port}`));
server.timeout = 300000;
