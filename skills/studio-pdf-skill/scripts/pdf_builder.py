#!/usr/bin/env python3
"""
Studio-Grade PDF Builder — Complete Working Template
=====================================================
Copy this file, customize the CONFIG section, and run.

Usage:
    python pdf_builder.py

This script demonstrates building a full multi-chapter book.
Modify build_book() or build_report() for your use case.

Dependencies:
    pip install reportlab --break-system-packages
"""

import re
import os
import sys
import textwrap
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer,
    PageBreak, Table, TableStyle, NextPageTemplate, Flowable
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily


# ═══════════════════════════════════════════════════════════════
# CONFIG — Customize these for your project
# ═══════════════════════════════════════════════════════════════

# Path to the skill's font directory (adjust for your environment)
SKILL_DIR = os.path.dirname(os.path.abspath(__file__))
FONT_DIR = os.path.join(SKILL_DIR, "..", "assets", "fonts")

# Page setup
PAGE_W, PAGE_H = letter
ML = 1.0 * inch   # margin left
MR = 1.0 * inch   # margin right
MT = 1.0 * inch   # margin top
MB = 1.0 * inch   # margin bottom

# Book metadata
BOOK_TITLE = "Your Book Title"
BOOK_SUBTITLE = "Your subtitle goes here"
BOOK_AUTHOR = "Author Name"
COVER_FEATURE = ""  # Large decorative number/text on cover (optional)

# Where to read chapter files from (set to None to use inline content)
CHAPTERS_DIR = None  # e.g., "./chapters"

# Output path
OUTPUT_PATH = "output.pdf"


# ═══════════════════════════════════════════════════════════════
# COLOR PALETTE
# ═══════════════════════════════════════════════════════════════

C_BLACK      = HexColor("#0A0A0A")
C_NEAR_BLACK = HexColor("#1A1A1A")
C_DARK_GRAY  = HexColor("#2D2D2D")
C_MID_GRAY   = HexColor("#6B6B6B")
C_LIGHT_GRAY = HexColor("#E8E8E8")
C_PALE       = HexColor("#F5F5F3")
C_WHITE      = HexColor("#FFFFFF")

# Primary accent — change this to match your brand
C_ACCENT      = HexColor("#FF3D00")
C_ACCENT_DARK = HexColor("#D63000")

# Code block colors
C_CODE_BG      = HexColor("#1E1E2E")
C_CODE_TEXT    = HexColor("#CDD6F4")
C_CODE_COMMENT = HexColor("#6C7086")
C_CODE_KEYWORD = HexColor("#CBA6F7")
C_CODE_STRING  = HexColor("#A6E3A1")
C_CODE_LABEL   = HexColor("#89B4FA")

# Secondary accents
C_TEAL = HexColor("#00BFA5")
C_GOLD = HexColor("#FFB300")


# ═══════════════════════════════════════════════════════════════
# FONT REGISTRATION
# ═══════════════════════════════════════════════════════════════

def register_fonts():
    """Register bundled fonts. Falls back to built-ins if not found."""
    fonts = {
        "BigShoulders-Bold": "BigShoulders-Bold.ttf",
        "BigShoulders": "BigShoulders-Regular.ttf",
        "InstrumentSans": "InstrumentSans-Regular.ttf",
        "InstrumentSans-Bold": "InstrumentSans-Bold.ttf",
        "InstrumentSans-Italic": "InstrumentSans-Italic.ttf",
        "InstrumentSans-BoldItalic": "InstrumentSans-BoldItalic.ttf",
        "JetBrainsMono": "JetBrainsMono-Regular.ttf",
        "JetBrainsMono-Bold": "JetBrainsMono-Bold.ttf",
        "Lora": "Lora-Regular.ttf",
        "Lora-Bold": "Lora-Bold.ttf",
        "Lora-Italic": "Lora-Italic.ttf",
        "Lora-BoldItalic": "Lora-BoldItalic.ttf",
    }
    registered = []
    for name, filename in fonts.items():
        path = os.path.join(FONT_DIR, filename)
        if os.path.exists(path):
            try:
                pdfmetrics.registerFont(TTFont(name, path))
                registered.append(name)
            except Exception as e:
                print(f"Warning: Could not register font {name}: {e}")

    # Register families for <b>/<i> tag support in Paragraphs
    if all(f in registered for f in ['Lora', 'Lora-Bold', 'Lora-Italic', 'Lora-BoldItalic']):
        registerFontFamily('Lora', normal='Lora', bold='Lora-Bold',
                           italic='Lora-Italic', boldItalic='Lora-BoldItalic')

    if all(f in registered for f in ['InstrumentSans', 'InstrumentSans-Bold',
                                      'InstrumentSans-Italic', 'InstrumentSans-BoldItalic']):
        registerFontFamily('InstrumentSans', normal='InstrumentSans',
                           bold='InstrumentSans-Bold', italic='InstrumentSans-Italic',
                           boldItalic='InstrumentSans-BoldItalic')

    if not registered:
        print("No custom fonts found. Using built-in fonts (Helvetica/Times/Courier).")
    else:
        print(f"Registered {len(registered)} fonts.")

    return registered

REGISTERED = register_fonts()

# Determine which fonts to use (custom or fallback)
F_DISPLAY = "BigShoulders-Bold" if "BigShoulders-Bold" in REGISTERED else "Helvetica-Bold"
F_BODY = "Lora" if "Lora" in REGISTERED else "Times-Roman"
F_BODY_B = "Lora-Bold" if "Lora-Bold" in REGISTERED else "Times-Bold"
F_BODY_I = "Lora-Italic" if "Lora-Italic" in REGISTERED else "Times-Italic"
F_UI = "InstrumentSans" if "InstrumentSans" in REGISTERED else "Helvetica"
F_UI_B = "InstrumentSans-Bold" if "InstrumentSans-Bold" in REGISTERED else "Helvetica-Bold"
F_CODE = "JetBrainsMono" if "JetBrainsMono" in REGISTERED else "Courier"
F_CODE_B = "JetBrainsMono-Bold" if "JetBrainsMono-Bold" in REGISTERED else "Courier-Bold"


# ═══════════════════════════════════════════════════════════════
# PARAGRAPH STYLES
# ═══════════════════════════════════════════════════════════════

def make_styles():
    s = {}
    s['body'] = ParagraphStyle(
        'body', fontName=F_BODY, fontSize=10.5, leading=16,
        textColor=C_DARK_GRAY, alignment=TA_JUSTIFY, spaceAfter=8)
    s['h1'] = ParagraphStyle(
        'h1', fontName=F_DISPLAY, fontSize=32, leading=36,
        textColor=C_BLACK, spaceAfter=6)
    s['h2'] = ParagraphStyle(
        'h2', fontName=F_DISPLAY, fontSize=20, leading=24,
        textColor=C_NEAR_BLACK, spaceBefore=24, spaceAfter=10)
    s['h3'] = ParagraphStyle(
        'h3', fontName=F_UI_B, fontSize=13, leading=17,
        textColor=C_ACCENT, spaceBefore=18, spaceAfter=6)
    s['bullet'] = ParagraphStyle(
        'bullet', parent=s['body'], leftIndent=20, bulletIndent=8,
        spaceBefore=2, spaceAfter=2)
    s['checklist'] = ParagraphStyle(
        'checklist', parent=s['body'], leftIndent=20, bulletIndent=4,
        spaceBefore=3, spaceAfter=3)
    s['toc_title'] = ParagraphStyle(
        'toc_title', fontName=F_DISPLAY, fontSize=36, textColor=C_BLACK, spaceAfter=6)
    return s

STYLES = make_styles()


# ═══════════════════════════════════════════════════════════════
# CUSTOM FLOWABLES
# ═══════════════════════════════════════════════════════════════

class HorizontalRule(Flowable):
    def __init__(self, width=None, thickness=1.5, color=C_LIGHT_GRAY):
        Flowable.__init__(self)
        self.width_val = width
        self.thickness = thickness
        self.color = color
        self.height = thickness + 16
    def wrap(self, aW, aH):
        self.width_val = self.width_val or aW
        return (self.width_val, self.height)
    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(self.thickness)
        self.canv.line(0, self.height/2, self.width_val, self.height/2)


class AccentBar(Flowable):
    def __init__(self, width=60, thickness=4, color=C_ACCENT):
        Flowable.__init__(self)
        self.bar_width = width
        self.thickness = thickness
        self.color = color
        self.height = thickness + 8
    def wrap(self, aW, aH):
        return (aW, self.height)
    def draw(self):
        self.canv.setFillColor(self.color)
        self.canv.rect(0, 4, self.bar_width, self.thickness, fill=1, stroke=0)


class CodeBlock(Flowable):
    def __init__(self, code_text, language="", max_width=None):
        Flowable.__init__(self)
        self.code_text = code_text
        self.language = language
        self.max_width = max_width
        self.padding = 12
        self.line_height = 11.5
        self.corner_radius = 4

    def wrap(self, aW, aH):
        w = self.max_width or aW
        lines = self.code_text.split('\n')
        h = len(lines) * self.line_height + self.padding * 2
        if self.language:
            h += 16
        self.width = w
        self.height = h + 8
        return (w, self.height)

    def draw(self):
        c = self.canv
        w, h = self.width, self.height - 8
        c.setFillColor(C_CODE_BG)
        c.roundRect(0, 0, w, h, self.corner_radius, fill=1, stroke=0)

        y_start = h - self.padding
        if self.language:
            c.setFillColor(C_CODE_LABEL)
            c.setFont(F_CODE_B, 7)
            c.drawString(self.padding, y_start - 2, self.language.upper())
            y_start -= 16

        lines = self.code_text.split('\n')
        for i, line in enumerate(lines):
            y = y_start - (i + 1) * self.line_height
            if y < self.padding:
                break
            c.setFillColor(self._color(line))
            c.setFont(F_CODE, 8.0)
            c.drawString(self.padding, y, line)

    def _color(self, line):
        s = line.lstrip()
        if s.startswith('#') or s.startswith('//'):
            return C_CODE_COMMENT
        kws = ['def ','class ','import ','from ','return ','if ','else:','elif ',
               'for ','while ','try:','except ','with ','as ','const ','let ',
               'var ','function ','async ','await ','export ','cat ','echo ',
               'mkdir ','cd ','npm ','pip ','git ','curl ','docker ']
        for kw in kws:
            if kw in s:
                return C_CODE_KEYWORD
        if '"' in line or "'" in line:
            return C_CODE_STRING
        return C_CODE_TEXT


class ChapterOpener(Flowable):
    def __init__(self, number, title, subtitle=""):
        Flowable.__init__(self)
        self.number = number
        self.title = title
        self.subtitle = subtitle
        self.height = 280
    def wrap(self, aW, aH):
        self.width = aW
        return (aW, self.height)
    def draw(self):
        c = self.canv
        c.setFillColor(C_ACCENT)
        c.setFont(F_DISPLAY, 72)
        c.drawString(0, self.height - 80, f"{self.number:02d}")
        c.setFillColor(C_ACCENT)
        c.rect(0, self.height - 95, 80, 4, fill=1, stroke=0)
        c.setFillColor(C_BLACK)
        c.setFont(F_DISPLAY, 30)
        for j, tl in enumerate(textwrap.wrap(self.title, width=36)):
            c.drawString(0, self.height - 140 - j*36, tl)
        if self.subtitle:
            c.setFillColor(C_MID_GRAY)
            c.setFont(F_UI, 12)
            y = self.height - 140 - len(textwrap.wrap(self.title, 36))*36 - 10
            for sl in textwrap.wrap(self.subtitle, width=65):
                c.drawString(0, y, sl)
                y -= 16


class SetChapterAction(Flowable):
    def __init__(self, tmpl, text, num):
        Flowable.__init__(self)
        self.tmpl = tmpl
        self.text = text
        self.num = num
        self.width = 0
        self.height = 0
    def wrap(self, aW, aH): return (0, 0)
    def draw(self):
        self.tmpl.current_chapter = self.text
        self.tmpl.current_chapter_num = self.num


# ═══════════════════════════════════════════════════════════════
# INLINE MARKDOWN FORMATTER
# ═══════════════════════════════════════════════════════════════

def format_inline(text):
    """Convert markdown inline formatting to ReportLab XML. Safe tag ordering."""
    text = text.replace('&', '&amp;')

    # 1. Extract code spans
    codes = {}
    cc = [0]
    def _code(m):
        k = f"XCODE{cc[0]}X"
        ct = m.group(1).replace('<','&lt;').replace('>','&gt;')
        codes[k] = f'<font name="{F_CODE}" size="8.5" color="{C_ACCENT_DARK.hexval()}">{ct}</font>'
        cc[0] += 1
        return k
    text = re.sub(r'`([^`]+)`', _code, text)

    # 2. Extract links
    lnks = {}
    lc = [0]
    def _link(m):
        k = f"XLINK{lc[0]}X"
        lnks[k] = f'<font color="{C_TEAL.hexval()}"><u>{m.group(1)}</u></font>'
        lc[0] += 1
        return k
    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', _link, text)

    # 3. Bold+italic, bold, italic
    text = re.sub(r'\*\*\*(.*?)\*\*\*', r'<b><i>\1</i></b>', text)
    text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)
    text = re.sub(r'(?<![*\w])\*([^*]+?)\*(?![*\w])', r'<i>\1</i>', text)

    # 4. Restore
    for k, v in codes.items(): text = text.replace(k, v)
    for k, v in lnks.items(): text = text.replace(k, v)

    text = text.replace('✓', f'<font color="{C_TEAL.hexval()}">✓</font>')
    return text


# ═══════════════════════════════════════════════════════════════
# MARKDOWN → FLOWABLES PARSER
# ═══════════════════════════════════════════════════════════════

def parse_markdown(md_text, styles):
    """Parse markdown text into a list of ReportLab flowables."""
    flowables = []
    lines = md_text.split('\n')
    i = 0
    in_code = False
    code_lines = []
    code_lang = ""
    ch_num = None
    ch_title = None
    first_h1 = True
    first_h2 = True

    while i < len(lines):
        line = lines[i]

        # Code blocks
        if line.strip().startswith('```'):
            if in_code:
                flowables.append(CodeBlock('\n'.join(code_lines), language=code_lang))
                code_lines, code_lang, in_code = [], "", False
            else:
                in_code = True
                m = re.match(r'```(\w+)', line.strip())
                code_lang = m.group(1) if m else ""
            i += 1; continue
        if in_code:
            code_lines.append(line); i += 1; continue

        s = line.strip()
        if not s: i += 1; continue

        # HR
        if s in ('---', '***', '___'):
            flowables.append(HorizontalRule()); i += 1; continue

        # H1
        if s.startswith('# ') and not s.startswith('## '):
            txt = s[2:].strip()
            m = re.match(r'Chapter\s+(\d+):\s*(.*)', txt)
            if m and first_h1:
                ch_num, ch_title = int(m.group(1)), m.group(2).strip()
                first_h1 = False
            else:
                safe = txt.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')
                flowables.append(Paragraph(safe, styles['h1']))
            i += 1; continue

        # H2
        if s.startswith('## '):
            txt = s[3:].strip()
            if first_h2 and ch_num is not None:
                flowables.append(ChapterOpener(ch_num, ch_title, txt))
                flowables.append(AccentBar(width=60, thickness=3))
                flowables.append(Spacer(1, 12))
                first_h2 = False
            else:
                safe = txt.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')
                flowables.append(Spacer(1, 8))
                flowables.append(Paragraph(safe, styles['h2']))
                flowables.append(AccentBar(width=40, thickness=2, color=C_ACCENT))
            i += 1; continue

        # H3
        if s.startswith('### '):
            txt = s[4:].strip()
            safe = txt.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')
            flowables.append(Paragraph(safe, styles['h3']))
            i += 1; continue

        # Checkboxes
        if s.startswith('□ ') or s.startswith('- [ ]') or s.startswith('- [x]'):
            txt = re.sub(r'^(□|- \[.\])\s*', '', s)
            flowables.append(Paragraph(
                f'<font color="{C_ACCENT.hexval()}">▸</font>&nbsp;&nbsp;{format_inline(txt)}',
                styles['checklist']))
            i += 1; continue

        # Bullets
        if s.startswith('- ') or s.startswith('* '):
            txt = s[2:].strip()
            flowables.append(Paragraph(
                f'<font color="{C_ACCENT.hexval()}">▸</font>&nbsp;&nbsp;{format_inline(txt)}',
                styles['bullet']))
            i += 1; continue

        # Numbered list
        nm = re.match(r'^(\d+)\.\s+(.*)', s)
        if nm:
            flowables.append(Paragraph(
                f'<font name="{F_UI_B}" color="{C_ACCENT.hexval()}">{nm.group(1)}.</font>'
                f'&nbsp;&nbsp;{format_inline(nm.group(2))}',
                styles['bullet']))
            i += 1; continue

        # Tables
        if '|' in s and i+1 < len(lines) and '---' in lines[i+1]:
            tl = []
            while i < len(lines) and '|' in lines[i].strip():
                tl.append(lines[i].strip()); i += 1
            flowables.append(build_table(tl, styles))
            continue

        # Paragraph (collect continuation lines)
        pl = [s]; i += 1
        while i < len(lines):
            nl = lines[i].strip()
            if (not nl or nl.startswith('#') or nl.startswith('```') or
                nl.startswith('- ') or nl.startswith('* ') or nl.startswith('|') or
                nl in ('---','***','___') or re.match(r'^\d+\.', nl) or nl.startswith('□')):
                break
            pl.append(nl); i += 1
        flowables.append(Paragraph(format_inline(' '.join(pl)), styles['body']))

    return flowables


# ═══════════════════════════════════════════════════════════════
# TABLE BUILDER
# ═══════════════════════════════════════════════════════════════

def build_table(table_lines, styles):
    rows = []
    for j, line in enumerate(table_lines):
        if '---' in line and j == 1: continue
        cells = [c.strip() for c in line.strip('|').split('|')]
        rows.append(cells)
    if not rows: return Spacer(1, 1)

    th = ParagraphStyle('th', fontName=F_UI_B, fontSize=9, leading=13, textColor=C_WHITE)
    td = ParagraphStyle('td', fontName=F_BODY, fontSize=9, leading=13, textColor=C_DARK_GRAY)
    cw = (PAGE_W - ML - MR) / max(len(r) for r in rows)

    data = []
    for j, row in enumerate(rows):
        st = th if j == 0 else td
        data.append([Paragraph(format_inline(c), st) for c in row])

    t = Table(data, colWidths=[cw]*len(data[0]))
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_NEAR_BLACK),
        ('TEXTCOLOR', (0,0), (-1,0), C_WHITE),
        ('BOTTOMPADDING', (0,0), (-1,0), 8),
        ('TOPPADDING', (0,0), (-1,0), 8),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [C_PALE, C_WHITE]),
        ('TOPPADDING', (0,1), (-1,-1), 6),
        ('BOTTOMPADDING', (0,1), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('LINEBELOW', (0,0), (-1,0), 2, C_ACCENT),
        ('LINEBELOW', (0,1), (-1,-2), 0.5, C_LIGHT_GRAY),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    return t


# ═══════════════════════════════════════════════════════════════
# PAGE TEMPLATE HANDLER
# ═══════════════════════════════════════════════════════════════

class BookTemplate:
    def __init__(self):
        self.current_chapter = ""
        self.current_chapter_num = 0

    def cover(self, canvas, doc):
        canvas.saveState()
        w, h = PAGE_W, PAGE_H
        canvas.setFillColor(C_BLACK)
        canvas.rect(0, 0, w, h, fill=1, stroke=0)
        canvas.setFillColor(C_ACCENT)
        canvas.rect(0, h-8, w, 8, fill=1, stroke=0)
        if COVER_FEATURE:
            canvas.setFillColor(C_NEAR_BLACK)
            canvas.setFont(F_DISPLAY, 220)
            canvas.drawString(ML-10, h-300, COVER_FEATURE)
        canvas.setFillColor(C_ACCENT)
        canvas.rect(ML, h-320, 120, 4, fill=1, stroke=0)
        canvas.setFillColor(C_WHITE)
        canvas.setFont(F_DISPLAY, 38)
        for j, tl in enumerate(textwrap.wrap(BOOK_TITLE, width=28)):
            canvas.drawString(ML, h-390-j*42, tl.upper())
        if BOOK_SUBTITLE:
            y = h - 390 - len(textwrap.wrap(BOOK_TITLE, 28))*42 - 10
            canvas.setFillColor(C_MID_GRAY)
            canvas.setFont(F_UI, 13)
            canvas.drawString(ML, y, BOOK_SUBTITLE)
        if BOOK_AUTHOR:
            canvas.setFillColor(C_ACCENT)
            canvas.setFont(F_UI_B, 11)
            canvas.drawString(ML, MB+60, f"BY {BOOK_AUTHOR.upper()}")
        canvas.setFillColor(C_ACCENT)
        canvas.rect(0, 0, w, 4, fill=1, stroke=0)
        canvas.restoreState()

    def toc(self, canvas, doc):
        canvas.saveState()
        canvas.setFillColor(C_ACCENT)
        canvas.rect(0, PAGE_H-3, PAGE_W, 3, fill=1, stroke=0)
        canvas.setFillColor(C_LIGHT_GRAY)
        canvas.rect(0, 0, PAGE_W, 1, fill=1, stroke=0)
        canvas.restoreState()

    def chapter(self, canvas, doc):
        canvas.saveState()
        w, h = PAGE_W, PAGE_H
        pn = doc.page
        # Header
        canvas.setStrokeColor(C_LIGHT_GRAY)
        canvas.setLineWidth(0.5)
        canvas.line(ML, h-MT+20, w-MR, h-MT+20)
        if self.current_chapter:
            canvas.setFillColor(C_MID_GRAY)
            canvas.setFont(F_UI, 7.5)
            canvas.drawString(ML, h-MT+28, self.current_chapter.upper())
        canvas.setFillColor(C_LIGHT_GRAY)
        canvas.setFont(F_UI, 7.5)
        canvas.drawRightString(w-MR, h-MT+28, BOOK_TITLE.upper())
        # Footer
        canvas.setStrokeColor(C_LIGHT_GRAY)
        canvas.line(ML, MB-15, w-MR, MB-15)
        canvas.setFillColor(C_ACCENT)
        canvas.setFont(F_DISPLAY, 10)
        canvas.drawCentredString(w/2, MB-30, str(pn))
        canvas.circle(w/2-18, MB-26, 1.5, fill=1, stroke=0)
        canvas.circle(w/2+18, MB-26, 1.5, fill=1, stroke=0)
        canvas.restoreState()


# ═══════════════════════════════════════════════════════════════
# BOOK BUILDER
# ═══════════════════════════════════════════════════════════════

def build_book(chapters, output_path):
    """
    Build a complete multi-chapter book.

    Args:
        chapters: list of dicts [{"num": 1, "title": "...", "markdown": "..."}, ...]
        output_path: file path for the output PDF
    """
    tmpl = BookTemplate()
    frame = Frame(ML, MB, PAGE_W-ML-MR, PAGE_H-MT-MB, id='content')

    doc = BaseDocTemplate(
        output_path, pagesize=letter,
        leftMargin=ML, rightMargin=MR, topMargin=MT, bottomMargin=MB,
        title=BOOK_TITLE, author=BOOK_AUTHOR)

    doc.addPageTemplates([
        PageTemplate(id='cover', frames=[frame], onPage=tmpl.cover),
        PageTemplate(id='toc', frames=[frame], onPage=tmpl.toc),
        PageTemplate(id='chapter', frames=[frame], onPage=tmpl.chapter),
    ])

    story = []

    # Cover
    story.append(NextPageTemplate('cover'))
    story.append(Spacer(1, 1))
    story.append(NextPageTemplate('toc'))
    story.append(PageBreak())

    # TOC
    story.append(Spacer(1, 20))
    story.append(Paragraph("CONTENTS", STYLES['toc_title']))
    story.append(AccentBar(width=60, thickness=3))
    story.append(Spacer(1, 20))

    for ch in chapters:
        row = Table([[
            Paragraph(f'<font color="{C_ACCENT.hexval()}">{ch["num"]:02d}</font>',
                      ParagraphStyle('tn', fontName=F_DISPLAY, fontSize=14,
                                     textColor=C_ACCENT, leading=20)),
            Paragraph(ch["title"],
                      ParagraphStyle('tt', fontName=F_UI, fontSize=11,
                                     leading=20, textColor=C_NEAR_BLACK)),
        ]], colWidths=[40, PAGE_W-ML-MR-50])
        row.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LINEBELOW', (0,0), (-1,-1), 0.5, C_LIGHT_GRAY),
            ('LEFTPADDING', (0,0), (0,0), 0),
        ]))
        story.append(row)

    # Chapters
    for ch in chapters:
        story.append(NextPageTemplate('chapter'))
        story.append(PageBreak())
        story.append(SetChapterAction(tmpl, f"Chapter {ch['num']}: {ch['title']}", ch['num']))
        story.extend(parse_markdown(ch["markdown"], STYLES))

    print(f"Building {len(chapters)}-chapter book...")
    doc.build(story)
    print(f"Done! Saved to {output_path}")


def build_report(markdown_content, output_path, title=None, subtitle=None, author=None):
    """
    Build a single-document report/whitepaper.

    Args:
        markdown_content: Raw markdown string
        output_path: File path for the output PDF
    """
    t = title or BOOK_TITLE
    tmpl = BookTemplate()
    tmpl.current_chapter = t
    frame = Frame(ML, MB, PAGE_W-ML-MR, PAGE_H-MT-MB, id='content')

    doc = BaseDocTemplate(output_path, pagesize=letter,
        leftMargin=ML, rightMargin=MR, topMargin=MT, bottomMargin=MB,
        title=t, author=author or BOOK_AUTHOR)

    doc.addPageTemplates([
        PageTemplate(id='cover', frames=[frame], onPage=tmpl.cover),
        PageTemplate(id='body', frames=[frame], onPage=tmpl.chapter),
    ])

    story = [
        NextPageTemplate('cover'), Spacer(1, 1),
        NextPageTemplate('body'), PageBreak(),
    ]
    story.extend(parse_markdown(markdown_content, STYLES))

    print("Building report...")
    doc.build(story)
    print(f"Done! Saved to {output_path}")


# ═══════════════════════════════════════════════════════════════
# EXAMPLE USAGE (when run directly)
# ═══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    # Example: Build a small demo book
    demo_chapters = [
        {
            "num": 1,
            "title": "Getting Started",
            "markdown": """# Chapter 1: Getting Started

## Your First Steps Into the Future

Welcome to the demo. This chapter shows the **basic formatting** capabilities.

### Code Blocks Work

```python
def hello():
    print("Studio-grade PDF!")
    return True
```

### Lists Too

- First bullet point with **bold text**
- Second bullet with `inline code`
- Third bullet with a [link](https://example.com)

### And Tables

| Feature | Status | Notes |
|---------|--------|-------|
| Cover page | Done | Dark editorial style |
| Code blocks | Done | Syntax highlighting |
| Tables | Done | Alternating rows |

---

That's the basics. Customize the CONFIG section and build your own!
"""
        },
    ]

    build_book(demo_chapters, OUTPUT_PATH)
    print(f"\nOpen {OUTPUT_PATH} to see the result.")
