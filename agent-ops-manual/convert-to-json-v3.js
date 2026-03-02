#!/usr/bin/env node

/**
 * Convert markdown chapters to structured JSON (v3)
 * Professional PDF layout system (Stripe/Linear style)
 */

const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

// Part structure from outline.md
const PARTS = {
  1: { title: "Identity & Registration", subtitle: "Weeks 1-2", chapters: [1, 2] },
  2: { title: "Infrastructure", subtitle: "Weeks 3-4", chapters: [3, 4, 5] },
  3: { title: "Agent Economy Operations", subtitle: "Weeks 5-6", chapters: [6, 7, 8] },
  4: { title: "Automation & Operations", subtitle: "Weeks 7-8", chapters: [9, 10, 11] },
  5: { title: "Development & Deployment", subtitle: "Weeks 9-10", chapters: [12, 13] },
  6: { title: "Revenue & Business", subtitle: "Weeks 11-12", chapters: [14, 15] },
  7: { title: "Advanced Patterns", subtitle: "Bonus", chapters: [16, 17, 18] }
};

function getPartForChapter(chapterNum) {
  for (const [partNum, part] of Object.entries(PARTS)) {
    if (part.chapters.includes(chapterNum)) {
      return {
        number: parseInt(partNum),
        title: part.title,
        subtitle: part.subtitle
      };
    }
  }
  return null;
}

function extractMetadata(markdown, filename) {
  const lines = markdown.split('\n');
  
  // Extract chapter number from filename
  const chapterMatch = filename.match(/chapter-(\d+)/);
  const chapterNumber = chapterMatch ? parseInt(chapterMatch[1]) : 0;
  
  // Extract main title (first H1)
  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : 'Untitled';
  
  // Extract subtitle (first H2)
  const subtitleMatch = markdown.match(/^##\s+(.+)$/m);
  const subtitle = subtitleMatch ? subtitleMatch[1] : null;
  
  // Extract excerpt (first paragraph after H2)
  const excerptMatch = markdown.match(/^##\s+.+\n\n(.+)/m);
  const excerpt = excerptMatch ? excerptMatch[1] : null;
  
  // Get part info
  const part = getPartForChapter(chapterNumber);
  
  return {
    chapterNumber,
    title,
    subtitle,
    excerpt,
    part,
    filename
  };
}

function transformDecisionSection(markdown) {
  // Detect "When to Register on Both" section and convert to split layout (Stripe-style)
  const sectionPattern = /## When to Register on Both\n\n([\s\S]*?)(?=\n##|$)/;
  const match = markdown.match(sectionPattern);
  
  if (!match) return markdown;
  
  const sectionContent = match[1];
  
  // Extract the three scenarios
  const seriousMatch = sectionContent.match(/\*\*If you're serious: Day 1\.\*\*\n\n([\s\S]*?)(?=\n\*\*If you're testing:|$)/);
  const testingMatch = sectionContent.match(/\*\*If you're testing: Week 2\.\*\*\n\n([\s\S]*?)(?=\n\*\*If you're|$)/);
  const waitingMatch = sectionContent.match(/\*\*If you're "waiting for the right time": Stop\.\*\*\n\n([\s\S]*?)(?=\n---|$)/);
  
  const serious = seriousMatch ? seriousMatch[1].trim() : '';
  const testing = testingMatch ? testingMatch[1].trim() : '';
  const waiting = waitingMatch ? waitingMatch[1].trim() : '';
  
  // Convert to markdown paragraphs for rendering
  const seriousMd = md.render(serious);
  const testingMd = md.render(testing);
  const waitingMd = md.render(waiting);
  
  // Create split layout HTML (Stripe-style)
  const splitHTML = `
<!-- Section Break (Full-Width) -->
<div class="section-break">
  <div class="section-break-line"></div>
  <h2 class="section-heading">When to Register on Both</h2>
</div>

<!-- Split Layout (Stripe-Style) -->
<div class="decision-split">
  
  <!-- Scenario 1: Serious / Day 1 -->
  <div class="decision-split-row">
    <div>
      <div class="decision-label">If you're serious</div>
      <div class="decision-timing">Day 1</div>
    </div>
    <div class="decision-content">
      ${seriousMd}
    </div>
  </div>
  
  <!-- Scenario 2: Testing / Week 2 -->
  <div class="decision-split-row">
    <div>
      <div class="decision-label">If you're testing</div>
      <div class="decision-timing">Week 2</div>
    </div>
    <div class="decision-content">
      ${testingMd}
    </div>
  </div>
  
  <!-- Scenario 3: Waiting / Never -->
  <div class="decision-split-row">
    <div>
      <div class="decision-label">If you're "waiting"</div>
      <div class="decision-timing">Never</div>
    </div>
    <div class="decision-content">
      ${waitingMd}
    </div>
  </div>
  
</div>
`;
  
  return markdown.replace(sectionPattern, splitHTML);
}

function convertChapterToJSON(filename) {
  const filepath = path.join(__dirname, filename);
  let markdown = fs.readFileSync(filepath, 'utf-8');
  
  // Transform decision sections before rendering
  markdown = transformDecisionSection(markdown);
  
  const metadata = extractMetadata(markdown, filename);
  const html = md.render(markdown);
  
  return {
    ...metadata,
    html
  };
}

async function main() {
  console.log('📖 Converting chapters to JSON (v3 - Professional PDF Layout)...\n');
  
  // Find all chapter files
  const chapterFiles = fs.readdirSync(__dirname)
    .filter(f => f.startsWith('chapter-') && f.endsWith('.md'))
    .sort();
  
  if (chapterFiles.length === 0) {
    console.error('❌ No chapter files found!');
    process.exit(1);
  }
  
  console.log(`Found ${chapterFiles.length} chapters`);
  
  // Convert each chapter
  const chapters = chapterFiles.map(file => {
    const chapter = convertChapterToJSON(file);
    console.log(`✓ Chapter ${chapter.chapterNumber}: ${chapter.title}`);
    return chapter;
  });
  
  // Group by parts
  const parts = {};
  chapters.forEach(chapter => {
    if (chapter.part) {
      const partNum = chapter.part.number;
      if (!parts[partNum]) {
        parts[partNum] = {
          number: partNum,
          title: chapter.part.title,
          subtitle: chapter.part.subtitle,
          chapters: []
        };
      }
      parts[partNum].chapters.push(chapter);
    }
  });
  
  // Create final structure
  const structure = {
    meta: {
      title: 'How AI Agents Make Money On-Chain',
      subtitle: 'The Playbook for Building, Operating, and Monetizing Autonomous Agents in Crypto',
      author: 'Mr. Tee',
      date: new Date().toISOString().split('T')[0],
      totalChapters: chapters.length,
      totalParts: Object.keys(parts).length
    },
    parts: Object.values(parts).sort((a, b) => a.number - b.number),
    chapters
  };
  
  // Save JSON
  const outputPath = path.join(__dirname, 'manual-structure.json');
  fs.writeFileSync(outputPath, JSON.stringify(structure, null, 2), 'utf-8');
  
  console.log(`\n✅ JSON structure saved: ${outputPath}`);
  console.log(`📊 ${chapters.length} chapters across ${Object.keys(parts).length} parts`);
  console.log(`🎯 Split layouts: ${chapters.filter(c => c.html.includes('decision-split')).length} found`);
}

main().catch(err => {
  console.error('❌ Conversion failed:', err.message);
  process.exit(1);
});
