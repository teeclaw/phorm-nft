# 3-Layer Memory System for OpenClaw

## Layer 1: Knowledge Graph (Durable)
Location: `life/` (PARA)
- projects/
- areas/
- resources/
- archives/
- people/

## Layer 2: Daily Notes (Event Log)
Location: `memory/YYYY-MM-DD.md`
- conversation events
- decisions
- todo/follow-ups
- promotion candidates

Template: `memory/templates/daily-note-template.md`

## Layer 3: Tacit Knowledge (How You Work)
Location: `memory/tacit/`
- preferences.md
- workflow-habits.md
- hard-rules.md
- lessons-learned.md

## Cadence
- Real-time: write key events to daily note
- Nightly: run consolidation using `memory/CONSOLIDATION.md`
- Weekly: prune archives and refresh summary indexes
