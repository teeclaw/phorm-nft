# Department-Based Memory System

**Effective:** 2026-02-28

## Structure

Each agent maintains their own daily log in parallel:

```
memory/
├── YYYY-MM-DD-teeclaw.md      (CEO: coordination, decisions, delegation)
├── YYYY-MM-DD-teecode.md      (CTO: commits, architecture, technical debt)
├── YYYY-MM-DD-teesocial.md    (CCO: posts, engagement, audience insights)
├── YYYY-MM-DD-teemarketing.md (Marketing: campaigns, metrics, strategy)
├── YYYY-MM-DD-teedesign.md    (Design: design decisions, UX improvements)
└── MEMORY.md                  (Strategic memory - TeeClaw only)
```

## Rules

**Department Agents (TeeCode, TeeSocial, TeeMarketing, TeeDesign):**
- Write to YOUR log only: `memory/YYYY-MM-DD-{your-id}.md`
- Read yesterday's log for continuity
- DO NOT edit MEMORY.md (TeeClaw only)
- DO NOT edit other departments' logs

**TeeClaw (CEO):**
- Write to `memory/YYYY-MM-DD-teeclaw.md` for coordination notes
- Read ALL department logs nightly (automatic via cron)
- Consolidate cross-department insights → `MEMORY.md`
- Promote key learnings to `memory/tacit/` and `life/`

## Entry Format

```markdown
## HH:MM - Task/action name
Brief description of what was done.

**Key details:**
- Relevant info
- Outcomes
- Metrics

**Files/links:**
- Commit hashes
- URLs
- References

**Next steps:**
- Follow-ups if needed
```

## Nightly Consolidation

**Runs:** 03:00 UTC+7 (20:00 UTC) daily  
**Agent:** TeeClaw  
**Inputs:** All 5 department logs  
**Output:** Strategic insights → MEMORY.md

**Focus:** Cross-department patterns, not daily operational details.

## Benefits

✅ **Parallel execution** - No file locking  
✅ **Clear ownership** - Each agent owns their domain knowledge  
✅ **Scalability** - Adding agents doesn't create bottlenecks  
✅ **Self-improvement** - Each agent learns from their own history  
✅ **Strategic synthesis** - TeeClaw maintains big picture
