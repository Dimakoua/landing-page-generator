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
const limiter = new RateLimiter({ rpm: 3, bufferFactor: 1.2 }); // 1.2 for safety

// In-memory session store for generation progress
const sessions = new Map();

// Dev-only gate
if (process.env.NODE_ENV === 'production') {
  console.error('ERROR: Dev server should not run in production!');
  process.exit(1);
}

app.post('/api/dev/scrape', async (req, res) => {
  console.log('POST /api/dev/scrape - Body:', req.body);
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

    console.log(`Scraping: ${url}`);
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

    if (response && response.status() === 403) {
      throw new Error('Access Forbidden (403). The site might be blocking automated scrapers.');
    }

    const pageInfo = await page.evaluate(() => {
      const getComputedStyle = (el) => window.getComputedStyle(el);
      const bodyStyle = getComputedStyle(document.body);
      const primaryColors = new Set();
      document.querySelectorAll('h1, h2, h3, button, a').forEach(el => {
        const style = getComputedStyle(el);
        primaryColors.add(style.color);
        primaryColors.add(style.backgroundColor);
      });
      return {
        title: document.title,
        colors: Array.from(primaryColors).filter(c => c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent'),
        fontFamily: bodyStyle.fontFamily,
      };
    });

    const sections = await page.evaluate((baseUrl) => {
      const results = [];
      const resolveUrl = (url) => {
        if (!url || url.startsWith('data:') || url.startsWith('blob:')) return url;
        try { return new URL(url, baseUrl).href; } catch (e) { return url; }
      };
      const isSection = (el) => {
        const semanticTags = ['SECTION', 'HEADER', 'FOOTER', 'NAV', 'MAIN', 'ARTICLE'];
        if (semanticTags.includes(el.tagName)) return true;
        const id = el.id?.toLowerCase() || '';
        const className = typeof el.className === 'string' ? el.className.toLowerCase() : '';
        const isRootContainer = id === 'root' || id === 'app' || id === '__next' || className.includes('app-container') || className.includes('layout-wrapper');
        if (isRootContainer) return false;
        if (el.tagName === 'DIV') {
          const hasSemanticChild = el.querySelector('section, header, footer, nav, main, article');
          if (hasSemanticChild) return false;
          const rect = el.getBoundingClientRect();
          return rect.height > 100 && el.innerText.trim().length > 0;
        }
        return false;
      };
      const processElement = (el) => {
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') return;
        if (isSection(el)) {
          const images = [];
          el.querySelectorAll('img').forEach(img => { if (img.src) images.push({ src: resolveUrl(img.src), alt: img.alt }); });
          const bgImg = style.backgroundImage;
          if (bgImg && bgImg !== 'none') {
            const match = bgImg.match(/url\("(.*)"\)/);
            if (match) images.push({ src: resolveUrl(match[1]), type: 'background' });
          }
          results.push({
            id: `section-${results.length}`,
            tagName: el.tagName.toLowerCase(),
            className: el.className,
            innerText: el.innerText.substring(0, 1000),
            htmlSnippet: el.outerHTML.substring(0, 3000),
            styles: {
              backgroundColor: style.backgroundColor,
              color: style.color,
              padding: style.padding,
              backgroundImage: style.backgroundImage !== 'none' ? resolveUrl(style.backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/i, '$1')) : null,
              textAlign: style.textAlign,
              display: style.display,
              flexDirection: style.flexDirection,
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
    console.error('Scrape error:', error);
    res.status(500).json({ error: `Failed to scrape: ${error.message}` });
  } finally {
    if (browser) await browser.close();
  }
});

app.post('/api/dev/analyze', async (req, res) => {
  const { title, colors, fontFamily, sections } = req.body;
  if (!sections || !Array.isArray(sections)) return res.status(400).json({ error: 'Sections are required' });

  const systemPrompt = ANALYZE_SYSTEM_PROMPT;
  const userPrompt = getAnalyzeUserPrompt(title, colors, fontFamily, sections);

  try {
    const result = await limiter.schedule(() => gemini.generateJSON(systemPrompt, userPrompt));
    res.json(result);
  } catch (error) {
    console.error('AI Analysis error:', error);
    res.status(500).json({ error: `AI Analysis failed: ${error.message}` });
  }
});

/**
 * Generation Endpoint (Session-based)
 */
app.post('/api/dev/generate', async (req, res) => {
  const { theme, mappings, sourceUrl } = req.body;
  if (!mappings || !Array.isArray(mappings)) return res.status(400).json({ error: 'Mappings are required' });

  const sessionId = Math.random().toString(36).substring(2, 11);
  const tasks = [];

  // Prepare task list for UI
  tasks.push({ id: 'init', name: 'Initialize project structure', status: 'pending' });
  tasks.push({ id: 'configs', name: 'Generate JSON configurations', status: 'pending' });
  mappings.forEach(m => {
    if (m.isNew) {
      tasks.push({ id: `comp-${m.sectionId}`, name: `Generate component for ${m.sectionId}`, status: 'pending' });
    }
  });
  tasks.push({ id: 'flush', name: 'Write files to disk', status: 'pending' });

  const session = {
    id: sessionId,
    status: 'processing',
    tasks,
    result: null,
    error: null
  };
  sessions.set(sessionId, session);

  // Start background process
  runGeneration(session, theme, mappings, sourceUrl).catch(err => {
    console.error(`Session ${sessionId} failed:`, err);
    session.status = 'failed';
    session.error = err.message;
  });

  res.json({ sessionId });
});

app.get('/api/dev/generate/status/:sessionId', (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json(session);
});

async function runGeneration(session, theme, mappings, sourceUrl) {
  const updateTask = (id, status) => {
    const task = session.tasks.find(t => t.id === id);
    if (task) task.status = status;
  };

  try {
    const urlObj = new URL(sourceUrl);
    const slug = urlObj.hostname.replace(/\./g, '-');
    const landingPath = path.join(PROJECT_ROOT, 'src', 'landings', slug);
    const stepsPath = path.join(landingPath, 'steps', 'home');
    
    const fileBuffer = new Map(); // path -> content

    updateTask('init', 'processing');
    updateTask('init', 'done');

    updateTask('configs', 'processing');
    const themeJson = {
      colors: { primary: theme.primaryColor, secondary: "#64748b", background: "#ffffff", text: "#0f172a" },
      fonts: { display: theme.fontFamily, body: theme.fontFamily },
      radius: { button: "0.5rem", card: "0.75rem" }
    };
    fileBuffer.set(path.join(landingPath, 'theme.json'), JSON.stringify(themeJson, null, 2));

    const flowJson = { steps: [{ id: "home", type: "normal", layout: null }], initialStepId: "home" };
    fileBuffer.set(path.join(landingPath, 'flow.json'), JSON.stringify(flowJson, null, 2));

    const layout = {
      sections: mappings.map(m => {
        // PASCAL CASE CONVERSION: Auto + SuggestedComponent + SectionId (cleaned)
        // Example: AutoHeroSection0
        const cleanId = m.sectionId.replace(/[^a-zA-Z0-9]/g, '');
        const pascalId = cleanId.charAt(0).toUpperCase() + cleanId.slice(1);
        const componentName = m.isNew ? `Auto${m.suggestedComponent}${pascalId}` : m.suggestedComponent;

        return {
          id: m.sectionId,
          component: componentName,
          props: m.props || { title: m.originalTitle },
          actions: m.actions || {}
        };
      })
    };
    fileBuffer.set(path.join(stepsPath, 'desktop.json'), JSON.stringify(layout, null, 2));
    fileBuffer.set(path.join(stepsPath, 'mobile.json'), JSON.stringify(layout, null, 2));
    updateTask('configs', 'done');

    // Generate components
    for (const m of mappings) {
      if (m.isNew) {
        const taskId = `comp-${m.sectionId}`;
        updateTask(taskId, 'processing');
        
        const cleanId = m.sectionId.replace(/[^a-zA-Z0-9]/g, '');
        const pascalId = cleanId.charAt(0).toUpperCase() + cleanId.slice(1);
        const componentName = `Auto${m.suggestedComponent}${pascalId}`;
        const componentPath = path.join(PROJECT_ROOT, 'src', 'components', 'wizard', `${componentName}.tsx`);
        
        const systemPrompt = GENERATE_COMPONENT_SYSTEM_PROMPT;
        const userPrompt = getGenerateComponentUserPrompt(componentName, m.suggestedComponent, m.props);

        const codeResponse = await limiter.schedule(() => gemini.generateJSON(systemPrompt, userPrompt));
        fileBuffer.set(componentPath, codeResponse.code);
        updateTask(taskId, 'done');
      }
    }

    // Flush to disk
    updateTask('flush', 'processing');
    for (const [filePath, content] of fileBuffer) {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, content);
    }
    updateTask('flush', 'done');

    session.status = 'complete';
    session.result = { slug, path: `/${slug}` };
  } catch (err) {
    session.status = 'failed';
    session.error = err.message;
    throw err;
  }
}

const server = app.listen(port, () => {
  console.log(`Dev backend listening at http://localhost:${port}`);
});
server.timeout = 300000;
