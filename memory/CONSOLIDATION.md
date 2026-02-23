# Nightly Consolidation (Layer 2 -> Layers 1 & 3)

## Input
- Today's `memory/YYYY-MM-DD.md`

## Steps
1. Extract durable facts:
   - People facts -> `life/people/`
   - Project facts -> `life/projects/`
   - Stable references -> `life/resources/`
2. Extract tacit knowledge:
   - Communication/workflow preferences -> `memory/tacit/preferences.md`
   - Hard rules -> `memory/tacit/hard-rules.md`
   - Lessons from mistakes -> `memory/tacit/lessons-learned.md`
3. Update summary indexes in `_summaries/`.
4. Move stale/inactive docs to `life/archives/`.

## Promotion Heuristic
Promote only if information is likely useful beyond 7 days.
