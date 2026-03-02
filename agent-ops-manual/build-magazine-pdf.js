#!/usr/bin/env node

/**
 * Agent Operations Manual - Magazine PDF Generator
 * New Pipeline: markdown → JSON (structured) → HTML magazine layout → PDF
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const Handlebars = require('handlebars');
const puppeteer = require('puppeteer');

async function buildMagazinePDF(testMode = false) {
  console.log('🎨 Building Magazine-Quality PDF...\n');
  
  // Step 1: Convert chapters to JSON (v3 with professional layout)
  console.log('📖 Step 1: Converting chapters to JSON (v3 - Professional PDF Layout)...');
  try {
    execSync('node convert-to-json-v3.js', { 
      cwd: __dirname,
      stdio: 'inherit'
    });
  } catch (err) {
    console.error('❌ JSON conversion failed');
    process.exit(1);
  }
  
  // Step 2: Load JSON structure
  console.log('\n📄 Step 2: Loading JSON structure...');
  const jsonPath = path.join(__dirname, 'manual-structure.json');
  
  if (!fs.existsSync(jsonPath)) {
    console.error('❌ manual-structure.json not found!');
    process.exit(1);
  }
  
  const structure = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`   ✓ Loaded ${structure.chapters.length} chapters across ${structure.parts.length} parts`);
  
  // Step 3: Filter for test mode (first 3 chapters)
  if (testMode) {
    console.log('\n🧪 TEST MODE: Using only first 3 chapters');
    structure.parts = structure.parts.filter(part => part.number === 1);
    structure.parts[0].chapters = structure.parts[0].chapters.slice(0, 2);
    structure.meta.totalChapters = 2;
    structure.meta.totalParts = 1;
  }
  
  // Step 4: Load magazine template (v3 professional layout)
  console.log('\n🎨 Step 3: Loading professional layout template...');
  const templatePath = path.join(__dirname, 'magazine-template-v3.hbs');
  
  if (!fs.existsSync(templatePath)) {
    console.error('❌ magazine-template-v3.hbs not found!');
    process.exit(1);
  }
  
  const templateSource = fs.readFileSync(templatePath, 'utf-8');
  const template = Handlebars.compile(templateSource);
  
  // Step 5: Render HTML
  console.log('\n🔄 Step 4: Rendering magazine HTML...');
  const fullHtml = template(structure);
  
  // Save HTML for debugging
  const htmlFilename = testMode ? 'magazine-test-preview.html' : 'magazine-preview.html';
  const htmlPath = path.join(__dirname, htmlFilename);
  fs.writeFileSync(htmlPath, fullHtml, 'utf-8');
  console.log(`   ✓ Preview saved: ${htmlPath}`);
  
  // Step 6: Generate PDF
  console.log('\n📦 Step 5: Generating PDF with Puppeteer...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
  
  const pdfFilename = testMode ? 'agent-ops-manual-test.pdf' : 'agent-ops-manual-magazine.pdf';
  const pdfPath = path.join(__dirname, pdfFilename);
  
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
    preferCSSPageSize: true,
    displayHeaderFooter: false
  });
  
  await browser.close();
  
  // Stats
  const stats = fs.statSync(pdfPath);
  
  console.log(`\n✅ Magazine PDF generated successfully!`);
  console.log(`   Output: ${pdfPath}`);
  console.log(`   Preview: ${htmlPath}`);
  console.log(`\n📊 Stats:`);
  console.log(`   Parts: ${structure.parts.length}`);
  console.log(`   Chapters: ${structure.meta.totalChapters}`);
  console.log(`   File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  
  if (testMode) {
    console.log(`\n🧪 Test PDF complete. Review before generating full version.`);
    console.log(`   To generate full PDF: node build-magazine-pdf.js --full`);
  }
}

// Parse args
const args = process.argv.slice(2);
const testMode = !args.includes('--full');

buildMagazinePDF(testMode).catch(err => {
  console.error('\n❌ Build failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
