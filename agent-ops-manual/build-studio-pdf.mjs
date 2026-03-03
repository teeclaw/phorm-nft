#!/usr/bin/env node
/**
 * Agent Operations Manual - Studio-Grade PDF Builder
 * Uses owner's professional PDF skill pack with Playwright
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parts structure
const PARTS = [
  { num: 1, title: "Identity & Registration", subtitle: "Weeks 1-2", chapters: [1, 2] },
  { num: 2, title: "Infrastructure", subtitle: "Weeks 3-4", chapters: [3, 4, 5] },
  { num: 3, title: "Agent Economy Operations", subtitle: "Weeks 5-6", chapters: [6, 7, 8] },
  { num: 4, title: "Automation & Operations", subtitle: "Weeks 7-8", chapters: [9, 10, 11] },
  { num: 5, title: "Development & Deployment", subtitle: "Weeks 9-10", chapters: [12, 13] },
  { num: 6, title: "Revenue & Business", subtitle: "Weeks 11-12", chapters: [14, 15, 16] },
  { num: 7, title: "Advanced Patterns", subtitle: "Bonus", chapters: [17, 18] }
];

async function buildStudioPDF() {
  console.log('🎨 Building Studio-Grade PDF with Playwright...\n');
  
  // Load chapters
  console.log('📖 Step 1: Loading chapters...');
  const chapters = [];
  
  // Find all chapter files (chapter-01.md through chapter-09.md)
  const chapterFiles = fs.readdirSync(__dirname)
    .filter(f => f.match(/^chapter-\d{2}\.md$/))
    .sort();
  
  for (const chapterFile of chapterFiles) {
    const fullPath = path.join(__dirname, chapterFile);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n');
    const title = lines.find(l => l.startsWith('# '))?.replace('# ', '') || chapterFile;
    
    // Extract chapter number from filename
    const match = chapterFile.match(/^chapter-(\d{2})\.md$/);
    const number = match ? parseInt(match[1], 10) : chapters.length + 1;
    
    chapters.push({
      number,
      title,
      content: lines.slice(1).join('\n').trim()
    });
  }
  
  console.log(`   ✓ Loaded ${chapters.length} chapters`);
  
  // Build HTML
  console.log('\n🎨 Step 2: Building HTML with studio template...');
  const html = buildHTML(chapters);
  
  // Save HTML preview
  const htmlPath = path.join(__dirname, 'studio-preview.html');
  fs.writeFileSync(htmlPath, html, 'utf-8');
  console.log(`   ✓ Preview saved: ${htmlPath}`);
  
  // Generate PDF with Playwright
  console.log('\n📦 Step 3: Generating PDF with Playwright...');
  
  const browser = await chromium.launch({
    headless: true
  });
  
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle' });
  
  const pdfPath = path.join(__dirname, 'agent-ops-manual-studio.pdf');
  
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: {
      top: '16mm',
      right: '16mm',
      bottom: '18mm',
      left: '16mm'
    }
  });
  
  await browser.close();
  
  // Stats
  const stats = fs.statSync(pdfPath);
  
  console.log(`\n✅ Studio PDF generated successfully!`);
  console.log(`   Output: ${pdfPath}`);
  console.log(`   Preview: ${htmlPath}`);
  console.log(`\n📊 Stats:`);
  console.log(`   Chapters: ${chapters.length}`);
  console.log(`   File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
}

function buildHTML(chapters) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>How AI Agents Make Money On-Chain</title>
  <script src="https://cdn.tailwindcss.com"></script>
  
  <style>
    @page {
      size: A4;
      margin: 16mm 16mm 18mm 16mm;
    }
    
    html, body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    .avoid-break {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    
    .page-break {
      break-before: page;
      page-break-before: always;
    }
    
    .prose-body {
      font-size: 15px;
      line-height: 1.65;
    }
  </style>
</head>

<body class="bg-white text-neutral-900">
  <main class="mx-auto max-w-[740px]">
    
    <!-- Cover -->
    <header class="page-break pt-16 pb-20">
      <div class="text-sm text-neutral-500 uppercase tracking-wide">Agent Operations Manual</div>
      <h1 class="mt-4 text-5xl font-bold tracking-tight leading-tight">
        Agent 18608<br/>Revenue Playbook
      </h1>
      <p class="mt-6 text-xl text-neutral-700 max-w-[65ch]">
        ~ what actually works to build onchain economy
      </p>
      <div class="mt-10 text-base text-neutral-600">
        9 Chapters on Identity, Infrastructure, Payments, and Scale
      </div>
      <div class="mt-12 text-sm text-neutral-500">
        <div>By Agent #18608 (Mr. Tee)</div>
        <div class="mt-1">March 2026</div>
      </div>
    </header>
    
    ${chapters.map((ch, idx) => renderChapter(ch, idx === 0)).join('\n')}
    
    <!-- Footer -->
    <footer class="mt-20 pb-8 text-sm text-neutral-500 text-center">
      Agent #18608 on ERC-8004 · a2a.teeclaw.xyz
    </footer>
    
  </main>
</body>
</html>`;
}

function renderChapter(chapter, isFirst) {
  // Simple markdown-to-HTML (basic version for now)
  const html = chapter.content
    .replace(/^## (.+)$/gm, '<h2 class="mt-10 text-2xl font-semibold tracking-tight">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="mt-8 text-lg font-semibold">$1</h3>')
    .replace(/^\* (.+)$/gm, '<li class="prose-body">$1</li>')
    .replace(/^- (.+)$/gm, '<li class="prose-body">$1</li>')
    .replace(/\n\n/g, '</p><p class="prose-body text-neutral-800">')
    .replace(/^([^<].+)$/gm, '<p class="prose-body text-neutral-800">$1</p>');
  
  return `
    <!-- Chapter ${chapter.number} -->
    <section class="${isFirst ? '' : 'page-break'} mt-16">
      <div class="h-px bg-neutral-200"></div>
      <div class="mt-8">
        <div class="text-sm text-neutral-500 uppercase tracking-wide">Chapter ${chapter.number}</div>
        <h1 class="mt-2 text-4xl font-bold tracking-tight">${chapter.title}</h1>
      </div>
      
      <div class="mt-8 space-y-4 max-w-[68ch]">
        ${html}
      </div>
    </section>
  `;
}

// Run
buildStudioPDF().catch(err => {
  console.error('\n❌ Build failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
