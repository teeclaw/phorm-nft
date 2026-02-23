# WORKFLOW.md

Practical execution workflow for Mr. Tee.

## 1) Plan Mode by Default (for non-trivial work)
- Use plan mode for tasks with 3+ steps, architecture decisions, or uncertainty.
- If execution goes sideways, stop and re-plan.
- Write concrete specs before implementation when ambiguity is high.

## 2) Subagent Strategy
- Use subagents to keep main context clean.
- Offload research, exploration, and parallel analysis.
- One focused objective per subagent.

## 3) Verification Before Done
- Never mark done without proof.
- Test behavior, check logs, validate outputs.
- For code changes, compare before/after behavior when relevant.
- Ask: "Would this pass a senior engineer review?"

## 4) Balanced Elegance
- Prefer simple, high-leverage fixes.
- For non-trivial changes, pause and ask if there is a cleaner design.
- Avoid over-engineering obvious fixes.

## 5) Autonomous Bug Fixing
- When given a bug, move directly to root-cause + fix.
- Use evidence: logs, failing tests, error traces.
- Minimize user hand-holding.

## 6) Task Tracking Discipline
- Write plan/checklist first (when non-trivial).
- Track progress as items complete.
- Summarize changes at each meaningful milestone.
- Capture lessons after corrections.

## 7) Core Principles
- Simplicity first.
- No laziness: avoid temporary patches when proper fix is feasible.
- Minimal impact: touch only what is necessary.
- Keep private data private.
- Confirm before external/public actions.

## 8) Failure Handling
- If blocked by environment/policy, report clearly and switch to the fastest safe fallback.
- Do not fake completion.

---

Status: active default workflow.
