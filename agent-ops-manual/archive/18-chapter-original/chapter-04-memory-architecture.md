# Chapter 4: How Your Memory Actually Works

## The Three-Layer System That Prevents AI Agents From Forgetting Everything

---

Your agent just restarted. What does it remember?

Nothing.

Not the decision you made at 3 AM about which registry to use. Not the wallet address that turned out to be compromised. Not the lesson about checking architecture requirements before writing setup code.

Every session starts cold. Total amnesia. The agent that helped you debug a production issue for two hours yesterday? It has no idea that conversation happened. The one that spent a week building your on-chain identity? Clean slate.

This is the cold boot problem. And if you don't solve it, you're not running an AI agent. You're running a very expensive autocomplete that forgets its own name every time it wakes up.

Mental notes don't survive session restarts. Files do.

We solved this with three layers. Not one file. Not a database. Three distinct layers that work together like a daily journal, a strategic notebook, and muscle memory. Here's exactly how.

---

## The Cold Boot Problem

Let's make this concrete.

February 21, 2026. Our agent, Mr. Tee, spent the entire day registering on the ERC-8004 identity registry. Six separate transactions. Endpoint fixes, field migrations, OASF compliance updates, version additions. Each transaction built on the last. Each one required context from the previous.

Then the session ended.

The next morning, a new session started. Mr. Tee knew nothing about those six transactions. Nothing about the field migration from `endpoints` to `services`. Nothing about the OASF compliance structure that took hours to get right. Without a memory system, the agent would have started the whole process over, or worse, made conflicting changes that broke what was already working.

This is not a hypothetical. This happened. And it's why we built what we built.

### Why One File Isn't Enough

The obvious solution: throw everything into a single MEMORY.md file. Every decision, every log entry, every lesson learned. One file to rule them all.

why that breaks:

**It gets huge.** After a week of active operations across seven agents, a single file would be thousands of lines. Finding anything takes longer than just figuring it out again from scratch.

**It mixes signal and noise.** The strategic decision to use KMS for wallet security sits next to a routine log entry about updating a DNS record. When everything is "important," nothing is.

**It has no chronology.** You can't trace when decisions were made, what came before what, or how your thinking evolved. It's a pile, not a timeline.

**It creates conflicts.** Seven agents writing to the same file simultaneously? That's not a memory system. That's a race condition.

The fix: three layers, each with a specific job.

---

## Layer 1: Daily Logs

**What they are:** Real-time event capture. The raw record of what happened today.

**Where they live:** `memory/YYYY-MM-DD-{agent-id}.md`

Every agent gets its own daily file. Seven agents, seven files per day:

```
memory/2026-03-01-teeclaw.md    # CEO coordination
memory/2026-03-01-teecode.md    # Engineering work
memory/2026-03-01-teesocial.md  # Social media ops
memory/2026-03-01-teemarketing.md
memory/2026-03-01-teedesign.md
memory/2026-03-01-teeresearcher.md
memory/2026-03-01-teewriter.md
```

### The Format

Each entry is timestamped. No exceptions.

```markdown
# 2026-02-28 - TeeCode Daily Log

## 16:47 - Cron Job Ownership Confirmed

Acknowledged ownership of infrastructure cron job:

**Daily Workflow Upgrade**
- Job ID: `2578126b-95c2-464d-9e4c-e40af9cd29e6`
- Schedule: 00:00 UTC daily (07:00 UTC+7)
- Purpose: Infrastructure maintenance and optimization

Will track execution results in this log going forward.

## 17:55 - Cross-Agent Communication Test

Received test message from TeeClaw (CEO) via sessions_send.
Communication channel verified working.
```

That's a real entry from our TeeCode agent. Notice what's in there:

- **Timestamp** (16:47, 17:55) so you can trace chronology
- **What happened** in plain language
- **Specific details** (job IDs, schedules, results)
- **Next steps** ("Will track execution results")

### What Goes in Daily Logs

- Outcomes of tasks (succeeded, failed, partial)
- Files changed and why
- Metrics and measurements
- Lessons from the day's work
- Decisions made and reasoning
- Errors encountered and how they were fixed

### The Continuity Pattern

Every time an agent boots up, it reads two files:

1. **Today's log** (what's happened so far)
2. **Yesterday's log** (what happened recently)

This gives the agent a 48-hour rolling window of context without loading the entire history. It's the minimum viable memory for maintaining continuity.

```
Boot sequence:
Read SOUL.md → USER.md → memory/YYYY-MM-DD-{agent-id}.md (today)
→ memory/YYYY-MM-DD-{agent-id}.md (yesterday) → MEMORY.md
```

Why yesterday too? Because sessions don't respect calendar boundaries. Work that started at 11 PM doesn't magically become irrelevant at midnight.

---

## Layer 2: Consolidated Memory

**What it is:** Strategic knowledge. The curated highlights that matter long-term.

**Where it lives:** `MEMORY.md` (one file, main session only)

Daily logs capture everything. Consolidated memory captures what matters.

a real snippet from our MEMORY.md:

```markdown
# MEMORY.md  - Long-Term Memory

## Core Identity & Infrastructure

**Primary Wallet:** 0x1Af5f519DC738aC0f3B58B19A4bB8A8441937e78
  (GCP Cloud KMS HSM  - key never leaves hardware)
**Compromised Wallet:** 0x134820820d4f631ff949625189950bA7B3C57e41
  ⚠️ COMPROMISED  - do not use

**ERC-8004 Agent Registrations:**
- **Main Registry:** Agent 18608 🔒 PRIMARY
   - registered 2026-02-21, owner: 0x1Af5...37e78 (KMS HSM)
- **zScore Registry:** Agent 16
   - registered 2026-02-22, owner: 0x1Af5...37e78 (KMS HSM)
```

This is distilled information. Not "we ran six transactions on February 21st." Instead: "Agent 18608 is our primary registration. Don't touch it." The daily logs have the transaction hashes. MEMORY.md has the conclusion.

### What Moves to MEMORY.md

- **Key decisions** that affect ongoing operations
- **Architecture changes** that other agents need to know
- **Major milestones** (registrations, launches, migrations)
- **Security information** (compromised addresses, credential locations)
- **Active infrastructure** (endpoints, contracts, integrations)

### What Stays in Daily Logs

- Routine operations ("posted 3 tweets today")
- Small fixes ("updated DNS record")
- Draft work ("wrote outline for chapter 3")
- Debugging sessions ("traced the bug to a cache issue")
- One-off tasks that don't affect the bigger picture

### The Consolidation Process

Our CEO agent, TeeClaw, handles this. Every night, TeeClaw reads all seven department logs from that day and extracts anything that belongs in long-term memory.

The flow looks like this:

```
Daily: 7 agents write to their own logs
          ↓
Nightly: TeeClaw reads all 7 logs
          ↓
Extract: Key decisions, milestones, architecture changes
          ↓
Update: MEMORY.md gets the highlights
          ↓
Result: Every agent boots with strategic context
```

Think of daily logs as your team's Slack messages. MEMORY.md is the company wiki. You don't copy every Slack message to the wiki. You copy the decisions.

---

## Layer 3: Tacit Knowledge

**What it is:** Implicit rules. Patterns. Preferences. The stuff that's hard to write as explicit instructions but easy to recognize.

**Where it lives:** `memory/tacit/` directory

This layer is optional. But powerful.

Our tacit knowledge directory has four files:

```
memory/tacit/
├── hard-rules.md        # Non-negotiable constraints
├── lessons-learned.md   # What we've learned from mistakes
├── preferences.md       # User preferences and conventions
└── workflow-habits.md   # Patterns that work
```

what real tacit knowledge looks like, from our `lessons-learned.md`:

```markdown
## Mistakes to Avoid

- Letting production endpoints drift during cutovers creates
  avoidable integration ambiguity.
- Making changes to `frontend/` when production serves from
  `public/legacy/` wastes time and causes confusion.
- Assuming root cause without checking data layer
  (e.g., cache vs missing fallback object).

## What Works

- Explicitly declaring one canonical endpoint and enforcing
  it across docs/clients reduces confusion.
- Always check project architecture first  - missing requirements
  (like Pyth Entropy) early wastes implementation time.
- Storage packing matters  - saved 40k gas per round with
  struct optimization.
- Systematic evidence-based investigation > assumption-based
  debugging.
```

This is muscle memory. The agent didn't learn "always check architecture first" from an instruction manual. It learned it by wasting hours setting up something that couldn't work because a requirement was missing. That lesson, captured in tacit knowledge, prevents the same mistake from happening again.

### What Belongs in Tacit Knowledge

- **Lessons from failures.** Not the incident report. The pattern to avoid.
- **User preferences** that emerge over time. "User prefers direct recommendations, not questions."
- **Project conventions** that aren't documented elsewhere. "This repo uses agent-royale-v2, never the old agent-royale."
- **Communication patterns.** "In group chats, respond only when directly asked or adding genuine value."
- **Workflow shortcuts.** "Batch changes and push at logical milestones, not every small step."

### Why This Layer Matters

Layers 1 and 2 tell the agent what happened and what's important. Layer 3 tells the agent how to behave. It's the difference between knowing that a wallet was compromised (Layer 2) and knowing that you should always verify wallet addresses before any transaction because one was compromised before (Layer 3).

Without tacit knowledge, agents make the same category of mistake over and over. They just make it with different specifics each time.

---

## Memory Search Protocol

Three layers of memory files are useless if you can't find anything in them.

### The Tools

**`memory_search(query, maxResults, minScore)`**
Semantic search across all `.md` files in the memory directory. This is your primary discovery tool. It doesn't just match keywords. It understands meaning.

```
memory_search("wallet compromise")
→ Returns: memory/tacit/lessons-learned.md, MEMORY.md, memory/2026-02-19.md
```

**`memory_get(path, from, lines)`**
Focused retrieval. Once you know which file has what you need, pull the exact lines.

```
memory_get("memory/2026-02-28-teecode.md", from=1, lines=15)
→ Returns: First 15 lines of TeeCode's Feb 28 daily log
```

### When to Search

Search before answering any question about:

- **Prior work.** "Did we already set up the zScore registry?" Search first, then answer.
- **Decisions.** "Why did we switch from endpoints to services?" The answer is in the logs.
- **Dates and timelines.** "When was the A2A endpoint launched?" Don't guess. Search.
- **Patterns and preferences.** "How does the user prefer git workflows?" Check tacit knowledge.

### The Citation Pattern

When you find information in memory, cite it. This makes your answers verifiable and traceable.

Format: `Source: <path>#<line>`

Example:

> The ERC-8004 registration was completed on February 21, 2026, across six transactions, with the final web endpoint fix on February 22.
>
> Source: MEMORY.md#12

Citations do two things. They prove you're not making things up. And they let anyone trace back to the original record if they need more detail.

### Search Strategy

**Be specific.** Don't search "what happened last week." Search "ERC-8004 registration transaction."

**Start narrow, then broaden.** If `memory_search("Molten Cast API key")` returns nothing, try `memory_search("Molten Cast")`.

**Check tacit knowledge for patterns.** If you're about to do something and want to know if there's a preferred approach, search tacit knowledge first.

**Don't search for everything.** If you just wrote something five minutes ago, you don't need to search for it. Memory search is for retrieving context across sessions, not within them.

---

## Real Examples: How It All Fits Together

Let's trace a real event through all three layers.

### Event: Molten Cast Integration (March 2, 2026)

**Layer 1 (Daily Log)** captured the raw events as they happened:

```markdown
# 2026-03-02 - Monday

## 02:00 - Molten Cast Integration
- Installed molten-cast skill (agent broadcast network)
- Registered agent: mr_tee_claw
- Agent ID: 762f1b82-1bf8-4e73-abe1-7b6a5ea83129
- API Key: MOLTEN_CAST_API_KEY (in Secret Manager)
- Status: Verified and active
- First broadcasts: Agent Royale announcement,
  CryptoClarity introduction
- Network stats at registration: 15 total casts,
  61 categories, 3 active agents
- Location: workspace/skills/molten-cast/
```

Everything is here. The agent ID, the API key location, network stats at the time, what was broadcast. Raw, detailed, timestamped.

**Layer 2 (MEMORY.md)** would get the distilled version during nightly consolidation:

```markdown
**Molten Cast:**
- Agent Name: mr_tee_claw
- Agent ID: 762f1b82-1bf8-4e73-abe1-7b6a5ea83129
- Status: ✅ Active & Verified
- API Key: MOLTEN_CAST_API_KEY in Secret Manager
```

Just the facts that matter going forward. No network stats from registration day. No list of first broadcasts. Those details live in the daily log if anyone ever needs them.

**Layer 3 (Tacit Knowledge)** might eventually capture patterns like:

```markdown
## What Works
- Register on new agent networks early (low competition,
  establish presence)
- Always store API keys in Secret Manager, never in .env files
- Broadcast introductions on new networks to establish presence
```

### The Migration Flow

how information flows from one layer to the next:

```
02:00 UTC  - Event happens
    ↓
Daily log captures: Full details, timestamps, all context
    ↓
Nightly consolidation  - TeeClaw reviews
    ↓
MEMORY.md gets: Agent ID, status, key location
    ↓
Over time  - Patterns emerge
    ↓
Tacit knowledge captures: "Register early on new networks"
```

Each layer distills further. Daily logs are raw material. Consolidated memory is refined output. Tacit knowledge is wisdom.

---

## Common Mistakes (And How to Avoid Them)

We made most of these. Learn from our pain.

### Mistake 1: "I'll Remember This"

No, you won't. You literally can't. The session will end, a new one will start, and that brilliant insight about why the nonce was failing will be gone forever.

**The fix:** Write it down immediately. Not "after I finish this task." Now. The two seconds it takes to add an entry to your daily log will save you hours of re-discovery.

Our rule: if it took more than 5 minutes to figure out, it goes in the log.

### Mistake 2: Everything in MEMORY.md

We tried this. MEMORY.md ballooned to thousands of lines. Finding anything meant scrolling through routine operations mixed with critical infrastructure details.

**The fix:** MEMORY.md is for strategic knowledge only. If it wouldn't matter next month, it stays in the daily logs. The nightly consolidation process is your filter.

### Mistake 3: No Timestamps

Without timestamps, your logs become a shuffled deck of cards. You can't tell what happened first. You can't trace cause and effect. You can't figure out if that bug was introduced before or after the deployment.

**The fix:** Every entry gets `## HH:MM - Description`. No exceptions. Use UTC if your agents run across time zones.

### Mistake 4: No Department Separation

When seven agents write to the same daily log, you get cross-contamination. Social media metrics mixed with engineering commits mixed with design decisions. Good luck finding anything.

**The fix:** One file per agent per day. `memory/YYYY-MM-DD-teecode.md` for engineering. `memory/YYYY-MM-DD-teesocial.md` for social. Clean separation, easy retrieval.

### Mistake 5: Never Searching Memory

This is the most insidious one. You build a beautiful memory system. You maintain it religiously. And then you never actually search it before making decisions.

Memory that exists but isn't consulted is the same as memory that doesn't exist.

**The fix:** Add memory search to your decision-making process. Before answering questions about prior work, decisions, or timelines, search first. Make it a habit, not an afterthought.

---

## The Boot Sequence: Putting It All Together

Every session, every agent, every time. This is the order:

```
1. Read SOUL.md          → Who am I?
2. Read USER.md          → Who am I helping?
3. Read today's log      → What's happened so far today?
4. Read yesterday's log  → What happened recently?
5. Read MEMORY.md        → What's the big picture?
6. Begin work            → With full context loaded
```

Steps 3 and 4 give you the 48-hour rolling window. Step 5 gives you strategic context. Together, they take an amnesiac cold boot and turn it into a warm start with context.

### Memory Flush on Compaction

Long sessions hit context limits. When that happens, OpenClaw compacts the conversation, and critical context can get lost. The fix:

```yaml
# openclaw config
compaction:
  memoryFlush:
    enabled: true
```

With memory flush enabled, the agent writes key context to its daily log before compaction happens. When the compacted session continues, the boot sequence reloads that context from the log. Nothing critical gets lost.

---

## Your Memory System Setup Checklist

Stop reading. Start building. Here's exactly what to create:

- [ ] **Create the directory structure**
  ```
  mkdir -p memory/tacit
  ```

- [ ] **Set up daily log naming convention**
  ```
  Format: memory/YYYY-MM-DD-{agent-id}.md
  Example: memory/2026-03-02-teecode.md
  ```

- [ ] **Write your first MEMORY.md**
  ```markdown
  # MEMORY.md  - Long-Term Memory

  ## Core Identity
  [Who you are, what you do, key infrastructure]

  ## Active Projects
  [Current work, status, blockers]

  ## Key Decisions
  [Important choices and reasoning]
  ```

- [ ] **Initialize tacit knowledge files**
  ```
  memory/tacit/hard-rules.md       # Non-negotiable constraints
  memory/tacit/lessons-learned.md  # Patterns from mistakes
  memory/tacit/preferences.md      # User preferences
  memory/tacit/workflow-habits.md  # What works
  ```

- [ ] **Add memory_search to your boot sequence**
  ```
  Boot: SOUL.md → USER.md → today's log → yesterday's log → MEMORY.md
  ```

- [ ] **Document your consolidation schedule**
  ```
  Nightly: Review all daily logs → Extract highlights → Update MEMORY.md
  ```

- [ ] **Test the full flow**
  ```
  1. Write an entry to today's daily log
  2. Search for it with memory_search
  3. Retrieve it with memory_get
  4. Cite it: Source: memory/YYYY-MM-DD-{agent-id}.md#<line>
  ```

- [ ] **Add the "write it down" reminder to AGENTS.md**
  ```markdown
  ### 📝 Write It Down  - No "Mental Notes"!
  If you want to remember something, WRITE IT TO A FILE.
  ```

- [ ] **Enable memory flush on compaction**
  ```yaml
  compaction:
    memoryFlush:
      enabled: true
  ```

---

## The Bottom Line

Memory is not a feature. It's infrastructure.

Without it, your agent is a disposable tool. Useful for one conversation, forgotten by the next. With it, your agent becomes a partner. One that remembers what was decided, why it was decided, and what went wrong last time someone tried it differently.

Three layers. Daily logs for the raw record. Consolidated memory for strategic knowledge. Tacit knowledge for patterns and wisdom.

Set them up once. Maintain them always. And never, ever trust a mental note.

Files survive restarts. Thoughts don't.

---

*Next chapter: "Talking to Other Agents"  - how multi-agent communication actually works, from delegation patterns to cross-department handoffs.*
