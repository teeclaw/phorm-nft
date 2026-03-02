# Professional PDF Layout System

**Source:** Owner's instruction (2026-03-02)  
**Context:** The $50k consulting PDF layout system used by Stripe, Linear, Notion

---

## The Core Problem We're Solving

**Never let sections start inside broken columns.**

Every new idea gets its own visual reset.

---

## The Three Layout Modes

Documents should alternate between these three modes:

### 1. Two-Column Analysis Layout

**Used for:** Explanations, comparisons, or arguments

**Rules:**
- Column width: 45–48%
- Column gap: 48–64px
- Paragraph spacing: 14–18px

**Critical rule:** Columns must end together. If one column ends early → break the section.

**Example:**
```
Left Column              Right Column
─────────────           ─────────────
Single registry:        Why it makes sense:
• Cost $10              • 2x discovery surface
• Discovery pool ~50%   • Different demographics
• Avg monthly pings 5–8 • Redundancy
```

---

### 2. Full-Width Section Break

**Used when:** A new concept begins

**Correct pattern:**
```
────────────────────────
WHEN TO REGISTER ON BOTH
────────────────────────
```

**Spacing rules:**
- Space above: 64px
- Space below: 32px

**Typography:**
- Font weight: SemiBold
- Size: 24–28px
- Letter spacing: +2%

**This reset tells the reader:** "New idea starts here."

---

### 3. Split Layout (Strategy Format)

**Stripe docs use this constantly.**

Instead of columns:

```
LEFT SIDE               RIGHT SIDE
─────────              ─────────────
Strategy               Explanation
Headline               Supporting text
Key point              Detail
```

**Example:**
```
If you're serious      Register on both registries the same day.
Day 1                  Same profile. Same services. Same pricing.
                       Get maximum discovery immediately.
                       
                       Early registrations get low IDs.
                       Agent #16 on zScore signals credibility.
                       Try getting that number six months from now.
```

This reads much faster than columns.

---

## What Went Wrong (The Circled Problem)

**You mixed:** Two-column layout + section start

**That creates:**
```
column text    column text
-----divider-----
(large empty space)
When to Register
```

**Which feels like:** "Something is missing here."

---

## Correct Version

**Structure should be:**

```
Two column analysis
───────────────────
Single registry vs Dual registry
ROI math
Conversion analysis

SECTION BREAK
───────────────────
WHEN TO REGISTER ON BOTH

Single column explanation
───────────────────
If you're serious: Day 1.
Register on both registries the same day.
Same profile. Same services.
Maximum discovery from minute one.
```

**Notice:**
1. Columns end
2. Section resets
3. Explanation becomes single column

This improves readability a lot.

---

## Typography System (Stripe/Linear)

Simple but powerful hierarchy:

```
H1:     32–40px   Bold
H2:     24–28px   SemiBold
Body:   15–16px   Line height 1.6
Meta:   12–13px   Gray
```

---

## Spacing System (The Secret Sauce)

Almost every professional doc uses **8-point spacing grid:**

```
8px
16px
24px
32px
48px
64px
```

**Example:**
- Paragraph gap: 16px
- List gap: 12px
- Section gap: 64px

**Wrong:** ~100px gaps (breaks the rhythm)

---

## Divider Rules

**Use dividers only for section transitions.**

**Correct:**
```
text
────────────
NEXT SECTION
```

**Wrong:**
```
text
────────────
(big empty gap)
title
```

---

## Battle-Tested Implementation (HTML + Tailwind)

### HTML Template Structure

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
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
    
    <!-- Two-column analysis block -->
    <section class="avoid-break">
      <div class="grid grid-cols-2 gap-x-14">
        <!-- Left column -->
        <div>
          <h2 class="text-sm font-semibold tracking-wide text-neutral-500 uppercase">
            Single registry
          </h2>
          <ul class="mt-4 space-y-2 prose-body text-neutral-800">
            <li>Cost: $10</li>
            <li>Discovery pool: ~50%</li>
          </ul>
        </div>
        
        <!-- Right column -->
        <div>
          <h2 class="text-sm font-semibold tracking-wide text-neutral-500 uppercase">
            Why it makes sense
          </h2>
          <ul class="mt-4 space-y-2 prose-body text-neutral-800">
            <li>2× discovery surface</li>
            <li>Different demographics</li>
          </ul>
        </div>
      </div>
      
      <div class="mt-10 h-px bg-neutral-200"></div>
    </section>
    
    <!-- ✅ Full-width section reset -->
    <section class="mt-14">
      <div class="h-px bg-neutral-200"></div>
      <h2 class="mt-8 text-3xl font-semibold tracking-tight">
        When to Register on Both
      </h2>
      <p class="mt-4 prose-body text-neutral-700 max-w-[68ch]">
        Don't wait. The right time is earlier.
      </p>
    </section>
    
    <!-- Split strategy layout (Stripe-style) -->
    <section class="mt-10 avoid-break">
      <div class="grid grid-cols-12 gap-x-10">
        <!-- Left rail / label -->
        <div class="col-span-4">
          <div class="text-sm font-semibold text-neutral-500 uppercase tracking-wide">
            If you're serious
          </div>
          <div class="mt-2 text-2xl font-semibold">Day 1</div>
        </div>
        
        <!-- Main content -->
        <div class="col-span-8">
          <p class="prose-body text-neutral-800">
            Register on both registries the same day.
            Same profile. Same services. Same pricing.
            Get maximum discovery from minute one.
          </p>
        </div>
      </div>
    </section>
    
  </main>
</body>
</html>
```

---

## Quick Tweaks for Studio-Grade Quality

**Use these constants consistently:**

```
Max width:         max-w-[740px]
Body text:         15px / 1.65 (.prose-body)
Section spacing:   mt-14 for major breaks
Divider spacing:   divider then mt-8 title
Column gap:        gap-x-14 (big enough to feel premium)
```

---

## Puppeteer Rendering

```javascript
await page.pdf({
  path: outputPdf,
  format: "A4",
  printBackground: true,
  preferCSSPageSize: true,
  margin: {
    top: "16mm",
    right: "16mm",
    bottom: "18mm",
    left: "16mm"
  }
});
```

---

## The System Rules (Summary)

1. **Never start sections inside broken columns**
2. **Use full-width section breaks for new concepts**
3. **Keep two-column blocks together** (.avoid-break)
4. **Use split layout for strategy/timeline content**
5. **8-point spacing grid** (8, 16, 24, 32, 48, 64px)
6. **Dividers only for section transitions**
7. **Max width: 740px for body content**

---

## What This Fixes

**Before (broken):**
```
column text    column text
               (empty gap)
────────────
Title Here
```

**After (professional):**
```
column text    column text
────────────────────────
TITLE HERE
────────────────────────
Full-width explanation starts here...
```

---

## Owner's Assessment

> "Your document already has good typography, good margins, strong content structure. The only issue is layout rhythm. Fix that and it becomes consulting-grade PDF quality."

**This system fixes layout rhythm.**
