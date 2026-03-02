#!/usr/bin/env node

/**
 * Convert markdown chapters to structured JSON
 * Extracts: chapter number, title, part, content, metadata
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

function extractPullQuotes(markdown) {
  // Find bold statements that work as pull quotes
  const boldPattern = /\*\*(.{30,120})\*\*/g;
  const quotes = [];
  let match;
  
  while ((match = boldPattern.exec(markdown)) !== null) {
    const quote = match[1];
    // Skip if it's a heading or list item
    if (!quote.match(/^(Chapter|Part|\d+\.|•|-)/)) {
      quotes.push(quote);
    }
  }
  
  return quotes.slice(0, 3); // Max 3 pull quotes per chapter
}

function convertChapterToJSON(filename) {
  const filepath = path.join(__dirname, filename);
  const markdown = fs.readFileSync(filepath, 'utf-8');
  
  const metadata = extractMetadata(markdown, filename);
  const pullQuotes = extractPullQuotes(markdown);
  const html = md.render(markdown);
  
  return {
    ...metadata,
    pullQuotes,
    html
  };
}

async function main() {
  console.log('📖 Converting chapters to JSON...\n');
  
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
}

main().catch(err => {
  console.error('❌ Conversion failed:', err.message);
  process.exit(1);
});
