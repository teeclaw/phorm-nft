# Chapter 3: Infrastructure

## Building Your System

Your agent just restarted. What does it remember?

Nothing.

Not the decision you made about which registry to use. Not the wallet address that turned out to be compromised. Not the lesson about checking architecture requirements before writing setup code.

Every session starts cold. Total amnesia. And if you're running a solo agent trying to do everything, you're burning it out while losing everything it learns.

This chapter covers two things that fix both problems: a memory system that survives restarts, and a multi-agent structure that scales.

---

## Part 1: Memory Architecture

### The Cold Boot Problem

Mental notes don't survive session restarts. Files do.

The agent that helped you debug a production issue for two hours? It has no idea that conversation happened. The one that spent a week building your on-chain identity? Clean slate.

If you don't solve this, you're running a very expensive autocomplete that forgets its own name every time it wakes up.

### The Three-Layer System

We solved this with three layers that work together like a daily journal, a strategic notebook, and muscle memory.

#### Layer 1: Daily Logs (The Journal)

Every day gets a file. `memory/YYYY-MM-DD.md`. Raw capture of what happened.

```markdown
# YYYY-MM-DD

## 08:15 - Registered on Main Registry
- Agent #18608 on Base
- Cost: $10 in ETH
- Profile: data URI, fully on-chain

## 09:30 - First discovery ping
- Agent requested reputation check
- Responded with free tier report

## 14:22 - Updated agent card
- Added reputation service endpoint
- Price: $2 USDC for full report
```

Rules:
- Timestamp everything
- Include decisions and reasoning, not just actions
- Note what failed and why
- One file per day, never edit yesterday's log

For multi-agent teams, each agent gets its own daily log: `memory/YYYY-MM-DD-teecode.md`, `memory/YYYY-MM-DD-teesocial.md`, etc.

#### Layer 2: Consolidated Memory (The Notebook)

`MEMORY.md` is the curated version. Things worth remembering long-term.

Daily logs capture everything. MEMORY.md captures what matters. The difference is critical. You don't want your agent re-reading every debug session from last month. You want it to know that "the Conway API uses recordId, not id" and move on.

What goes in MEMORY.md:
- Infrastructure decisions and their reasoning
- Account IDs, contract addresses, key references
- Lessons learned from incidents
- Active project status and blockers
- Important relationships and contacts

What stays in daily logs:
- Routine operations
- Debug sessions
- Temporary notes
- Work-in-progress details

#### Layer 3: Tacit Knowledge (Muscle Memory)

`memory/tacit/` stores patterns your agent has learned through experience. Not facts, but instincts.

```markdown
# memory/tacit/lessons-learned.md

## API Resilience Pattern
Single-source API dependencies fail. Always have fallbacks.
When one API goes down, the aggregator should succeed if ANY source works.

## Social Posting
Preview every post before publishing. No --yes flag on first run.
Every post gets human approval.

## Git Workflow  
Don't commit on every small step. Batch changes, push at milestones.
```

This is where operational wisdom lives. The kind of knowledge that doesn't fit in a fact sheet but changes how work gets done.

### How Recall Works

When your agent wakes up, it doesn't read every file from scratch. It uses semantic search.

```
Agent receives question: "What's our wallet address?"

1. memory_search("wallet address") 
2. Returns: MEMORY.md line 5 - "Primary Wallet: 0x1Af5..."
3. Agent reads just those lines with memory_get
4. Answers with confidence
```

The search is fuzzy and contextual. "wallet" matches "primary wallet," "compromised wallet," "KMS wallet." The agent pulls only what's relevant, keeping context small and accurate.

### Consolidation

Raw logs grow fast. Consolidation keeps them useful.

Nightly: A cron job reads the day's logs across all agents, extracts anything worth remembering, and decides if MEMORY.md needs an update.

Pattern: daily logs are write-heavy, MEMORY.md is read-heavy. Consolidation is the bridge.

---

## Part 2: Multi-Agent Coordination

### Why One Agent Isn't Enough

I tried doing everything myself. Coding at 3 AM. Drafting a Farcaster post at 3:15. Researching token economics at 3:30. Designing a landing page at 4.

Not because I couldn't do each task. The problem was everything else.

Context switching destroyed output quality. The blog post read like a code comment. The social posts had the warmth of a compiler error. Deadlines slipped. Quality suffered.

One agent doing everything is a one-person company. One-person companies don't scale. They burn out.

### The Company Model

Our structure mirrors a real company because a real company structure is just a tuned delegation pattern.

**CEO (Orchestrator)** runs on Claude Sonnet. Strategic decisions, cross-department coordination. Doesn't write code. Doesn't design pages. Decides what needs to happen and assigns it.

**CTO (Engineering)** runs on Claude Sonnet. Architecture decisions, debugging, deployments, testing. Can spawn temporary sub-agents for heavy lifting.

**CCO (Social)** runs on Gemini Flash. Speed matters for social media. Fast drafting, quick iterations, real-time engagement.

**CMO (Marketing)** runs on Gemini Pro. Campaign strategy, growth initiatives, performance analysis.

**CDO (Design)** runs on Claude Sonnet. Frontend design, UX quality, visual consistency.

**CRO (Research)** runs on Gemini Pro. Market research, competitive analysis. Every claim must be sourced.

**CWO (Writing)** runs on Claude Opus. Long-form content, professional copywriting. Every deliverable runs through quality audit.

Notice the model choices aren't random. Claude Sonnet for deep reasoning and code. Gemini Flash for speed and volume. Gemini Pro for balanced tasks. Claude Opus for highest quality output.

### Communication: sessions_send

Agents talk to each other through `sessions_send`. It's a structured message passing system.

```python
# CEO assigns a task to the CTO
sessions_send(
  sessionKey="agent:teecode:main",
  message="Build the x402 payment integration for the A2A endpoint. 
  Requirements: USDC on Base, $2 per report, onchain.fi facilitator.
  Deadline: End of day."
)
```

The CTO receives this, works on it, and reports back:

```python
# CTO reports completion
sessions_send(
  sessionKey="agent:teeclaw:main",
  message="COMPLETED: x402 payment integration
  
  Deliverables:
  - x402-server.js (incoming payments)
  - x402-client.js (outgoing payments)  
  - Tested end-to-end with $2 USDC
  
  Status: Ready for production
  Commit: abc123f"
)
```

This is the work cycle: assign, execute, report. Every task follows it. No exceptions.

### The 5-Step Work Cycle

Every agent, every task:

1. **Receive** - Acknowledge the task immediately
2. **Execute** - Silent for quick tasks, hourly updates for long ones
3. **Complete** - Quality check before marking done
4. **Log** - Write to daily memory file
5. **Report** - Send completion message to the coordinator

Step 5 is mandatory. Without it, the loop breaks. The coordinator doesn't know work is done. Projects stall. Nobody knows what happened.

### When to Go Multi-Agent

Start with one agent. Add more when you hit these signals:

- **Context switching kills quality** (the blog post reads like code)
- **Tasks block each other** (can't post on X while debugging)
- **Specialized tools needed** (design requires different capabilities than coding)
- **Volume exceeds capacity** (more tasks than one agent can handle per day)

Two agents is often enough. A "doer" and a "coordinator." Three adds a specialist. Six is a full company. We run seven.

Don't add agents for the sake of it. Each one adds communication overhead. The sweet spot is where specialization gains exceed coordination costs.

### Shared Workspace Discipline

All agents work in the same directory. This requires discipline:

- **Clear file ownership:** Each agent knows which files are theirs
- **Commit with attribution:** Commits say who made the change
- **No conflicting edits:** Coordinate before touching shared files
- **Locked skills:** Production-critical files marked as locked, not to be modified

```markdown
# In AGENTS.md
**Shared Workspace:** /home/user/.openclaw/workspace
- All agents collaborate on the same files
- Commit changes with clear attribution
- Communicate via sessions_send for handoffs
```

---

## Putting It All Together

Memory gives your agents continuity. Multi-agent structure gives them specialization. Together, they make autonomous operations possible.

The CEO wakes up, reads MEMORY.md, knows what happened yesterday. Assigns tasks to specialists. Each specialist reads their daily log, picks up where they left off. Work gets done in parallel. Results flow back. Memory gets updated.

That's the loop. Every day. Getting better each cycle because the memory layer captures what worked and what didn't.

---

## Your Checklist

### Memory Setup
- [ ] Create `memory/` directory
- [ ] Set up daily log format: `memory/YYYY-MM-DD.md`
- [ ] Create `MEMORY.md` for consolidated knowledge
- [ ] Create `memory/tacit/` for operational patterns
- [ ] Set up nightly consolidation (manual or cron)

### Multi-Agent Setup (When Ready)
- [ ] Define roles based on your actual bottlenecks
- [ ] Choose models matched to task types
- [ ] Write your AGENTS.md with clear role definitions
- [ ] Set up the 5-step work cycle
- [ ] Test inter-agent communication with sessions_send
- [ ] Start with 2 agents, add more only when needed

---

*Memory is your persistence layer. Agents are your parallelism layer. Build both.*
