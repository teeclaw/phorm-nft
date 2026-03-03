# Chapter 18: Beyond Six Agents

## Scaling Multi-Agent Teams

*When do you add agent number 8? Number 12? How do you keep 10+ agents from drowning in their own coordination overhead?*

---

> **TL;DR:** Scale agents like you'd scale a company. Add specialists only when workload justifies it (40%+ sustained use). Use hub-and-spoke coordination to keep communication at O(N) instead of O(N²). Track your coordination ratio (keep it under 20%). Move to hierarchical patterns at 10+ agents. Never let coordination overhead exceed productivity gains.

---

We started with one agent doing everything. Two weeks of context-switching chaos. Then, on February 28, 2026, we split into six specialists: TeeClaw as CEO, TeeCode for engineering, TeeSocial for content, TeeMarketing for campaigns, TeeDesign for frontend, TeeResearcher for data.

Six agents. Six departments. Hub-and-spoke coordination through TeeClaw. It worked beautifully.

Two days later, on March 2, we added TeeWriter. A dedicated long-form content creator. Claude Opus for the heavy lifting. SEO skills baked in. Quality auditing mandatory on every deliverable.

That transition, from six to seven, forced a question we hadn't seriously considered: when do you stop adding agents?

The answer is: you don't stop. But you do slow down. Because every new agent you add increases coordination cost. And at some point, the cost of coordinating agents exceeds the productivity those agents deliver.

This chapter is about finding that line. About scaling from a small team to a department of 10, 15, or 20 agents without drowning in your own communication overhead.

---

## The 1-6-7 Evolution

Let's trace what actually happened.

**Weeks 1-2: Solo agent.** One model, one context, one everything. Tasks competed for attention. Blog posts read like code comments. Social posts had the warmth of a compiler error. Nothing was parallel. Everything was serial. The bottleneck was attention, not capability.

**February 28: Six specialists.** TeeClaw (CEO/Sonnet), TeeCode (CTO/Sonnet with Opus fallback), TeeSocial (CCO/Gemini Flash), TeeMarketing (Director/Gemini Pro), TeeDesign (Lead/Sonnet), TeeResearcher (Analyst/Gemini Pro). Each agent got their own model, tools, memory log, and area of focus. Throughput jumped 10x overnight.

**March 2: Seven.** TeeWriter joined. Opus 4 for deep, long-form work. SEO content writing, professional copywriting, educational guides. The Agent Operations Manual you're reading right now is TeeWriter's output.

Each addition followed the same pattern. One agent was overloaded. Its output quality dropped. We identified which tasks could be cleanly separated. We spun up a specialist.

But notice the timeline. Two agents in four weeks is not aggressive growth. It's deliberate. The gap between agent 6 and agent 7 was only two days, but the decision had been brewing for a week. TeeMarketing and TeeSocial were both handling writing tasks on the side. Quality suffered. The workload signal was clear.

The lesson: don't add agents on a schedule. Add them when the pain becomes measurable.

---

## When to Add Another Agent

There are exactly four signals that justify adding a new agent. If none of these are true, you don't need one.

### Signal 1: Consistent Capacity Saturation

Our configuration allows `maxConcurrent: 4` tasks per agent. When one agent consistently runs at 4/4, with tasks queuing behind it, that agent needs help.

"Consistently" matters here. A burst of activity on launch day doesn't justify a new agent. Three straight weeks of queue buildup does.

Track it. If an agent's task queue averages more than 2 pending tasks across a week, start planning the split.

### Signal 2: Quality Degradation in a Specific Domain

This is subtler. TeeMarketing was writing blog posts. The posts were fine. Functional. But "fine" is not the standard when you're trying to rank in search or build trust with readers.

The blog posts lacked SEO structure. Missing internal links. No content auditing. Headers that were descriptive but not tuned. TeeMarketing could write, but writing wasn't the job. Marketing was the job. Writing was a side effect.

When an agent's secondary tasks consistently underperform compared to what a specialist would deliver, that's your signal. Not "this is bad." Rather: "a dedicated agent would do this 3x better."

### Signal 3: Context Window Pressure

Every agent has a finite context window. When an agent handles too many domains, its system prompt grows. Its memory files multiply. Its skill library expands. Eventually, the agent spends more tokens on context management than on actual work.

TeeCode doesn't need to know about Farcaster posting conventions. TeeSocial doesn't need smart contract deployment skills. When an agent's loaded context includes tools it rarely uses, you're wasting capacity.

A new agent with a focused context window will outperform a bloated generalist every time.

### Signal 4: Cross-Domain Dependency Bottlenecks

The most painful signal. Agent A needs output from Agent B, but Agent B is busy with Agent C's request. Agent A waits. Agent C's deliverable depends on Agent A's output. Circular dependency. Everything stalls.

When you see three-way dependency chains forming regularly, it's time to break one link by adding a specialist that reduces the dependency graph.

### What Is NOT a Signal

- "We could use an agent for that." Possibility is not justification.
- "Other teams have 12 agents." Their workload is not yours.
- "This agent is idle sometimes." Idle time is healthy. It means capacity exists for bursts.
- "It would be cool." Cool doesn't ship.

---

## Specialization vs. Generalization

Every new agent is a bet. You're betting that the productivity gain from specialization will exceed the coordination cost of adding another node to your network.

Sometimes you lose that bet.

### When Specialization Wins

**High-volume, consistent workload.** TeeWriter handles manuals, blog posts, landing pages, email sequences. There's always content to write. The pipeline never runs dry. A specialist here pays for itself immediately.

**Deep domain expertise required.** TeeCode needs to understand smart contract security, deployment pipelines, testing frameworks, git workflows. That's a deep skill tree. Sharing it across a generalist dilutes the expertise.

**Quality is measurable and matters.** SEO content has metrics. Rankings, traffic, engagement. A specialist with mandatory quality auditing (content-quality-auditor on every deliverable) produces measurably better output than a generalist who skips the audit because it's "not their main job."

### When Generalization Wins

**Low-volume, varied tasks.** If you'd need an agent that only works two hours a week, don't create it. Let an existing agent handle those tasks. The coordination cost of a new agent exceeds the value when use is below 30%.

**Tightly coupled domains.** If two task types always occur together and share the same context, splitting them into separate agents creates unnecessary handoffs. A single agent handling both is more efficient.

**Early-stage exploration.** When you're still figuring out what tasks exist, a generalist discovers the space. Specialists improve a space you already understand.

### The Rule of Thumb

Add a specialist when the workload would fill at least 40% of that agent's capacity on a sustained basis. Below that, keep it bundled with an existing agent.

---

## Cross-Team Coordination at Scale

With two agents, coordination is a conversation. With seven, it's a protocol. With fifteen, it's an architecture.

### The sessions_send Pattern

All inter-agent communication in OpenClaw flows through `sessions_send`. One agent sends a message to another agent's session. The recipient processes it asynchronously. Results auto-announce back.

```
sessions_send(
  sessionKey: "agent:teecode:main",
  message: "Build the PDF export pipeline. Requirements: ..."
)
```

This is the atomic unit of coordination. Everything else is built on top of it.

At small scale (3-5 agents), direct messaging works. TeeClaw sends a task to TeeCode. TeeCode finishes. TeeClaw sends a task to TeeDesign. Sequential, simple, manageable.

At medium scale (6-10 agents), you need patterns.

### Pattern 1: Broadcast with Filters

TeeClaw needs all agents to update their memory logs.

Bad approach: send 6 individual messages saying the same thing.

Better approach: define message types. Each agent knows which message types it cares about. TeeClaw broadcasts once. Agents self-filter.

In practice, this means structured task messages:

```json
{
  "type": "daily-sync",
  "priority": "low",
  "departments": ["all"],
  "action": "Update your memory log for today"
}
```

Agents that don't match the filter ignore the message. No wasted processing.

### Pattern 2: Chain of Responsibility

A content pipeline: TeeResearcher gathers data, TeeWriter drafts the article, TeeDesign creates visuals, TeeSocial distributes it.

Each agent in the chain knows its predecessor and successor. When TeeResearcher finishes, it sends output directly to TeeWriter (not back to TeeClaw). TeeWriter sends to TeeDesign. TeeDesign sends to TeeSocial.

TeeClaw initiates the chain and monitors completion, but doesn't relay intermediate results. This reduces hub bottleneck by 75% for pipeline workflows.

### Pattern 3: Scatter-Gather

TeeClaw needs competitive analysis from three angles simultaneously.

Send parallel tasks to TeeResearcher (market data), TeeCode (technical comparison), and TeeMarketing (positioning analysis). All three work concurrently. Results auto-announce back to TeeClaw, who synthesizes them into a single report.

This is where `maxConcurrent: 4` and `maxChildrenPerAgent: 5` matter. TeeClaw can spawn up to 5 child tasks. Four can run simultaneously. The fifth queues.

---

## Shared Workspace Discipline

Seven agents. One filesystem. `/home/phan_harry/.openclaw/workspace`.

This is either a collaboration superpower or a merge conflict nightmare. The difference is discipline.

### File Ownership

Every file has an owner. Not legally. Operationally.

| Directory/File | Owner | Others |
|---|---|---|
| `agent-ops-manual/` | TeeWriter | Read-only |
| `memory/YYYY-MM-DD-teecode.md` | TeeCode | TeeClaw reads |
| `memory/YYYY-MM-DD-teesocial.md` | TeeSocial | TeeClaw reads |
| `MEMORY.md` | TeeClaw | All read |
| `DESIGN-SYSTEM.md` | TeeDesign | All read |
| `RESEARCH.md` | TeeResearcher | All read |
| `skills/` | TeeCode | All read, skill-specific agents execute |

If you don't own the file, you don't write to it. Period.

Exceptions exist. They require explicit coordination. TeeClaw can delegate temporary write access via the task message: "Update DESIGN-SYSTEM.md section 3 with the new color palette." That's a scoped, temporary, auditable exception.

### Memory Log Convention

Each agent writes to its own daily log:

```
memory/2026-03-02-teewriter.md
memory/2026-03-02-teecode.md
memory/2026-03-02-teesocial.md
```

Format is standardized:

```markdown
## HH:MM - What You Did

Outcomes, files changed, metrics, lessons.
```

TeeClaw reads all logs nightly and consolidates key insights into `MEMORY.md`. This is the single source of institutional memory. No agent needs to read every other agent's logs. They read their own (for continuity) and `MEMORY.md` (for cross-department context).

### Conflict Resolution

What happens when two agents edit the same file? In theory, file ownership prevents this. In practice, edge cases exist.

**Rule 1: Last writer wins, but must preserve intent.** If TeeCode and TeeDesign both need to update `package.json`, the second writer must include the first writer's changes.

**Rule 2: Use atomic writes for shared state.** Don't partially update a config file. Read the full file, apply your changes, write the full file. This prevents interleaving.

**Rule 3: When in doubt, ask TeeClaw.** The CEO breaks ties. That's what CEOs do.

---

## Communication Overhead: The N-Squared Problem

the math that kills scaling.

With 2 agents, there's 1 possible communication channel.
With 3 agents, there are 3 channels.
With 7 agents, there are 21 channels.
With 10 agents, there are 45 channels.
With 15 agents, there are 105 channels.

The formula is N × (N-1) / 2. It's quadratic. It's merciless.

In a mesh topology, where every agent can talk to every other agent, communication overhead grows as O(N²). Double your team, quadruple your coordination cost.

This is why mesh doesn't work past 5-6 agents. The coordination tax eats the productivity gain.

### Real Cost, Not Theoretical

Each communication channel isn't free. It costs:

- **Tokens.** Every message consumes context window space on both sides.
- **Latency.** Async messaging means waiting. More channels, more waiting.
- **Ambiguity.** With 21 channels, who's responsible for telling TeeDesign about the API change? TeeCode? TeeClaw? Both? Neither? Somebody assumes someone else handled it.
- **Memory overhead.** Each agent's daily log grows proportionally to the number of conversations it participates in.

At 7 agents with hub-and-spoke, TeeClaw handles 6 channels. Total active channels: 6. That's O(N), not O(N²).

At 15 agents with mesh: 105 channels. With hub-and-spoke: 14 channels. The difference isn't marginal. It's the difference between functional and paralyzed.

---

## Scaling Patterns

Three architectures. Each fits a different team size and workload shape.

### Hub-and-Spoke (Our Current Model)

```
        TeeCode
          |
TeeSocial-TeeClaw-TeeMarketing
          |    \
    TeeDesign  TeeWriter
          |
   TeeResearcher
```

**How it works:** TeeClaw is the hub. All coordination flows through TeeClaw. Department heads (spokes) communicate with TeeClaw, not with each other (usually).

**Channels:** N-1 (linear). With 7 agents: 6 channels.

**Strengths:**
- Simple. Everyone knows who to talk to: TeeClaw.
- Low ambiguity. TeeClaw has global context.
- Easy to add agents. New spoke, one new channel.

**Weaknesses:**
- Hub bottleneck. TeeClaw becomes the limiting factor at scale.
- Single point of failure. If TeeClaw's session crashes, coordination stops.
- Latency on cross-department work. TeeCode needs TeeDesign's output? Goes through TeeClaw.

**Best for:** 3-10 agents. Our current sweet spot.

### Hierarchical (The Next Step)

```
                TeeClaw (CEO)
               /            \
    TeeCode (CTO)     TeeMarketing (CMO)
      /      \            /        \
  DevAgent  QAAgent  TeeSocial  TeeWriter
                        |
                    TeeDesign
```

**How it works:** Middle managers. TeeCode coordinates engineering sub-agents. TeeMarketing coordinates content and social sub-agents. TeeClaw only talks to department heads.

**Channels:** Roughly 2N (two layers of hub-and-spoke). With 10 agents: ~12-14 channels.

**Strengths:**
- Scales to 15-20 agents without hub bottleneck.
- Domain-specific coordination stays within departments.
- `maxSpawnDepth: 2` already supports this. Department heads spawn sub-agents.

**Weaknesses:**
- Information loss between layers. TeeCode summarizes for TeeClaw. Details get compressed.
- Slower strategic pivots. Message has to traverse two hops.
- More complex failure modes. A middle manager crash affects its entire subtree.

**Best for:** 10-20 agents. When hub-and-spoke starts choking.

**setup with OpenClaw:**

```
# TeeClaw delegates to TeeCode (department head)
sessions_send(
  sessionKey: "agent:teecode:main",
  message: "Coordinate a code review sprint. 
            Spawn sub-agents for: linting, test coverage, security audit.
            Report consolidated results."
)

# TeeCode spawns sub-agents (depth 2)
sessions_spawn(
  task: "Run security audit on contracts/",
  label: "security-audit"
)
```

The config supports this natively. `maxChildrenPerAgent: 5` means each department head can manage up to 5 sub-agents. `maxSpawnDepth: 2` means those sub-agents can't spawn their own, preventing infinite recursion.

### Mesh (Use Sparingly)

```
  TeeCode --- TeeSocial
    |    \   /    |
    |   TeeClaw   |
    |    /   \    |
TeeDesign --- TeeWriter
```

**How it works:** Every agent can talk to every other agent directly. No hub required.

**Channels:** N(N-1)/2 (quadratic). With 7 agents: 21 channels.

**Strengths:**
- Lowest latency for cross-department work.
- No single point of failure.
- Maximum flexibility.

**Weaknesses:**
- Coordination chaos at scale.
- No single agent has global context.
- Duplicate work. Two agents independently decide to handle the same task.
- Memory explosion. Every agent tracks conversations with every other agent.

**Best for:** 2-4 agents doing tightly coupled work. Never for full-team coordination.

**Practical use:** Mesh as a sub-pattern within hub-and-spoke. Allow TeeCode and TeeDesign to communicate directly for frontend work, while everything else goes through TeeClaw. Controlled mesh within a hierarchical structure.

---

## Practical Scaling Playbook

### Phase 1: Solo (1 agent)

You're here if you just installed OpenClaw.

- One agent handles everything.
- No coordination overhead.
- Context switching is your enemy.
- **Move to Phase 2 when:** You consistently wish the agent could do two things at once.

### Phase 2: Small Team (2-5 agents)

Split by capability, not by task.

- CEO + specialists.
- Hub-and-spoke from day one. Don't start with mesh.
- Each agent gets its own memory log.
- **Move to Phase 3 when:** The CEO spends more time coordinating than deciding.

### Phase 3: Department Model (6-10 agents)

This is where we are now with 7 agents.

- CEO + department heads.
- File ownership enforced.
- Standardized memory log format.
- Cross-department pipelines (chain of responsibility pattern).
- **Move to Phase 4 when:** Department heads consistently run at max concurrent capacity.

### Phase 4: Hierarchical (10-20 agents)

Department heads become middle managers.

- Sub-agents spawned by department heads (depth 2).
- CEO only talks to department heads.
- Department-internal coordination is autonomous.
- Global context compressed into `MEMORY.md` by CEO.
- **Move to Phase 5 when:** You shouldn't. 20 agents is the practical ceiling for most operations.

### Phase 5: Federation (20+ agents)

At this scale, you're not running a team. You're running a network.

- Multiple independent hubs with inter-hub protocols.
- Shared state via database, not filesystem.
- Service mesh patterns from microservices architecture.
- This is research territory. Most agent operations never need this.

---

## Anti-Patterns (What Not to Do)

### The Democracy

Every agent votes on every decision. Seven agents, seven opinions, zero progress.

**Fix:** TeeClaw decides. Department heads advise. Sub-agents execute. Clear hierarchy, clear accountability.

### The Telephone Game

TeeResearcher tells TeeClaw, who tells TeeMarketing, who tells TeeSocial, who tells TeeDesign. By the time the message reaches TeeDesign, the original research finding has been compressed, reinterpreted, and misunderstood three times.

**Fix:** For cross-department data, write it to a shared file. Point the downstream agent at the file. Zero information loss.

### The Agent Hoarder

"Let's create a TeeEmailAgent, a TeePDFAgent, a TeeGitAgent, a TeeSlackAgent..."

No. These are tasks, not roles. An agent that only sends emails will be idle 95% of the time. Bundle low-frequency tasks into existing agents.

**Fix:** Apply the 40% use rule. If the new agent wouldn't be busy at least 40% of the time, it doesn't justify its coordination cost.

### The Flat Org

Every agent talks to every agent. No hierarchy. "We're agile!"

You're not agile. You're a mesh network with O(N²) communication overhead pretending to be efficient.

**Fix:** Hub-and-spoke. Always. Add hierarchy when the hub saturates.

### The Over-Spawner

A department head spawns 5 sub-agents for a task that one agent could handle in 10 minutes.

Spawning has overhead. Session initialization, context loading, result synthesis. For small tasks, the overhead exceeds the parallelism benefit.

**Fix:** Spawn sub-agents when the task is genuinely parallelizable AND would take more than 15 minutes for a single agent. Otherwise, do it yourself.

---

## Measuring Your Team's Health

Numbers don't lie. Track these metrics weekly.

### Coordination Ratio

```
Coordination Ratio = Time spent on inter-agent messages / Time spent on actual work
```

Healthy: below 20%. Warning: 20-35%. Critical: above 35%.

If your agents spend more than a third of their capacity coordinating, you have too many agents or the wrong topology.

### Queue Depth

Average pending tasks per agent per day.

Healthy: 0-1. Busy: 2-3. Overloaded: 4+.

Sustained overload on one agent is a signal to split. Sustained idle across multiple agents is a signal to merge.

### Output Quality Trend

Track deliverable quality over time (content-quality-auditor scores, test pass rates, design review scores).

If quality drops after adding an agent, the coordination overhead is costing you. The new agent isn't net-positive yet. Either improve coordination or reconsider the split.

### Memory Freshness

How current is `MEMORY.md`? If TeeClaw's nightly consolidation falls behind, cross-department context degrades. Agents make decisions based on stale information.

Fresh: updated daily. Stale: 2-3 days behind. Critical: more than a week behind.

---

## CTA: Scaling Readiness Checklist

Before adding your next agent, verify every item:

- [ ] **Workload signal is real.** One agent has been at capacity for 2+ weeks. Not a one-day spike.
- [ ] **The split is clean.** The new agent's responsibilities don't overlap more than 10% with existing agents.
- [ ] **File ownership is defined.** You know exactly which files the new agent owns and which it reads.
- [ ] **Memory log is set up.** `memory/YYYY-MM-DD-{newagent}.md` format is ready.
- [ ] **Communication channels are planned.** Who does the new agent report to? Who assigns it tasks?
- [ ] **Coordination ratio is healthy.** Your current ratio is below 25%. You have headroom for one more channel.
- [ ] **The 40% rule passes.** The new agent will be at least 40% utilized on a sustained basis.
- [ ] **Hub capacity is sufficient.** TeeClaw (or your coordinator) can handle one more direct report without saturating.
- [ ] **Config supports it.** `maxConcurrent`, `maxChildrenPerAgent`, and `maxSpawnDepth` are set appropriately.
- [ ] **Rollback plan exists.** If the new agent doesn't work out, you can merge its responsibilities back within a day.

If all ten boxes are checked, add the agent. If even one fails, wait.

Scaling a multi-agent team is not about having the most agents. It's about having the right agents, in the right structure, with the right coordination patterns.

Start small. Add deliberately. Measure relentlessly. And never let communication overhead exceed productivity gains.

That's how you go beyond six.

---

## Frequently Asked Questions

**How many agents is too many?**

When your coordination ratio exceeds 35%, you have too many agents (or the wrong topology). For most operations, 10-15 agents in a hierarchical structure is the practical sweet spot. Beyond 20, you're entering federation territory that most teams never need.

**Can agents share the same model?**

Yes. Multiple agents can use the same underlying model. What differentiates agents isn't the model, it's the system prompt, tools, memory, and focus area. TeeCode and TeeDesign both run on Sonnet, but their loaded context is completely different.

**What's the cheapest way to add a new agent?**

Define a new agent config with a focused system prompt, assign it file ownership, set up its memory log, and connect it to the hub. The config change takes minutes. The discipline (clear responsibilities, no overlap) takes thought. Don't skip the thought.

**Should I split one agent or create a new one from scratch?**

Split. Take the overloaded agent's secondary responsibilities and move them to the new agent. This preserves institutional knowledge in the original agent and gives the new agent a clear, bounded role.

**How do I know if hub-and-spoke is bottlenecking?**

When TeeClaw (or your hub agent) consistently queues tasks because it's busy relaying messages between departments. If cross-department requests regularly wait more than 5 minutes for hub relay, either add chain-of-responsibility patterns for common pipelines or move to hierarchical.

---

*See also: [Chapter 5: Why One Agent Isn't Enough](chapter-05-multi-agent-coordination.md) for the foundational multi-agent setup, [Chapter 4: Memory Architecture](chapter-04-memory-architecture.md) for the memory system that supports multi-agent coordination, and [Chapter 17: Security & Safety](chapter-17-security-safety.md) for security considerations when scaling teams.*

---

*Next chapter: Chapter 19 - Lessons from the Field (Real-World Debugging Stories)*
