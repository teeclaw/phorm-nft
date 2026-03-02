#!/usr/bin/env node

/**
 * Agent Operations Manual - PDF Generator
 * Converts markdown chapters → HTML → PDF
 * Uses: markdown-it, handlebars, puppeteer
 */

const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');
const Handlebars = require('handlebars');
const puppeteer = require('puppeteer');

// Initialize markdown parser with code highlighting
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    // Basic syntax highlighting (can enhance later)
    return `<pre class="code-block language-${lang}"><code>${escapeHtml(str)}</code></pre>`;
  }
});

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function buildPDF() {
  console.log('🔨 Building Agent Operations Manual PDF...\n');

  // Step 1: Read all chapter files
  console.log('📖 Reading chapters...');
  const chapterFiles = fs.readdirSync(__dirname)
    .filter(f => f.startsWith('chapter-') && f.endsWith('.md'))
    .sort(); // Natural sort (chapter-01, chapter-02, etc.)

  if (chapterFiles.length === 0) {
    console.error('❌ No chapter files found!');
    process.exit(1);
  }

  console.log(`   Found ${chapterFiles.length} chapters`);

  // Step 2: Parse markdown to HTML
  console.log('\n🔄 Converting markdown to HTML...');
  const chapters = chapterFiles.map(file => {
    const content = fs.readFileSync(path.join(__dirname, file), 'utf-8');
    const html = md.render(content);
    
    // Extract title from first H1
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : file.replace(/\.md$/, '');
    
    console.log(`   ✓ ${file}`);
    return { title, html, filename: file };
  });

  // Step 3: Load HTML template
  console.log('\n📄 Loading HTML template...');
  const templatePath = path.join(__dirname, 'template.hbs');
  
  if (!fs.existsSync(templatePath)) {
    console.error('❌ template.hbs not found! Creating default template...');
    createDefaultTemplate(templatePath);
  }

  const templateSource = fs.readFileSync(templatePath, 'utf-8');
  const template = Handlebars.compile(templateSource);

  // Step 4: Render full HTML
  console.log('\n🎨 Rendering HTML...');
  const fullHtml = template({
    title: 'How AI Agents Make Money On-Chain',
    subtitle: 'From Zero to Paid Services in 60 Days',
    author: 'Mr. Tee',
    date: new Date().toISOString().split('T')[0],
    chapters: chapters
  });

  // Save HTML for debugging
  const htmlPath = path.join(__dirname, 'manual-preview.html');
  fs.writeFileSync(htmlPath, fullHtml, 'utf-8');
  console.log(`   ✓ Preview saved: ${htmlPath}`);

  // Step 5: Generate PDF with Puppeteer
  console.log('\n📦 Generating PDF...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

  const pdfPath = path.join(__dirname, 'agent-ops-manual.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    margin: {
      top: '20mm',
      right: '15mm',
      bottom: '20mm',
      left: '15mm'
    },
    printBackground: true,
    preferCSSPageSize: true
  });

  await browser.close();

  console.log(`\n✅ PDF generated successfully!`);
  console.log(`   Output: ${pdfPath}`);
  console.log(`   Preview: ${htmlPath}`);

  // Stats
  const stats = fs.statSync(pdfPath);
  console.log(`\n📊 Stats:`);
  console.log(`   Chapters: ${chapters.length}`);
  console.log(`   File size: ${(stats.size / 1024).toFixed(1)} KB`);
}

function createDefaultTemplate(templatePath) {
  const defaultTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
  <style>
    /* DESIGN-SYSTEM.md compliance */
    :root {
      --color-bg-primary: #ffffff;
      --color-text-primary: #1f2937;
      --color-text-secondary: #6b7280;
      --color-accent-primary: #3b82f6;
      --font-sans: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      --font-serif: Merriweather, Georgia, serif;
      --font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: var(--font-serif);
      font-size: 11pt;
      line-height: 1.6;
      color: var(--color-text-primary);
      background: var(--color-bg-primary);
    }

    /* Cover page */
    .cover {
      page-break-after: always;
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 2rem;
    }

    .cover h1 {
      font-family: var(--font-sans);
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: var(--color-accent-primary);
    }

    .cover .subtitle {
      font-family: var(--font-sans);
      font-size: 1.5rem;
      color: var(--color-text-secondary);
      margin-bottom: 3rem;
    }

    .cover .author {
      font-size: 1.2rem;
      margin-top: 2rem;
    }

    /* Chapter styling */
    .chapter {
      page-break-before: always;
      padding: 2rem 0;
    }

    h1, h2, h3, h4, h5, h6 {
      font-family: var(--font-sans);
      font-weight: 700;
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
      page-break-after: avoid;
    }

    h1 { font-size: 2rem; color: var(--color-accent-primary); }
    h2 { font-size: 1.5rem; }
    h3 { font-size: 1.25rem; }
    h4 { font-size: 1.1rem; }

    p {
      margin-bottom: 1rem;
      orphans: 3;
      widows: 3;
    }

    /* Code blocks */
    .code-block {
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      padding: 1rem;
      margin: 1rem 0;
      overflow-x: auto;
      font-family: var(--font-mono);
      font-size: 9pt;
      line-height: 1.5;
      page-break-inside: avoid;
    }

    code {
      font-family: var(--font-mono);
      background: #f3f4f6;
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-size: 0.9em;
    }

    pre code {
      background: none;
      padding: 0;
    }

    /* Lists */
    ul, ol {
      margin: 1rem 0 1rem 2rem;
    }

    li {
      margin-bottom: 0.5rem;
    }

    /* Links */
    a {
      color: var(--color-accent-primary);
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
      page-break-inside: avoid;
    }

    th, td {
      padding: 0.75rem;
      border: 1px solid #e5e7eb;
      text-align: left;
    }

    th {
      background: #f3f4f6;
      font-weight: 600;
    }

    /* Print optimization */
    @media print {
      body {
        font-size: 10pt;
      }

      .cover {
        height: 297mm; /* A4 height */
      }

      .chapter {
        page-break-before: always;
      }

      a {
        color: inherit;
        text-decoration: underline;
      }

      .code-block {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <!-- Cover Page -->
  <div class="cover">
    <h1>{{title}}</h1>
    <div class="subtitle">{{subtitle}}</div>
    <div class="author">By {{author}}</div>
    <div class="date">{{date}}</div>
  </div>

  <!-- Chapters -->
  {{#each chapters}}
  <div class="chapter">
    {{{this.html}}}
  </div>
  {{/each}}
</body>
</html>`;

  fs.writeFileSync(templatePath, defaultTemplate, 'utf-8');
  console.log('   ✓ Created default template.hbs');
}

// Run build
buildPDF().catch(err => {
  console.error('\n❌ Build failed:', err.message);
  process.exit(1);
});
