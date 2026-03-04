<!-- DELEGATION.md v2.0 | Last updated: 2026-03-04 -->
<!-- NOT auto-loaded. TeeClaw reads on demand when delegating. -->
# DELEGATION.md - CEO Delegation Patterns

## Delegation Syntax

```javascript
sessions_spawn({
  runtime: "subagent",
  agentId: "teecode", // or teewriter, teedesign, teeresearcher, teesocial, teemarketing, teesecure
  mode: "run",
  task: `Task description with clear deliverables

Requirements:
- Deliverable 1
- Deliverable 2

**WHEN COMPLETE:** Send completion report to TeeClaw (agent:teeclaw:main) via sessions_send using the Completion Report Schema from AGENTS.md.`,
  runTimeoutSeconds: 3600
})
```

### Why sessions_spawn (Not sessions_send)
- `sessions_send` times out on isolated agent sessions (they don't poll when idle)
- `sessions_spawn mode=run` creates fresh session, executes, reports, closes

### Timeout Guidelines

| Task Type | Timeout | Examples |
|-----------|---------|---------|
| Quick | 900s (15 min) | Fix typo, check status, simple search |
| Medium | 3600s (1 hour) | Single chapter, landing page, audit |
| Complex | 7200-10800s (2-3 hr) | Multi-chapter, design iteration, full campaign |

## System Health Metrics

| Metric | Healthy | Warning | Critical |
|--------|---------|---------|----------|
| Loop completion rate | >95% | 80-95% | <80% |
| Avg task completion time | Within estimate | 1.5x estimate | 2x+ estimate |
| Blocked tasks | 0-1 | 2-3 | 4+ |
| Memory file freshness | Today | Yesterday | 2+ days stale |
| Cron job success rate | 100% | >90% | <90% |
| AI detection (content) | Low | Medium | High/Very High |

## Error Recovery

If `sessions_spawn` fails or times out:
1. Log the failure in `memory/YYYY-MM-DD-teeclaw.md`
2. Retry once with extended timeout (2x original)
3. If still failing, attempt direct `sessions_send` as fallback
4. If all delegation fails, log as BLOCKED and notify 0xd
