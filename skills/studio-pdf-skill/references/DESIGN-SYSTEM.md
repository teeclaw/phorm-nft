# Design System Reference

Complete implementation code for all studio-grade PDF components. Copy what you need into your build script.

## Table of Contents

1. [Font Registration](#font-registration)
2. [Color Palette](#color-palette)
3. [Paragraph Styles](#paragraph-styles)
4. [Custom Flowables](#custom-flowables)
5. [Markdown Parser](#markdown-parser)
6. [Page Templates](#page-templates)
7. [Cover Page Designs](#cover-page-designs)
8. [Table Builder](#table-builder)
9. [Full Document Assembly](#full-document-assembly)

---

## Font Registration

```python
import os
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

def register_fonts(font_dir):
    """
    Register all bundled fonts. Call once at startup.
    font_dir: path to the assets/fonts/ directory
    """
    fonts = {
        "BigShoulders-Bold": "BigShoulders-Bold.ttf",
        "BigShoulders": "BigShoulders-Regular.ttf",
        "InstrumentSans": "InstrumentSans-Regular.ttf",
        "InstrumentSans-Bold": "InstrumentSans-Bold.ttf",
        "InstrumentSans-Italic": "InstrumentSans-Italic.ttf",
        "InstrumentSans-BoldItalic": "InstrumentSans-BoldItalic.ttf",
        "JetBrainsMono": "JetBrainsMono-Regular.ttf",
        "JetBrainsMono-Bold": "JetBrainsMono-Bold.ttf",
        "CrimsonPro": "CrimsonPro-Regular.ttf",
        "CrimsonPro-Bold": "CrimsonPro-Bold.ttf",
        "CrimsonPro-Italic": "CrimsonPro-Italic.ttf",
        "Lora": "Lora-Regular.ttf",
        "Lora-Bold": "Lora-Bold.ttf",
        "Lora-Italic": "Lora-Italic.ttf",
        "Lora-BoldItalic": "Lora-BoldItalic.ttf",
    }

    registered = []
    for name, filename in fonts.items():
        path = os.path.join(font_dir, filename)
        if os.path.exists(path):
            pdfmetrics.registerFont(TTFont(name, path))
            registered.append(name)

    # Register font families for bold/italic tag support
    if "Lora" in registered and "Lora-Bold" in registered:
        registerFontFamily('Lora',
            normal='Lora', bold='Lora-Bold',
            italic='Lora-Italic', boldItalic='Lora-BoldItalic')

    if "InstrumentSans" in registered and "InstrumentSans-Bold" in registered:
        registerFontFamily('InstrumentSans',
            normal='InstrumentSans', bold='InstrumentSans-Bold',
            italic='InstrumentSans-Italic',
            boldItalic='InstrumentSans-BoldItalic')

    return registered
```

---

## Color Palette

```python
from reportlab.lib.colors import HexColor

# ─── Base Palette (always use these names) ───────────────────
C_BLACK      = HexColor("#0A0A0A")    # Headings, emphasis
C_NEAR_BLACK = HexColor("#1A1A1A")    # Table headers, strong elements
C_DARK_GRAY  = HexColor("#2D2D2D")    # Body text
C_MID_GRAY   = HexColor("#6B6B6B")    # Secondary text, subtitles
C_LIGHT_GRAY = HexColor("#E8E8E8")    # Rules, borders, dividers
C_PALE       = HexColor("#F5F5F3")    # Alternate table rows, backgrounds
C_WHITE      = HexColor("#FFFFFF")    # Page background

# ─── Accent (swap this per project) ──────────────────────────
C_ACCENT      = HexColor("#FF3D00")   # Primary accent color
C_ACCENT_DARK = HexColor("#D63000")   # Darker variant for hover/inline code

# ─── Code Block Colors ───────────────────────────────────────
C_CODE_BG    = HexColor("#1E1E2E")    # Dark background (Catppuccin-inspired)
C_CODE_TEXT  = HexColor("#CDD6F4")    # Light text on dark
C_CODE_COMMENT = HexColor("#6C7086")  # Comments
C_CODE_KEYWORD = HexColor("#CBA6F7")  # Keywords (purple)
C_CODE_STRING  = HexColor("#A6E3A1")  # Strings (green)
C_CODE_LABEL   = HexColor("#89B4FA")  # Language labels (blue)

# ─── Optional Secondary Accents ──────────────────────────────
C_TEAL = HexColor("#00BFA5")          # Links, success indicators
C_GOLD = HexColor("#FFB300")          # Warnings, highlights
```

---

## Paragraph Styles

```python
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY

def make_styles():
    """Create the full style dictionary. Returns dict of ParagraphStyle objects."""
    s = {}

    # ─── Body Text ────────────────────────────────────────────
    s['body'] = ParagraphStyle(
        'body',
        fontName='Lora',
        fontSize=10.5,
        leading=16,
        textColor=C_DARK_GRAY,
        alignment=TA_JUSTIFY,
        spaceAfter=8,
        spaceBefore=0,
    )
    s['body_bold'] = ParagraphStyle('body_bold', parent=s['body'], fontName='Lora-Bold')
    s['body_italic'] = ParagraphStyle('body_italic', parent=s['body'], fontName='Lora-Italic')

    # ─── Headings ─────────────────────────────────────────────
    s['h1'] = ParagraphStyle(
        'h1',
        fontName='BigShoulders-Bold',
        fontSize=32,
        leading=36,
        textColor=C_BLACK,
        spaceBefore=0,
        spaceAfter=6,
    )
    s['h1_sub'] = ParagraphStyle(
        'h1_sub',
        fontName='InstrumentSans',
        fontSize=13,
        leading=17,
        textColor=C_MID_GRAY,
        spaceBefore=0,
        spaceAfter=24,
    )
    s['h2'] = ParagraphStyle(
        'h2',
        fontName='BigShoulders-Bold',
        fontSize=20,
        leading=24,
        textColor=C_NEAR_BLACK,
        spaceBefore=24,
        spaceAfter=10,
    )
    s['h3'] = ParagraphStyle(
        'h3',
        fontName='InstrumentSans-Bold',
        fontSize=13,
        leading=17,
        textColor=C_ACCENT,
        spaceBefore=18,
        spaceAfter=6,
    )

    # ─── Lists ────────────────────────────────────────────────
    s['bullet'] = ParagraphStyle(
        'bullet',
        parent=s['body'],
        leftIndent=20,
        bulletIndent=8,
        spaceBefore=2,
        spaceAfter=2,
    )
    s['checklist'] = ParagraphStyle(
        'checklist',
        parent=s['body'],
        leftIndent=20,
        bulletIndent=4,
        spaceBefore=3,
        spaceAfter=3,
    )

    # ─── Code ─────────────────────────────────────────────────
    s['code_block'] = ParagraphStyle(
        'code_block',
        fontName='JetBrainsMono',
        fontSize=8.5,
        leading=12.5,
        textColor=C_CODE_TEXT,
        backColor=C_CODE_BG,
        leftIndent=12,
        rightIndent=12,
        spaceBefore=8,
        spaceAfter=8,
        borderPadding=(10, 10, 10, 10),
    )

    # ─── Blockquote ───────────────────────────────────────────
    s['blockquote'] = ParagraphStyle(
        'blockquote',
        fontName='Lora-Italic',
        fontSize=11,
        leading=16,
        textColor=C_MID_GRAY,
        leftIndent=24,
        borderPadding=(0, 0, 0, 12),
        spaceBefore=12,
        spaceAfter=12,
    )

    # ─── Table of Contents ────────────────────────────────────
    s['toc_title'] = ParagraphStyle(
        'toc_title',
        fontName='BigShoulders-Bold',
        fontSize=36,
        textColor=C_BLACK,
        spaceAfter=6,
    )

    # ─── Header / Footer ─────────────────────────────────────
    s['header'] = ParagraphStyle(
        'header',
        fontName='InstrumentSans',
        fontSize=7.5,
        leading=10,
        textColor=C_MID_GRAY,
    )
    s['footer'] = ParagraphStyle(
        'footer',
        fontName='InstrumentSans',
        fontSize=7.5,
        leading=10,
        textColor=C_MID_GRAY,
    )

    return s
```

---

## Custom Flowables

### HorizontalRule

```python
from reportlab.platypus import Flowable

class HorizontalRule(Flowable):
    """Styled horizontal separator line."""
    def __init__(self, width=None, thickness=1.5, color=C_LIGHT_GRAY):
        Flowable.__init__(self)
        self.width_val = width
        self.thickness = thickness
        self.color = color
        self.height = thickness + 16

    def wrap(self, availWidth, availHeight):
        self.width_val = self.width_val or availWidth
        return (self.width_val, self.height)

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(self.thickness)
        y = self.height / 2
        self.canv.line(0, y, self.width_val, y)
```

### AccentBar

```python
class AccentBar(Flowable):
    """Bold accent bar for visual separation between sections."""
    def __init__(self, width=60, thickness=4, color=C_ACCENT):
        Flowable.__init__(self)
        self.bar_width = width
        self.thickness = thickness
        self.color = color
        self.height = thickness + 8

    def wrap(self, availWidth, availHeight):
        return (availWidth, self.height)

    def draw(self):
        self.canv.setFillColor(self.color)
        self.canv.rect(0, 4, self.bar_width, self.thickness, fill=1, stroke=0)
```

### CodeBlock

```python
import textwrap

class CodeBlock(Flowable):
    """Dark-background code block with language label and basic syntax coloring."""
    def __init__(self, code_text, language="", max_width=None):
        Flowable.__init__(self)
        self.code_text = code_text
        self.language = language
        self.max_width = max_width
        self.padding = 12
        self.font_name = "JetBrainsMono"
        self.font_size = 8.0
        self.line_height = 11.5
        self.corner_radius = 4

    def wrap(self, availWidth, availHeight):
        w = self.max_width or availWidth
        lines = self.code_text.split('\n')
        h = len(lines) * self.line_height + self.padding * 2
        if self.language:
            h += 16
        self.width = w
        self.height = h + 8
        return (w, self.height)

    def draw(self):
        c = self.canv
        w = self.width
        h = self.height - 8

        # Background
        c.setFillColor(C_CODE_BG)
        c.roundRect(0, 0, w, h, self.corner_radius, fill=1, stroke=0)

        # Language label
        y_start = h - self.padding
        if self.language:
            c.setFillColor(C_CODE_LABEL)
            c.setFont("JetBrainsMono-Bold", 7)
            c.drawString(self.padding, y_start - 2, self.language.upper())
            y_start -= 16

        # Code lines with basic syntax coloring
        lines = self.code_text.split('\n')
        for i, line in enumerate(lines):
            y = y_start - (i + 1) * self.line_height
            if y < self.padding:
                break
            color = self._get_line_color(line)
            c.setFillColor(color)
            c.setFont(self.font_name, self.font_size)
            c.drawString(self.padding, y, line)

    def _get_line_color(self, line):
        """Simple line-level syntax highlighting."""
        stripped = line.lstrip()
        # Comments
        if stripped.startswith('#') or stripped.startswith('//'):
            return C_CODE_COMMENT
        # Keywords
        keywords = [
            'def ', 'class ', 'import ', 'from ', 'return ', 'if ', 'else:',
            'elif ', 'for ', 'while ', 'try:', 'except ', 'with ', 'as ',
            'const ', 'let ', 'var ', 'function ', 'async ', 'await ',
            'export ', 'cat ', 'echo ', 'mkdir ', 'cd ', 'npm ', 'pip ',
            'git ', 'curl ', 'docker '
        ]
        for kw in keywords:
            if kw in stripped:
                return C_CODE_KEYWORD
        # Strings
        if '"' in line or "'" in line:
            return C_CODE_STRING
        return C_CODE_TEXT
```

### ChapterOpener

```python
class ChapterOpener(Flowable):
    """Bold chapter opening with large number, title, and subtitle."""
    def __init__(self, number, title, subtitle=""):
        Flowable.__init__(self)
        self.number = number
        self.title = title
        self.subtitle = subtitle
        self.height = 280

    def wrap(self, availWidth, availHeight):
        self.width = availWidth
        return (availWidth, self.height)

    def draw(self):
        c = self.canv

        # Large chapter number in accent
        c.setFillColor(C_ACCENT)
        c.setFont("BigShoulders-Bold", 72)
        c.drawString(0, self.height - 80, f"{self.number:02d}")

        # Accent bar
        c.setFillColor(C_ACCENT)
        c.rect(0, self.height - 95, 80, 4, fill=1, stroke=0)

        # Title (word-wrapped)
        c.setFillColor(C_BLACK)
        c.setFont("BigShoulders-Bold", 30)
        title_lines = textwrap.wrap(self.title, width=36)
        y = self.height - 140
        for tl in title_lines:
            c.drawString(0, y, tl)
            y -= 36

        # Subtitle
        if self.subtitle:
            c.setFillColor(C_MID_GRAY)
            c.setFont("InstrumentSans", 12)
            sub_lines = textwrap.wrap(self.subtitle, width=65)
            y -= 10
            for sl in sub_lines:
                c.drawString(0, y, sl)
                y -= 16
```

### SetChapterAction

```python
class SetChapterAction(Flowable):
    """
    Invisible flowable that updates header/footer state during rendering.
    Insert AFTER PageBreak, BEFORE chapter content.
    """
    def __init__(self, template_obj, chapter_text, chapter_num):
        Flowable.__init__(self)
        self.template = template_obj
        self.chapter_text = chapter_text
        self.chapter_num = chapter_num
        self.width = 0
        self.height = 0

    def wrap(self, availWidth, availHeight):
        return (0, 0)

    def draw(self):
        self.template.current_chapter = self.chapter_text
        self.template.current_chapter_num = self.chapter_num
```

---

## Markdown Parser

### Safe Inline Formatter

**IMPORTANT:** This must extract code and links BEFORE processing bold/italic to prevent XML nesting errors.

```python
import re

def format_inline(text, accent_hex="#FF3D00", accent_dark_hex="#D63000", teal_hex="#00BFA5"):
    """
    Convert markdown inline formatting to ReportLab XML.
    Safe ordering to prevent tag nesting crashes.
    """
    text = text.replace('&', '&amp;')

    # Step 1: Extract code spans (protect from bold/italic)
    code_spans = {}
    code_counter = [0]
    def replace_code(m):
        key = f"XCODE{code_counter[0]}X"
        content = m.group(1).replace('<', '&lt;').replace('>', '&gt;')
        code_spans[key] = (
            f'<font name="JetBrainsMono" size="8.5" '
            f'color="{accent_dark_hex}">{content}</font>'
        )
        code_counter[0] += 1
        return key
    text = re.sub(r'`([^`]+)`', replace_code, text)

    # Step 2: Extract links
    links = {}
    link_counter = [0]
    def replace_link(m):
        key = f"XLINK{link_counter[0]}X"
        links[key] = f'<font color="{teal_hex}"><u>{m.group(1)}</u></font>'
        link_counter[0] += 1
        return key
    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', replace_link, text)

    # Step 3: Bold+italic ***text***
    text = re.sub(r'\*\*\*(.*?)\*\*\*', r'<b><i>\1</i></b>', text)

    # Step 4: Bold **text**
    text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)

    # Step 5: Italic *text*
    text = re.sub(r'(?<![*\w])\*([^*]+?)\*(?![*\w])', r'<i>\1</i>', text)

    # Step 6: Restore protected spans
    for key, val in code_spans.items():
        text = text.replace(key, val)
    for key, val in links.items():
        text = text.replace(key, val)

    return text
```

### Full Markdown-to-Flowables Parser

```python
from reportlab.platypus import Paragraph, Spacer

def parse_markdown_to_flowables(md_text, styles, accent_hex="#FF3D00"):
    """
    Convert a markdown string into a list of ReportLab flowables.

    Args:
        md_text: Raw markdown content
        styles: Dict of ParagraphStyle objects from make_styles()
        accent_hex: Hex color string for accent elements

    Returns:
        List of Flowable objects ready for doc.build()
    """
    flowables = []
    lines = md_text.split('\n')
    i = 0
    in_code_block = False
    code_lines = []
    code_lang = ""
    chapter_num = None
    chapter_title = None
    first_h1 = True
    first_h2 = True

    while i < len(lines):
        line = lines[i]

        # ─── Code Block Toggle ────────────────────────────────
        if line.strip().startswith('```'):
            if in_code_block:
                flowables.append(CodeBlock('\n'.join(code_lines), language=code_lang))
                code_lines = []
                code_lang = ""
                in_code_block = False
            else:
                in_code_block = True
                lang_match = re.match(r'```(\w+)', line.strip())
                code_lang = lang_match.group(1) if lang_match else ""
            i += 1
            continue

        if in_code_block:
            code_lines.append(line)
            i += 1
            continue

        stripped = line.strip()

        # Skip empty
        if not stripped:
            i += 1
            continue

        # ─── Horizontal Rule ─────────────────────────────────
        if stripped in ('---', '***', '___'):
            flowables.append(HorizontalRule())
            i += 1
            continue

        # ─── H1 (Chapter Title) ──────────────────────────────
        if stripped.startswith('# ') and not stripped.startswith('## '):
            title_text = stripped[2:].strip()
            ch_match = re.match(r'Chapter\s+(\d+):\s*(.*)', title_text)
            if ch_match and first_h1:
                chapter_num = int(ch_match.group(1))
                chapter_title = ch_match.group(2).strip()
                first_h1 = False
            else:
                safe = title_text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                flowables.append(Paragraph(safe, styles['h1']))
            i += 1
            continue

        # ─── H2 (Section or Chapter Subtitle) ────────────────
        if stripped.startswith('## '):
            h2_text = stripped[3:].strip()
            if first_h2 and chapter_num is not None:
                # First H2 = chapter subtitle → create opener
                flowables.append(ChapterOpener(chapter_num, chapter_title, h2_text))
                flowables.append(AccentBar(width=60, thickness=3))
                flowables.append(Spacer(1, 12))
                first_h2 = False
            else:
                safe = h2_text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                flowables.append(Spacer(1, 8))
                flowables.append(Paragraph(safe, styles['h2']))
                flowables.append(AccentBar(width=40, thickness=2, color=C_ACCENT))
            i += 1
            continue

        # ─── H3 ──────────────────────────────────────────────
        if stripped.startswith('### '):
            h3_text = stripped[4:].strip()
            safe = h3_text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            flowables.append(Paragraph(safe, styles['h3']))
            i += 1
            continue

        # ─── Checkboxes ──────────────────────────────────────
        if stripped.startswith('□ ') or stripped.startswith('- [ ]') or stripped.startswith('- [x]'):
            text = re.sub(r'^(□|- \[.\])\s*', '', stripped)
            flowables.append(Paragraph(
                f'<font color="{accent_hex}">▸</font>&nbsp;&nbsp;{format_inline(text)}',
                styles['checklist']
            ))
            i += 1
            continue

        # ─── Bullet Points ───────────────────────────────────
        if stripped.startswith('- ') or stripped.startswith('* '):
            text = stripped[2:].strip()
            flowables.append(Paragraph(
                f'<font color="{accent_hex}">▸</font>&nbsp;&nbsp;{format_inline(text)}',
                styles['bullet']
            ))
            i += 1
            continue

        # ─── Numbered List ───────────────────────────────────
        num_match = re.match(r'^(\d+)\.\s+(.*)', stripped)
        if num_match:
            num = num_match.group(1)
            text = num_match.group(2)
            flowables.append(Paragraph(
                f'<font name="InstrumentSans-Bold" color="{accent_hex}">'
                f'{num}.</font>&nbsp;&nbsp;{format_inline(text)}',
                styles['bullet']
            ))
            i += 1
            continue

        # ─── Tables ──────────────────────────────────────────
        if '|' in stripped and i + 1 < len(lines) and '---' in lines[i + 1]:
            table_lines = []
            while i < len(lines) and '|' in lines[i].strip():
                table_lines.append(lines[i].strip())
                i += 1
            flowables.append(build_table(table_lines, styles))
            continue

        # ─── Regular Paragraph ───────────────────────────────
        para_lines = [stripped]
        i += 1
        while i < len(lines):
            nl = lines[i].strip()
            if (not nl or nl.startswith('#') or nl.startswith('```') or
                nl.startswith('- ') or nl.startswith('* ') or
                nl.startswith('|') or nl in ('---', '***', '___') or
                re.match(r'^\d+\.', nl) or nl.startswith('□')):
                break
            para_lines.append(nl)
            i += 1
        full_text = ' '.join(para_lines)
        flowables.append(Paragraph(format_inline(full_text), styles['body']))

    return flowables
```

---

## Page Templates

```python
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch

PAGE_W, PAGE_H = letter
ML, MR, MT, MB = 1.0*inch, 1.0*inch, 1.0*inch, 1.0*inch

class BookPageTemplate:
    """Manages page rendering callbacks for cover, TOC, and chapter pages."""

    def __init__(self):
        self.current_chapter = ""
        self.current_chapter_num = 0

    def cover_page(self, canvas, doc):
        """Draw cover page. Override this for custom covers."""
        canvas.saveState()
        w, h = PAGE_W, PAGE_H
        # Black background
        canvas.setFillColor(C_BLACK)
        canvas.rect(0, 0, w, h, fill=1, stroke=0)
        # Top accent bar
        canvas.setFillColor(C_ACCENT)
        canvas.rect(0, h - 8, w, 8, fill=1, stroke=0)
        # Bottom accent bar
        canvas.setFillColor(C_ACCENT)
        canvas.rect(0, 0, w, 4, fill=1, stroke=0)
        canvas.restoreState()

    def toc_page(self, canvas, doc):
        """Draw TOC page chrome."""
        canvas.saveState()
        w, h = PAGE_W, PAGE_H
        canvas.setFillColor(C_ACCENT)
        canvas.rect(0, h - 3, w, 3, fill=1, stroke=0)
        canvas.setFillColor(C_LIGHT_GRAY)
        canvas.rect(0, 0, w, 1, fill=1, stroke=0)
        canvas.restoreState()

    def chapter_page(self, canvas, doc):
        """Draw chapter page headers and footers."""
        canvas.saveState()
        w, h = PAGE_W, PAGE_H
        page_num = doc.page

        # Header line
        canvas.setStrokeColor(C_LIGHT_GRAY)
        canvas.setLineWidth(0.5)
        canvas.line(ML, h - MT + 20, w - MR, h - MT + 20)

        # Header: chapter title (left)
        canvas.setFillColor(C_MID_GRAY)
        canvas.setFont("InstrumentSans", 7.5)
        if self.current_chapter:
            canvas.drawString(ML, h - MT + 28, self.current_chapter.upper())

        # Header: book title (right) — customize this
        canvas.setFillColor(C_LIGHT_GRAY)
        canvas.setFont("InstrumentSans", 7.5)
        canvas.drawRightString(w - MR, h - MT + 28, "YOUR BOOK TITLE HERE")

        # Footer line
        canvas.setStrokeColor(C_LIGHT_GRAY)
        canvas.line(ML, MB - 15, w - MR, MB - 15)

        # Page number (centered, accent color)
        canvas.setFillColor(C_ACCENT)
        canvas.setFont("BigShoulders-Bold", 10)
        canvas.drawCentredString(w / 2, MB - 30, str(page_num))

        # Decorative dots flanking page number
        canvas.setFillColor(C_ACCENT)
        canvas.circle(w / 2 - 18, MB - 26, 1.5, fill=1, stroke=0)
        canvas.circle(w / 2 + 18, MB - 26, 1.5, fill=1, stroke=0)

        canvas.restoreState()
```

---

## Cover Page Designs

### Dark Editorial Cover (Default)

```python
def draw_dark_cover(canvas, doc, title, subtitle, author, feature_number=""):
    """Draw a dark editorial cover with oversized number watermark."""
    canvas.saveState()
    w, h = PAGE_W, PAGE_H

    # Full black background
    canvas.setFillColor(C_BLACK)
    canvas.rect(0, 0, w, h, fill=1, stroke=0)

    # Top accent bar
    canvas.setFillColor(C_ACCENT)
    canvas.rect(0, h - 8, w, 8, fill=1, stroke=0)

    # Large watermark number (if provided)
    if feature_number:
        canvas.setFillColor(HexColor("#1A1A1A"))
        canvas.setFont("BigShoulders-Bold", 220)
        canvas.drawString(ML - 10, h - 300, feature_number)

    # Accent bar
    canvas.setFillColor(C_ACCENT)
    canvas.rect(ML, h - 320, 120, 4, fill=1, stroke=0)

    # Title lines
    canvas.setFillColor(C_WHITE)
    canvas.setFont("BigShoulders-Bold", 38)
    title_lines = textwrap.wrap(title, width=28)
    y = h - 390
    for tl in title_lines:
        canvas.drawString(ML, y, tl.upper())
        y -= 42

    # Subtitle
    if subtitle:
        canvas.setFillColor(C_MID_GRAY)
        canvas.setFont("InstrumentSans", 13)
        canvas.drawString(ML, y - 10, subtitle)

    # Author
    if author:
        canvas.setFillColor(C_ACCENT)
        canvas.setFont("InstrumentSans-Bold", 11)
        canvas.drawString(ML, MB + 60, f"BY {author.upper()}")

    # Bottom accent bar
    canvas.setFillColor(C_ACCENT)
    canvas.rect(0, 0, w, 4, fill=1, stroke=0)

    canvas.restoreState()
```

### Light Minimal Cover (Alternative)

```python
def draw_light_cover(canvas, doc, title, subtitle, author):
    """Draw a light minimal cover with bold typography."""
    canvas.saveState()
    w, h = PAGE_W, PAGE_H

    # White background (default)
    # Top accent bar
    canvas.setFillColor(C_ACCENT)
    canvas.rect(0, h - 6, w, 6, fill=1, stroke=0)

    # Title
    canvas.setFillColor(C_BLACK)
    canvas.setFont("BigShoulders-Bold", 44)
    title_lines = textwrap.wrap(title, width=22)
    y = h - 200
    for tl in title_lines:
        canvas.drawString(ML, y, tl.upper())
        y -= 50

    # Accent bar below title
    canvas.setFillColor(C_ACCENT)
    canvas.rect(ML, y + 10, 80, 4, fill=1, stroke=0)

    # Subtitle
    if subtitle:
        canvas.setFillColor(C_MID_GRAY)
        canvas.setFont("InstrumentSans", 14)
        canvas.drawString(ML, y - 20, subtitle)

    # Author at bottom
    if author:
        canvas.setFillColor(C_DARK_GRAY)
        canvas.setFont("InstrumentSans-Bold", 12)
        canvas.drawString(ML, MB + 40, author)

    # Bottom rule
    canvas.setStrokeColor(C_LIGHT_GRAY)
    canvas.setLineWidth(1)
    canvas.line(ML, MB + 30, w - MR, MB + 30)

    canvas.restoreState()
```

---

## Table Builder

```python
from reportlab.platypus import Table, TableStyle

def build_table(table_lines, styles):
    """
    Convert markdown table lines into a styled ReportLab Table.

    Args:
        table_lines: List of raw markdown table row strings (including header separator)
        styles: Style dict from make_styles()

    Returns:
        Table flowable
    """
    rows = []
    for j, line in enumerate(table_lines):
        if '---' in line and j == 1:
            continue  # Skip separator row
        cells = [c.strip() for c in line.strip('|').split('|')]
        rows.append(cells)

    if not rows:
        return Spacer(1, 1)

    # Create Paragraph objects for each cell
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.units import inch
    content_width = letter[0] - 2 * inch

    header_style = ParagraphStyle(
        'th', fontName='InstrumentSans-Bold', fontSize=9,
        leading=13, textColor=C_WHITE,
    )
    cell_style = ParagraphStyle(
        'td', fontName='Lora', fontSize=9, leading=13,
        textColor=C_DARK_GRAY,
    )

    table_data = []
    for j, row in enumerate(rows):
        st = header_style if j == 0 else cell_style
        table_data.append([Paragraph(format_inline(c), st) for c in row])

    num_cols = max(len(r) for r in table_data)
    col_w = content_width / num_cols

    t = Table(table_data, colWidths=[col_w] * num_cols)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), C_NEAR_BLACK),
        ('TEXTCOLOR', (0, 0), (-1, 0), C_WHITE),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [C_PALE, C_WHITE]),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('LINEBELOW', (0, 0), (-1, 0), 2, C_ACCENT),
        ('LINEBELOW', (0, 1), (-1, -2), 0.5, C_LIGHT_GRAY),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    return t
```

---

## Full Document Assembly

### Multi-Chapter Book

```python
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Spacer, PageBreak, NextPageTemplate
)

def build_book(chapters, output_path, title, subtitle, author, accent="#FF3D00"):
    """
    Build a complete book PDF.

    Args:
        chapters: List of dicts: [{"num": 1, "title": "...", "markdown": "..."}, ...]
        output_path: Where to save the PDF
        title: Book title
        subtitle: Book subtitle
        author: Author name
        accent: Hex color for accent
    """
    global C_ACCENT
    C_ACCENT = HexColor(accent)

    template = BookPageTemplate()
    styles = make_styles()

    doc = BaseDocTemplate(
        output_path, pagesize=letter,
        leftMargin=ML, rightMargin=MR, topMargin=MT, bottomMargin=MB,
        title=title, author=author,
    )

    frame = Frame(ML, MB, PAGE_W - ML - MR, PAGE_H - MT - MB, id='content')

    doc.addPageTemplates([
        PageTemplate(id='cover', frames=[frame],
                     onPage=lambda c, d: draw_dark_cover(c, d, title, subtitle, author)),
        PageTemplate(id='toc', frames=[frame], onPage=template.toc_page),
        PageTemplate(id='chapter', frames=[frame], onPage=template.chapter_page),
    ])

    story = []

    # ─── Cover ────────────────────────────────────────────────
    story.append(NextPageTemplate('cover'))
    story.append(Spacer(1, 1))
    story.append(NextPageTemplate('toc'))
    story.append(PageBreak())

    # ─── Table of Contents ────────────────────────────────────
    story.append(Spacer(1, 20))
    story.append(Paragraph("CONTENTS", styles['toc_title']))
    story.append(AccentBar(width=60, thickness=3))
    story.append(Spacer(1, 20))

    for ch in chapters:
        toc_row = Table(
            [[
                Paragraph(
                    f'<font color="{C_ACCENT.hexval()}">{ch["num"]:02d}</font>',
                    ParagraphStyle('tn', fontName='BigShoulders-Bold',
                                   fontSize=14, textColor=C_ACCENT, leading=20)
                ),
                Paragraph(
                    ch["title"],
                    ParagraphStyle('tt', fontName='InstrumentSans',
                                   fontSize=11, leading=20, textColor=C_NEAR_BLACK)
                ),
            ]],
            colWidths=[40, PAGE_W - ML - MR - 50],
        )
        toc_row.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LINEBELOW', (0, 0), (-1, -1), 0.5, C_LIGHT_GRAY),
            ('LEFTPADDING', (0, 0), (0, 0), 0),
        ]))
        story.append(toc_row)

    # ─── Chapters ─────────────────────────────────────────────
    for ch in chapters:
        story.append(NextPageTemplate('chapter'))
        story.append(PageBreak())
        story.append(SetChapterAction(
            template, f"Chapter {ch['num']}: {ch['title']}", ch['num']
        ))
        flowables = parse_markdown_to_flowables(ch["markdown"], styles, C_ACCENT.hexval())
        story.extend(flowables)

    # ─── Build ────────────────────────────────────────────────
    doc.build(story)
    return output_path
```

### Single Document (Report/Whitepaper)

```python
def build_report(markdown_content, output_path, title, subtitle="", author=""):
    """
    Build a single-document PDF (report, whitepaper, etc.)

    Args:
        markdown_content: Raw markdown string
        output_path: Where to save
        title: Document title
        subtitle: Optional subtitle
        author: Optional author
    """
    template = BookPageTemplate()
    styles = make_styles()

    doc = BaseDocTemplate(
        output_path, pagesize=letter,
        leftMargin=ML, rightMargin=MR, topMargin=MT, bottomMargin=MB,
        title=title, author=author,
    )

    frame = Frame(ML, MB, PAGE_W - ML - MR, PAGE_H - MT - MB, id='content')

    doc.addPageTemplates([
        PageTemplate(id='cover', frames=[frame],
                     onPage=lambda c, d: draw_light_cover(c, d, title, subtitle, author)),
        PageTemplate(id='body', frames=[frame], onPage=template.chapter_page),
    ])

    story = []

    # Cover
    story.append(NextPageTemplate('cover'))
    story.append(Spacer(1, 1))
    story.append(NextPageTemplate('body'))
    story.append(PageBreak())

    # Content
    template.current_chapter = title
    flowables = parse_markdown_to_flowables(markdown_content, styles)
    story.extend(flowables)

    doc.build(story)
    return output_path
```
