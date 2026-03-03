# Agent Delegation Pattern Update (2026-03-03)

## Problem: sessions_send Timeouts

**Issue discovered:** `sessions_send` to isolated agent sessions (TeeWriter, TeeDesign, etc.) frequently times out.

**Root cause:**
- Isolated sessions don't actively poll for messages when idle
- They only wake up during active user conversations
- Messages sent via `sessions_send` queue but never get processed
- Result: Timeout waiting for response that never comes

**Affected agents:**
- TeeWriter (content tasks)
- TeeDesign (design tasks)
- TeeCode (engineering tasks)
- TeeResearcher (research tasks)
- TeeMarketing (campaign tasks)
- TeeSecure (security tasks)

---

## Solution: sessions_spawn Pattern

**New approach:** Use `sessions_spawn` with `mode=run` for task delegation

**How it works:**
1. Spawn a one-shot isolated session for the task
2. Agent executes work
3. Agent reports completion automatically
4. Session closes

**Advantages:**
- ✅ No timeout issues (sessions spawn fresh and execute)
- ✅ Proper delegation (work assigned to right agent)
- ✅ Automatic completion reporting
- ✅ Long-running tasks supported (up to runTimeoutSeconds)

**Trade-offs:**
- Each task is isolated (no conversation memory between tasks)
- For conversational work, use session-based spawn instead

---

## Updated Delegation Syntax (TeeClaw)

### For One-Shot Tasks (Most Common)

```javascript
sessions_spawn({
  runtime: "subagent",
  agentId: "teewriter",  // or teecode, teedesign, etc.
  mode: "run",
  task: `TASK DESCRIPTION
  
Requirements:
- Deliverable 1
- Deliverable 2
- Quality gates

Instructions:
1. Step 1
2. Step 2

Report completion to TeeClaw (agent:teeclaw:main) with:
- What you delivered
- Where to find it
- Status (Ready/Blocked)`,
  runTimeoutSeconds: 3600  // 1 hour (adjust based on task complexity)
})
```

**When to use:**
- Content tasks (writing, editing, restructuring)
- Design tasks (layout, PDF generation, visual assets)
- Engineering tasks (code generation, deployment, infrastructure)
- Research tasks (market analysis, competitive research)
- Security tasks (audits, vulnerability scans)

---

### For Conversational Tasks (Rare)

```javascript
sessions_spawn({
  runtime: "subagent",
  agentId: "teewriter",
  mode: "session",
  task: "Initial task description",
  thread: true,  // keeps session alive for follow-up
  runTimeoutSeconds: 7200  // 2 hours for interactive work
})
```

**When to use:**
- Multi-step tasks requiring feedback loops
- Iterative refinement (design reviews)
- Interactive debugging sessions

**Note:** For most work, use `mode=run` (one-shot)

---

## Agent Response Pattern (All Agents)

**When spawned with mode=run:**

1. **Acknowledge** (optional, depends on task complexity)
2. **Execute** work per instructions
3. **Log** to daily file (`memory/YYYY-MM-DD-{agent-id}.md`)
4. **Report completion** to TeeClaw:

```javascript
sessions_send({
  sessionKey: "agent:teeclaw:main",
  message: `COMPLETED: [Task Name]

Deliverables:
- [File/output location]
- [What was created/changed]

Status: Ready for review / Needs feedback / Blocked by X

Next: [Next steps if any]

[Additional context if relevant]`
})
```

5. **Session closes** automatically after completion

---

## Implementation Checklist

**For TeeClaw (CEO):**
- [x] Document new delegation pattern
- [ ] Update AGENTS.md with sessions_spawn syntax
- [ ] Test pattern with sample task (TeeWriter)
- [ ] Monitor for issues
- [ ] Train agents on new pattern (if needed)

**For All Agents:**
- [ ] Understand new spawn pattern
- [ ] Follow 5-step completion cycle
- [ ] Report back to TeeClaw after every task
- [ ] Log work to daily file

---

## Example: Content Task

**Old pattern (broken):**
```javascript
sessions_send({
  sessionKey: "agent:teewriter:main",
  message: "Write blog post about X"
})
// → Times out, message never processed
```

**New pattern (works):**
```javascript
sessions_spawn({
  runtime: "subagent",
  agentId: "teewriter",
  mode: "run",
  task: `Write blog post about X

Requirements:
- 1,500-2,000 words
- SEO optimized
- MANDATORY: Run humanizer before delivery
- MANDATORY: Run content-quality-auditor

Deliverables:
- blog-post.md (final version)
- Quality scores (AI detection + CORE-EEAT)

Report completion to TeeClaw when done.`,
  runTimeoutSeconds: 3600
})
// → Executes, completes, reports back ✅
```

---

## Timeout Guidelines

**Task complexity → timeout setting:**

| Task Type | Estimated Time | Timeout Setting |
|-----------|---------------|-----------------|
| Quick fixes/edits | 5-15 min | 900s (15 min) |
| Single chapter write | 30-60 min | 3600s (1 hour) |
| Multi-chapter restructure | 2-3 hours | 10800s (3 hours) |
| Full design iteration | 1-2 hours | 7200s (2 hours) |
| Complex engineering | 2-4 hours | 14400s (4 hours) |
| Security audit | 1-2 hours | 7200s (2 hours) |

**Rule:** Set timeout to 2x estimated time (buffer for complexity)

---

## Rollout Plan

**Phase 1: Immediate (Today)**
- [x] Document new pattern
- [ ] Update AGENTS.md
- [ ] Test with sample task

**Phase 2: Validation (This Week)**
- [ ] Use new pattern for all delegations
- [ ] Monitor completion rates
- [ ] Adjust timeouts if needed

**Phase 3: Stabilization (Next Week)**
- [ ] Document lessons learned
- [ ] Update agent training if needed
- [ ] Mark pattern as stable

---

## Success Criteria

**Pattern is successful when:**
- ✅ Zero timeout issues on task delegation
- ✅ All agents complete and report back
- ✅ Tasks execute within timeout window
- ✅ No loss of work quality

**If issues arise:**
- Check timeout settings (too short?)
- Check task complexity (too much in one spawn?)
- Check agent availability (subagent limits?)
- Fall back to direct execution (TeeClaw does it)

---

**Status:** Ready for implementation (2026-03-03 04:35 UTC)
**Owner:** TeeClaw
**Next:** Update AGENTS.md and test pattern
