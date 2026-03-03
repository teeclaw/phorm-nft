---
name: studio-pdf
description: >
  Create professional, studio-grade PDF documents with bold editorial design quality.
  Use this skill whenever the user asks for a high-quality PDF, professional book,
  manual, playbook, report, ebook, whitepaper, or any multi-page document that needs
  magazine-quality layout. Also trigger when: "make it look professional", "studio grade",
  "publication quality", "book layout", "editorial design", or any request to transform
  markdown/text content into a beautifully designed PDF. This skill handles everything
  from single-page reports to full 300+ page books with cover pages, table of contents,
  styled code blocks, chapter openers, headers/footers, and custom typography.
  Do NOT use for simple PDF merging, splitting, or form-filling — those are basic PDF tasks.
---

# Studio-Grade PDF Creator

## Overview

This skill creates **publication-quality PDF documents** using Python's ReportLab library with custom typography, bold editorial design, and professional layout. The output rivals what you'd expect from a professional design studio or publishing house.

**What this skill produces:**
- Full books with cover, TOC, and chapter openers
- Professional reports and whitepapers
- Ebooks and manuals with editorial styling
- Single or multi-page designed documents
- Documents with styled code blocks, tables, and rich formatting

## Quick Start Workflow

```
1. Read this SKILL.md (you're doing it now)
2. Understand the user's content and desired style
3. Install dependencies (see below)
4. Read references/DESIGN-SYSTEM.md for the full design system
5. Use scripts/pdf_builder.py as your base template
6. Customize colors, fonts, and layout to match the request
7. Build the PDF and deliver
```

## Dependencies

**CRITICAL — Install these FIRST before any PDF generation:**

```bash
pip install reportlab --break-system-packages
```

ReportLab is the only required dependency. It's pre-installed in most environments but always verify.

Optional (for reading existing PDFs or advanced features):
```bash
pip install pypdf pdfplumber --break-system-packages
```

## Font Setup

This skill bundles professional fonts in `assets/fonts/`. The core font stack is:

| Role | Font | Fallback |
|------|------|----------|
| Display / Headings | BigShoulders-Bold | Helvetica-Bold |
| Body Text | Lora (Regular/Bold/Italic) | Times-Roman |
| UI / Labels | InstrumentSans (Regular/Bold/Italic) | Helvetica |
| Code | JetBrainsMono (Regular/Bold) | Courier |

**Font Registration Pattern:**
```python
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

FONT_DIR = "./assets/fonts"  # Adjust to your skill path

# Register individual fonts
pdfmetrics.registerFont(TTFont("Lora", f"{FONT_DIR}/Lora-Regular.ttf"))
pdfmetrics.registerFont(TTFont("Lora-Bold", f"{FONT_DIR}/Lora-Bold.ttf"))
pdfmetrics.registerFont(TTFont("Lora-Italic", f"{FONT_DIR}/Lora-Italic.ttf"))
pdfmetrics.registerFont(TTFont("Lora-BoldItalic", f"{FONT_DIR}/Lora-BoldItalic.ttf"))

# Register family so <b> and <i> tags work in Paragraphs
registerFontFamily('Lora',
    normal='Lora', bold='Lora-Bold',
    italic='Lora-Italic', boldItalic='Lora-BoldItalic')
```

If bundled fonts are not available, fall back to ReportLab built-ins (Helvetica, Times-Roman, Courier). The design will still work — just less distinctive.

## Design Principles

### 1. Bold Editorial Aesthetic
- **High contrast** — near-black text on white, with one strong accent color
- **Generous whitespace** — let content breathe
- **Typographic hierarchy** — clear distinction between heading levels
- **Accent restraint** — one primary accent color, used sparingly but boldly

### 2. Color Palette Structure
Every document needs exactly this palette:

```python
C_BLACK      = HexColor("#0A0A0A")    # Primary text
C_DARK_GRAY  = HexColor("#2D2D2D")    # Body text
C_MID_GRAY   = HexColor("#6B6B6B")    # Secondary text
C_LIGHT_GRAY = HexColor("#E8E8E8")    # Rules and borders
C_PALE       = HexColor("#F5F5F3")    # Alternate row backgrounds
C_WHITE      = HexColor("#FFFFFF")    # Page background
C_ACCENT     = HexColor("#FF3D00")    # Primary accent (customize per project)
C_CODE_BG    = HexColor("#1E1E2E")    # Dark code block background
C_CODE_TEXT  = HexColor("#CDD6F4")    # Code text color
```

Swap `C_ACCENT` to match the project's brand. Good options:
- `#FF3D00` — Bold red-orange (default, editorial)
- `#0066FF` — Corporate blue
- `#00BFA5` — Teal/crypto
- `#7C3AED` — Purple/tech
- `#F59E0B` — Amber/warm

### 3. Page Layout (US Letter)

```python
PAGE_W, PAGE_H = letter  # 612 x 792 points
MARGIN_LEFT   = 1.0 * inch  # 72pt
MARGIN_RIGHT  = 1.0 * inch
MARGIN_TOP    = 1.0 * inch
MARGIN_BOTTOM = 1.0 * inch
# Content area: 468pt wide × 636pt tall
```

### 4. Typography Scale

```
Display (cover title):     38pt BigShoulders-Bold
Chapter number:            72pt BigShoulders-Bold
Chapter title:             30pt BigShoulders-Bold
H2 sections:               20pt BigShoulders-Bold
H3 subsections:            13pt InstrumentSans-Bold
Body text:                 10.5pt Lora, 16pt leading
Code blocks:               8pt JetBrainsMono, 11.5pt leading
Headers/footers:           7.5pt InstrumentSans
```

## Document Architecture

Every studio-grade PDF follows this structure:

### Cover Page
Drawn entirely by the page template's `onPage` callback — no flowables needed.
- Full bleed background color (usually black or dark)
- Oversized decorative text element (e.g., a key number)
- Title in display font
- Subtitle in lighter weight
- Author/brand attribution
- Accent bars for visual rhythm

### Table of Contents
- "CONTENTS" heading in display font
- Numbered entries with accent-colored chapter numbers
- Light separator lines between entries
- Clean table layout with proper alignment

### Chapter Openers
Custom `Flowable` subclass that draws:
- Large 2-digit chapter number in accent color
- Accent bar separator
- Chapter title in display font
- Subtitle in secondary font

### Body Pages
- Header: chapter title (left) + book title (right)
- Content: paragraphs, bullets, code blocks, tables
- Footer: page number centered with decorative dots

## Key Components

### 1. Custom Flowables You Need

Read `references/DESIGN-SYSTEM.md` for complete implementation code. The essential custom flowables are:

| Flowable | Purpose |
|----------|---------|
| `HorizontalRule` | Styled separator line |
| `AccentBar` | Bold colored bar for visual breaks |
| `CodeBlock` | Dark-background code with syntax coloring |
| `ChapterOpener` | Large chapter number + title layout |
| `SetChapterAction` | Invisible — updates header/footer state |

### 2. Markdown-to-Flowables Parser

The parser converts markdown content into ReportLab flowables. It handles:
- H1/H2/H3 headings → styled Paragraphs
- `**bold**` and `*italic*` → `<b>` and `<i>` tags
- `` `inline code` `` → font-switched spans
- Fenced code blocks → CodeBlock flowables
- Bullet/numbered lists → indented Paragraphs with accent bullets
- Tables → styled Table flowables
- Horizontal rules → HorizontalRule flowables
- Checkboxes → accent-colored list items

**CRITICAL: Inline Formatting Safety**

When converting markdown inline formatting to ReportLab XML, you MUST:
1. Extract code spans FIRST (protect from bold/italic processing)
2. Extract links SECOND
3. Then process bold/italic
4. Restore code spans and links last

This prevents nested XML tag conflicts that crash ReportLab. See the `format_inline()` function in `scripts/pdf_builder.py`.

### 3. Page Templates

Use `BaseDocTemplate` with multiple `PageTemplate` objects:

```python
doc = BaseDocTemplate(output_path, pagesize=letter, ...)
doc.addPageTemplates([
    PageTemplate(id='cover',   frames=[frame], onPage=draw_cover),
    PageTemplate(id='toc',     frames=[frame], onPage=draw_toc_chrome),
    PageTemplate(id='chapter', frames=[frame], onPage=draw_chapter_chrome),
])
```

Switch between templates using `NextPageTemplate('template_id')` flowables.

### 4. Dynamic Header/Footer State

Headers must show the CURRENT chapter title, not the last one processed. Use a `SetChapterAction` flowable:

```python
class SetChapterAction(Flowable):
    def __init__(self, template_obj, chapter_text, chapter_num):
        Flowable.__init__(self)
        self.template = template_obj
        self.chapter_text = chapter_text
        self.chapter_num = chapter_num
        self.width = 0
        self.height = 0

    def wrap(self, aW, aH): return (0, 0)

    def draw(self):
        self.template.current_chapter = self.chapter_text
        self.template.current_chapter_num = self.chapter_num
```

Insert this flowable at the start of each chapter, AFTER the PageBreak.

## Step-by-Step Build Process

### For a Full Book (multiple chapters):

```
1. Register fonts
2. Define color palette
3. Create ParagraphStyles dict
4. Create page template handler class
5. Create BaseDocTemplate with cover/toc/chapter templates
6. Build story array:
   a. Cover page spacer + NextPageTemplate('toc') + PageBreak
   b. TOC heading + chapter list table rows
   c. For each chapter file:
      - NextPageTemplate('chapter') + PageBreak
      - SetChapterAction flowable
      - Parse markdown → flowables
      - Extend story
7. doc.build(story)
8. Copy to output directory
```

### For a Single Report/Whitepaper:

```
1. Register fonts
2. Define color palette
3. Same style setup but simpler templates (cover + body only)
4. Build story:
   a. Cover spacer + PageBreak
   b. Parse content → flowables
5. doc.build(story)
```

## Common Pitfalls

### 1. XML Tag Nesting Errors
**Problem:** ReportLab crashes with "saw </font> instead of expected </i>"
**Cause:** Markdown with `**text with `code` inside**` creates overlapping XML tags
**Fix:** Always extract code spans and links BEFORE processing bold/italic

### 2. Flowable Too Large for Frame
**Problem:** `LayoutError: Flowable too large on page`
**Cause:** A Spacer or Flowable exceeds the frame's available height
**Fix:** Never use `Spacer(1, PAGE_H)` — use `Spacer(1, 1)` for cover pages since the cover is drawn by onPage callback

### 3. All Pages Show Last Chapter's Header
**Problem:** Header shows "Chapter 18" on every page
**Cause:** Setting `template.current_chapter` in the build loop only sets the final value
**Fix:** Use `SetChapterAction` flowable to update state during rendering

### 4. Unicode Characters Rendering as Black Boxes
**Problem:** Special characters appear as solid rectangles
**Cause:** The registered TTF font doesn't contain those glyphs
**Fix:** Use ReportLab's `<sub>` and `<super>` tags instead of Unicode subscripts/superscripts. For other special chars, verify glyph coverage or use a different font.

### 5. Fonts Not Bold/Italic in Paragraphs
**Problem:** `<b>text</b>` doesn't render bold
**Cause:** Font family not registered
**Fix:** Use `registerFontFamily()` after registering individual font weights

## Customization Guide

### Changing the Style Mood

**Corporate / Conservative:**
- Accent: `#0066FF` (blue)
- Body font: swap Lora → IBM Plex Serif
- Headings: swap BigShoulders → InstrumentSans-Bold
- Reduce heading sizes by ~20%

**Tech / Modern:**
- Accent: `#7C3AED` (purple)
- Body font: InstrumentSans
- Headings: BigShoulders-Bold (keep)
- Use more code blocks and tables

**Crypto / Web3:**
- Accent: `#00BFA5` (teal) or `#FFB300` (gold)
- Dark cover background
- Monospace elements for addresses/hashes
- Keep editorial boldness

**Minimal / Clean:**
- Accent: `#000000` (just black)
- Reduce accent bar usage
- More whitespace
- Lighter separator lines

### Adding New Font Pairs

1. Place `.ttf` files in `assets/fonts/`
2. Register with `pdfmetrics.registerFont()`
3. Register family with `registerFontFamily()`
4. Update style definitions

Good free font sources: Google Fonts (fonts.google.com)

## File Reference

```
studio-pdf/
├── SKILL.md                          ← You are here
├── references/
│   └── DESIGN-SYSTEM.md              ← Full code for all components
├── scripts/
│   └── pdf_builder.py                ← Complete working template script
└── assets/
    └── fonts/                        ← Bundled TTF fonts
        ├── BigShoulders-Bold.ttf
        ├── BigShoulders-Regular.ttf
        ├── Lora-Regular.ttf
        ├── Lora-Bold.ttf
        ├── Lora-Italic.ttf
        ├── Lora-BoldItalic.ttf
        ├── InstrumentSans-Regular.ttf
        ├── InstrumentSans-Bold.ttf
        ├── InstrumentSans-Italic.ttf
        ├── InstrumentSans-BoldItalic.ttf
        ├── JetBrainsMono-Regular.ttf
        ├── JetBrainsMono-Bold.ttf
        ├── CrimsonPro-Regular.ttf
        ├── CrimsonPro-Bold.ttf
        └── CrimsonPro-Italic.ttf
```

**When to read what:**
- Start here (SKILL.md) — always
- `references/DESIGN-SYSTEM.md` — when you need the full component code
- `scripts/pdf_builder.py` — copy and customize as your starting point
