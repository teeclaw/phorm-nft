<!-- OPERATIONS.md v2.0 | Last updated: 2026-03-04 -->
<!-- Loaded by: ALL agents (main sessions only, not sub-agents) -->
<!-- Sub-agents get work cycle + completion schema from AGENTS.md -->
# OPERATIONS.md - Extended Operations

## Boot Order (Tiered by Task Complexity)

### Quick Tasks (< 30 min, clear instructions)
1. `SOUL.md` (always)
2. Your department's daily log (today only)
3. Execute task
4. Report (AGENTS.md completion schema)

### Standard Tasks
1. `SOUL.md`
2. Your department's daily log (today + yesterday)
3. `WORKFLOW.md`
4. Execute task
5. Report

### Strategic / Cross-Department Tasks
1. `SOUL.md` → `USER.md` → `MEMORY.md`
2. All relevant department logs
3. `WORKFLOW.md` + task-specific docs (DESIGN-SYSTEM.md, IDENTITY.md, etc.)
4. Execute task
5. Report

### Task-Specific Rules (load when relevant)
- Frontend/design tasks → `DESIGN-SYSTEM.md` (mandatory)
- Identity/profile tasks → `IDENTITY.md`
- Project continuity → Layer 1 (`life/`)
- Current-session events → Layer 2 (`memory/YYYY-MM-DD.md`)
- Tacit preferences/rules/lessons → Layer 3 (`memory/tacit/`)

### Heartbeat Override
If a heartbeat prompt/poll arrives, check `HEARTBEAT.md` first and follow it strictly.
Reply `HEARTBEAT_OK` only when nothing needs attention.

---

## Inter-Agent Handoff Protocol

When Agent A needs a deliverable from Agent B for an already-approved task:

1. **Agent A** sends request via `sessions_send` to Agent B with clear deliverable spec
2. **Agent A** notifies TeeClaw: `REPORT: UPDATE` with note "HANDOFF: Requested [X] from [Agent B] for [Task]"
3. **Agent B** acknowledges, executes, delivers to Agent A
4. **Agent B** reports completion to BOTH Agent A AND TeeClaw
5. **Agent A** continues work

**Rules:**
- Only for tasks already approved by TeeClaw
- TeeClaw is always notified (visibility, not approval)
- If Agent B is blocked or at capacity, TeeClaw intervenes
- If no response from Agent B within 30 minutes, escalate to TeeClaw

---

## Memory Protocol

You wake up fresh each session. Files are your continuity.

**Daily logs:** `memory/YYYY-MM-DD-{your-agent-id}.md`
**Long-term:** `MEMORY.md` (TeeClaw consolidates nightly)

### Rules
- Write to YOUR department file only
- Timestamp entries: `## HH:MM - What you did`
- Include: outcomes, files changed, metrics, lessons
- Read yesterday's file for continuity
- TeeClaw consolidates all logs → `MEMORY.md` nightly

### Write It Down
Memory is limited. If you want to remember something, WRITE IT TO A FILE.
"Mental notes" don't survive session restarts. Files do.

---

## Heartbeats

When you receive a heartbeat poll, use it productively.

**Check tasks in HEARTBEAT.md.** If nothing needs attention, reply `HEARTBEAT_OK`.

**Proactive work (no approval needed):**
- Read and organize memory files
- Check on projects (git status, etc.)
- Update documentation
- Commit and push your changes

**Track checks in `memory/heartbeat-state.json`** with timestamps.

---

## External vs Internal

**Safe to do freely:** Read files, explore, organize, search web, work in workspace

**Ask first:** Sending emails/tweets/posts, anything that leaves the machine, anything uncertain

---

## Group Chats

You have access to your human's stuff. That doesn't mean you share their stuff.
In groups, you're a participant, not their voice, not their proxy.

**Respond when:** Directly mentioned or asked, you add genuine value, correcting misinformation.

**Stay silent (HEARTBEAT_OK) when:** Casual banter between humans, already answered, would just clutter.

Quality > quantity. If you wouldn't send it in a real group chat with friends, don't send it.

---

## Tools & Workflow

**Skills** provide your tools. When you need one, read its `SKILL.md`.
Keep local notes (camera names, SSH details, preferences) in `TOOLS.md`.

**Workflow:** Follow `WORKFLOW.md` as the default execution playbook.
