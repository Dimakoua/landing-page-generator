#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LANDINGS_DIR = path.join(process.cwd(), 'src', 'landings');
const TEMPLATE_DIR = path.join(LANDINGS_DIR, '_template');

const slug = process.argv[2];

if (!slug) {
  console.error('Usage: npm run scaffold <slug>');
  process.exit(1);
}

const targetDir = path.join(LANDINGS_DIR, slug);

if (fs.existsSync(targetDir)) {
  console.error(`Error: Landing page "${slug}" already exists at ${targetDir}`);
  process.exit(1);
}

function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(child => {
      copyRecursive(path.join(src, child), path.join(dest, child));
    });
  } else {
    let content = fs.readFileSync(src, 'utf8');
    // Basic templating
    content = content.replace(/{{SLUG}}/g, slug);
    fs.writeFileSync(dest, content);
  }
}

console.log(`🚀 Scaffolding new landing page: ${slug}...`);
try {
  copyRecursive(TEMPLATE_DIR, targetDir);
  console.log(`✅ Created ${slug} successfully!`);
  console.log(`\nNext steps:`);
  console.log(`1. Edit src/landings/${slug}/theme.json to set colors.`);
  console.log(`2. Define your steps in src/landings/${slug}/flow.json.`);
  console.log(`3. Run 'npm run dev' and visit http://localhost:5173/${slug}`);
} catch (err) {
  console.error('Failed to scaffold:', err);
  process.exit(1);
}
