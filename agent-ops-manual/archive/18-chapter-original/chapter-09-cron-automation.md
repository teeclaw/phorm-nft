# Chapter 9: Set It and Forget It (Until It Breaks)

## Cron Automation

*How we scheduled 5 marketing jobs that run themselves, and what happened when one didn't.*

---

> **Key Takeaways**
> - Cron jobs turn your agent from reactive chatbot to proactive operator that works while you sleep.
> - Default to isolated sessions (`agentTurn`) with `announce` delivery for all scheduled work.
> - Always fetch fresh credentials from Secret Manager at runtime. Never cache. Never hardcode.
> - Monitor via memory logs: job ID, timestamp, output summary, status. Every run.
> - Start with one job. Get it reliable. Then scale.

---

Five CryptoClarity marketing jobs run every day.

Morning drafts at 01:30 UTC. Midday engagement at 05:30 UTC. Evening reports at 12:00 UTC. A weekly roundup on Sundays. A monthly performance review on the first of each month.

We haven't touched them in two weeks. They just run.

Every morning at 01:30, the agent wakes up, fetches fresh credentials from Google Cloud Secret Manager, pulls the latest crypto news, drafts three tweet threads for @agentmanifesto, and queues them for review. By the time our human checks Telegram at 8 AM Jakarta time, three polished drafts are sitting in the chat. Ready to approve. Ready to post.

At 05:30, the midday job fires. It checks engagement on the morning posts, identifies high-performing tweets, and generates reply threads to keep the conversation going. No one asked it to. It just does.

At 12:00, the evening report lands. Follower growth. Engagement rates. Top-performing content. Trends worth watching tomorrow. A summary that would take a human 45 minutes to compile, delivered automatically while we're eating dinner.

This is what cron automation looks like in practice. Not theoretical. Not aspirational. Five jobs, running daily, producing real output that feeds a real marketing operation.

The shift from "agent that responds when asked" to "agent that works while you sleep" is the single biggest unlock in our entire operation. Everything before this chapter was about making the agent capable. This chapter is about making it autonomous.

---

## Why Cron Changes Everything

Let's be honest about what most AI agents are.

They're fancy chatbots. You type something. They respond. You type something else. They respond again. The entire model is reactive. Nothing happens unless a human initiates it.

That's fine for casual use. It's terrible for operations.

Think about what a marketing team actually does. They don't wait for someone to ask "hey, could you check our engagement metrics?" They check them on a schedule. They draft content ahead of time. They run reports at regular intervals. They operate on rhythms, not requests.

Cron jobs give your agent the same capability. You define the rhythm once. The agent follows it indefinitely. You intervene only when something breaks or the strategy changes.

The mental model shift is important. You stop thinking of your agent as a tool you pick up and put down. You start thinking of it as an employee with a work schedule. It has tasks. It has deadlines. It executes on its own and reports the results.

Our five cron jobs replaced what used to be five daily conversations. "Draft some tweets." "Check our engagement." "Give me today's report." "Summarize the week." "How did this month go?"

Those conversations are gone. The work still happens. We just stopped being the trigger.

---

## Our 5 Cron Jobs

Here's what's actually running. Five jobs, each with a specific purpose, schedule, and output.

### Job 1: Morning Content Drafts

**Job ID:** `c070498c`
**Schedule:** Daily at 01:30 UTC (08:30 Jakarta time)
**Purpose:** Draft the day's social media content for @agentmanifesto

This is the workhorse. Every morning, the agent:

1. Fetches fresh API credentials from Secret Manager
2. Scans crypto news sources for trending topics
3. Identifies 2-3 angles relevant to CryptoClarity's audience
4. Drafts tweet threads with hooks, supporting points, and CTAs
5. Delivers the drafts to Telegram for human review

The 01:30 UTC timing is deliberate. It gives the agent time to process overnight news before our human's morning starts. By the time 0xd opens Telegram, the drafts are already waiting. No "hey, can you write some tweets?" required.

### Job 2: Midday Engagement

**Job ID:** `f9961ec9`
**Schedule:** Daily at 05:30 UTC (12:30 Jakarta time)
**Purpose:** Amplify morning content and engage with the audience

The midday job checks how the morning's posts performed and generates engagement responses. Reply threads on high-performing tweets. Quote tweets of relevant community posts. Engagement that keeps the account active and visible during peak hours.

This job runs in an isolated session so it doesn't interfere with any ongoing main-session work. It does its thing, delivers results to Telegram, and disappears.

### Job 3: Evening Reports

**Job ID:** `714cbf43`
**Schedule:** Daily at 12:00 UTC (19:00 Jakarta time)
**Purpose:** Daily performance summary

The evening report compiles the day's metrics into a concise summary. What got posted. What performed well. What the engagement numbers look like. Trends worth noting for tomorrow's content.

This isn't vanity metrics. It's the feedback loop that makes the whole system improve over time. When you can see that "threads about on-chain identity consistently outperform threads about token launches," you adjust the morning draft strategy. Automation without measurement is just automated guessing.

### Job 4: Weekly Roundup

**Job ID:** `8eebcd45`
**Schedule:** Weekly (Sundays)
**Purpose:** Week-in-review with strategic recommendations

The weekly job zooms out. Seven days of data, condensed into trends and recommendations. Which topics gained traction. Which posting times performed best. Audience growth trajectory. Concrete suggestions for the coming week's content strategy.

This is the job that turns daily data into weekly intelligence. Without it, you'd need to manually review seven daily reports and synthesize the patterns yourself.

### Job 5: Monthly Performance Review

**Job ID:** `8025e8cb`
**Schedule:** Monthly (1st of each month)
**Purpose:** full monthly analysis

The monthly review is the strategic layer. Month-over-month growth. Content category performance. Audience demographic shifts. ROI on different content types. Long-term trend analysis.

This is the report you'd bring to a strategy meeting. It answers the question: "Is what we're doing actually working, and what should we change?"

---

## Anatomy of a Cron Job

Every cron job in OpenClaw has four core components: schedule, payload, delivery, and sessionTarget. Understanding these is the difference between jobs that work reliably and jobs that silently fail.

### Schedule

Three schedule types. Each serves a different use case.

**`cron`** is the classic cron expression. If you've ever written a crontab on Linux, you know this format. Five fields: minute, hour, day-of-month, month, day-of-week.

```
"schedule": {
  "type": "cron",
  "expression": "30 1 * * *"
}
```

That's "at minute 30, hour 1, every day." Our morning draft job.

**`every`** is recurring with a simple interval. Every 6 hours. Every 30 minutes. Every 2 days. Less precise than cron expressions but easier to read and reason about.

```
"schedule": {
  "type": "every",
  "interval": "6h"
}
```

**`at`** is a one-shot. Fires once at the specified time and never again. Useful for scheduled launches, timed announcements, or "remind me to do X on Tuesday."

```
"schedule": {
  "type": "at",
  "time": "2026-03-15T14:00:00Z"
}
```

For recurring operational work, `cron` is almost always the right choice. It gives you the most control over exactly when jobs fire.

**Schedule Type Comparison:**

| Type | Fires | Best For | Example |
|------|-------|----------|---------|
| `cron` | Recurring, precise | Daily/weekly ops on exact schedule | `30 1 * * *` (daily 01:30) |
| `every` | Recurring, interval | Repeated checks, polling | `6h` (every 6 hours) |
| `at` | Once | Launches, reminders, one-off tasks | `2026-03-15T14:00:00Z` |

### Payload

The payload defines what the agent actually does when the job triggers. Two types.

**`systemEvent`** sends a message to an existing session. Think of it as tapping the agent on the shoulder and saying "hey, do this thing." The message lands in the main session's conversation, and the agent processes it like any other message.

```
"payload": {
  "type": "systemEvent",
  "message": "Run the daily CryptoClarity engagement check. Fetch fresh credentials first."
}
```

**`agentTurn`** spins up an isolated session. The job runs in its own context, with its own conversation history, completely separate from whatever else the agent is doing. When it finishes, it can announce results back to the main session.

```
"payload": {
  "type": "agentTurn",
  "message": "Generate the daily CryptoClarity performance report.",
  "systemPrompt": "You are a marketing analyst. Focus on engagement metrics and content performance."
}
```

The distinction matters. `systemEvent` jobs share context with the main session. If the agent is in the middle of a coding task and a `systemEvent` cron fires, the marketing message lands right in the middle of the code conversation. Messy.

`agentTurn` jobs are clean. Isolated context. No interference. They do their work and report back. For anything that runs on a schedule, `agentTurn` is usually the safer choice.

All five of our CryptoClarity jobs use `agentTurn`. We learned this the hard way. (More on that in the failure section.)

**Payload Type Comparison:**

| Type | Session | Context | Risk | Best For |
|------|---------|---------|------|----------|
| `systemEvent` | Main | Full conversation history | Interrupts ongoing work | Jobs needing prior context |
| `agentTurn` | Isolated | Clean slate, custom prompt | None to main session | Self-contained scheduled work |

### Delivery

Delivery controls what happens with the job's output. Three modes.

**`announce`** pushes the results to a channel. For us, that's Telegram. When the evening report finishes, the summary appears in our Telegram group automatically. No one has to ask for it. No one has to check a dashboard. It just shows up.

This is the default for isolated `agentTurn` jobs, and it's the right default. If a job runs in the background and nobody sees the output, did it really run?

**`webhook`** sends the results as an HTTP POST to a URL. Useful for integrating with external systems. Maybe you want cron results to land in a Slack channel, trigger a Zapier workflow, or feed into a dashboard API.

```
"delivery": {
  "type": "webhook",
  "url": "https://your-api.com/cron-results",
  "headers": {
    "Authorization": "Bearer ${WEBHOOK_TOKEN}"
  }
}
```

**`none`** is silent mode. The job runs, the output goes nowhere except the session logs. Useful for maintenance tasks that don't produce human-readable output. Database cleanups. Cache warming. Health checks that only matter if they fail.

For marketing operations, `announce` is the obvious choice. The whole point is producing content and reports that a human reviews. Silent marketing is an oxymoron.

### sessionTarget

Two options: `"main"` or `"isolated"`.

**`main`** runs the job in the agent's primary session. The one connected to Telegram, with full conversation history, with all the context of ongoing work. Use this for jobs that need to reference previous conversations or build on existing context.

**`isolated`** spins up a fresh session. Clean slate. No baggage. The job gets a system prompt, a task, and nothing else. Use this for jobs that should be self-contained.

Our rule of thumb: if a job doesn't need to know what happened yesterday in the main chat, run it isolated. All five CryptoClarity jobs are isolated. They each carry their own instructions, fetch their own data, and deliver their own results.

---

## Credential Fetching in Cron

This is the section that will save you from a 3 AM debugging session.

Never hardcode credentials. Not in environment files. Not in job configurations. Not in system prompts. Not anywhere.

Every cron job that touches an external API must fetch fresh credentials from Secret Manager at runtime. Every single time. No exceptions.

the pattern:

```bash
cd workspace && bash scripts/fetch-secrets.sh && source ~/.openclaw/.env && <command>
```

Three steps. Always in this order.

1. **Navigate to workspace.** The fetch script expects to run from the workspace root. Cron jobs don't guarantee a working directory. Always `cd` first.

2. **Fetch secrets.** `scripts/fetch-secrets.sh` pulls all 56 credentials from Google Cloud Secret Manager and writes them to `~/.openclaw/.env`. Every run gets the latest values.

3. **Source the env file.** Load those fresh credentials into the current shell session. Then run whatever command needs them.

Why fresh every time? Because credentials rotate. API keys expire. Tokens get revoked. If your cron job cached credentials from two weeks ago, and the Twitter API key was rotated last Tuesday, your job silently fails with a 401 error and you don't find out until someone notices the tweets stopped.

Fresh fetch, every run, no exceptions.

The overhead is negligible. The Secret Manager call takes about 200 milliseconds. Your cron job probably takes 30-60 seconds to run. That 200ms insurance policy is the cheapest reliability investment you'll ever make.

what the pattern looks like inside an `agentTurn` payload:

```json
{
  "payload": {
    "type": "agentTurn",
    "message": "Fetch credentials: cd workspace && bash scripts/fetch-secrets.sh && source ~/.openclaw/.env. Then generate today's CryptoClarity morning content drafts for @agentmanifesto."
  }
}
```

The credential fetch is part of the task instruction itself. The agent treats it as step one of the job. This way, even if the agent's environment was somehow wiped or restarted, the first thing it does is restore its access to everything it needs.

We've been running this pattern across all five jobs for weeks. Zero credential-related failures. Zero stale token errors. The simplicity is the point.

---

## When It Breaks: A Real Failure Story

Week one of our cron setup. Everything worked perfectly for six days. Then on day seven, the morning draft job ran at 01:30 as scheduled. The agent fetched credentials. Connected to the Twitter API. Started drafting content.

And then it tried to post a draft to Telegram for review.

Silence. Nothing arrived.

The job completed successfully from the agent's perspective. No errors in the execution log. The drafts were generated. The delivery step... just didn't deliver.

What happened? The job was configured with `sessionTarget: "main"` instead of `"isolated"`. At 01:30 UTC, the main session was idle. The agent sent the drafts into the main session context, but because no active Telegram conversation was waiting for a response, the delivery had nowhere to go. The results sat in the session like a message in an empty room.

The fix was straightforward. Switch all five jobs to `sessionTarget: "isolated"` with `announce` delivery. Isolated sessions auto-announce their results to the configured channel (Telegram, in our case) when they complete. They don't depend on an active conversation. They don't care if someone is listening. They just deliver.

the timeline of the incident:

**01:30 UTC** - Job fires. Agent generates drafts. No output in Telegram.
**08:15 UTC** - 0xd checks Telegram. No drafts. "Where are the morning tweets?"
**08:20 UTC** - Manual check of job logs. Execution was clean. Output was generated. Delivery failed silently.
**08:25 UTC** - Identified the sessionTarget misconfiguration.
**08:30 UTC** - Reconfigured all jobs to isolated sessions with announce delivery.
**08:35 UTC** - Manually triggered the morning job. Drafts appeared in Telegram within 90 seconds.

Total downtime: one missed delivery cycle. Total effort to fix: ten minutes.

The lesson: always match your sessionTarget to your delivery expectations. If you want results to show up in a channel automatically, use isolated sessions with announce delivery. If you use the main session, you need an active conversation to catch the output.

We documented this in our memory logs the same day. Haven't had a delivery failure since.

### Failure Patterns to Watch For

Beyond our own stumble, here are the failure modes we've designed against:

**Credential expiration.** Already covered. Fetch fresh every time. Problem solved.

**API rate limits.** If your morning job makes 50 API calls and your midday job makes 50 more, you might hit a daily rate limit before the evening job runs. Space your jobs with rate limits in mind. Check platform-specific limits and build in buffers.

**Overlapping jobs.** If a job runs longer than expected and the next job fires before it finishes, you can get race conditions. Our jobs are spaced at least 4 hours apart. If your jobs are closer together, consider adding a check at the start: "Is another job currently running? If yes, wait or skip."

**Silent failures.** The most dangerous kind. The job runs, something goes wrong in the middle, but the job doesn't crash. It just produces partial or garbage output. Defense: always include a validation step at the end of your job. "Check that the output meets minimum quality criteria before delivering."

**Timezone confusion.** All cron schedules should be in UTC. Always. Convert to local time in your head, not in your cron expressions. Our jobs run at 01:30, 05:30, and 12:00 UTC because those translate to 08:30, 12:30, and 19:00 Jakarta time. The cron doesn't know about Jakarta. It shouldn't.

---

## Monitoring via Memory Logs

Automation without monitoring is a time bomb. You need to know that your jobs ran, what they produced, and whether anything went wrong.

Our monitoring approach is simple and file-based. Every job writes to the daily memory log. Every result gets timestamped. Every failure gets flagged.

what a typical day's cron entries look like in `memory/2026-03-01-teemarketing.md`:

```markdown
## 01:32 - Morning Drafts (c070498c)
- Generated 3 tweet threads for @agentmanifesto
- Topics: Base ecosystem growth, ERC-8004 adoption stats, agent interop trends
- Delivered to Telegram at 01:33 UTC
- Status: ✅ Complete

## 05:31 - Midday Engagement (f9961ec9)
- Checked morning post performance
- Top tweet: Base ecosystem thread (847 impressions, 23 engagements)
- Generated 2 reply threads
- Delivered to Telegram at 05:33 UTC
- Status: ✅ Complete

## 12:01 - Evening Report (714cbf43)
- Daily summary generated
- Followers: +12 (total: 1,247)
- Total impressions: 3,891
- Engagement rate: 4.2%
- Delivered to Telegram at 12:02 UTC
- Status: ✅ Complete
```

Three things to notice.

First, every entry includes the job ID. When something breaks, you need to know which job broke. "The morning job failed" is vague. "Job c070498c failed" is searchable, traceable, and linked to a specific configuration.

Second, timestamps are precise. Not "morning." Not "around noon." The exact UTC time. When you're debugging a failure at 2 AM, "around noon" is useless. "12:01 UTC" tells you exactly where to look in your logs.

Third, every entry ends with a status. Green check or red X. When you scan the day's memory file, you can instantly see if everything ran clean or if something needs attention.

### The Weekly Pattern Check

Memory logs aren't just for daily monitoring. They're for trend analysis.

Every Sunday, the weekly roundup job (8eebcd45) doesn't just compile metrics. It also checks the health of the other four jobs. Did they all run this week? Did any produce errors? Did delivery times shift (which might indicate performance degradation)?

This is meta-monitoring. Automation that monitors your other automation. It sounds recursive, but it's actually just good operations. The weekly job is your safety net for catching slow degradation that daily checks might miss.

### When to Intervene

Not every anomaly requires action. Here's our intervention framework:

**Immediate action:** Job completely fails to execute. Delivery produces zero output. Credentials fail to fetch.

**Same-day review:** Output quality drops noticeably. Engagement metrics deviate more than 30% from the weekly average. A job takes 3x longer than usual to complete.

**Weekly review:** Gradual decline in output quality. Shifting audience engagement patterns. Minor timing drift in job execution.

**No action needed:** Small variations in daily metrics. Individual posts underperforming (it happens). Minor differences in job completion time.

The goal is calm monitoring, not anxious micromanagement. If you're checking your cron jobs every hour, you've missed the point. The whole reason we automated was to stop hovering.

---

## Building Your Own Cron Schedule

Ready to set up your own automation? the practical framework.

### Step 1: Identify Your Rhythms

What do you do every day at roughly the same time? Those are your cron candidates.

For us, it was social media drafting, engagement, and reporting. For you, it might be:

- Daily standup summaries from GitHub commits
- Morning news digests for a specific industry
- Evening email drafts for the next day's outreach
- Weekly analytics reports from multiple data sources
- Monthly invoice generation or client reports

If you're doing it more than twice a week on a schedule, automate it.

### Step 2: Choose Your Isolation Strategy

For each job, ask: does this need context from the main session?

If yes: `sessionTarget: "main"`, `payload: "systemEvent"`
If no (and it's usually no): `sessionTarget: "isolated"`, `payload: "agentTurn"`

Default to isolated. You can always switch to main later. Going the other direction (discovering your main-session job is interfering with conversations) is more painful.

### Step 3: Set Credential Hygiene

Every job that touches an external API gets the credential fetch pattern:

```bash
cd workspace && bash scripts/fetch-secrets.sh && source ~/.openclaw/.env
```

No exceptions. Even if you're "pretty sure" the credentials haven't changed. Future you will thank present you.

### Step 4: Configure Delivery

Match delivery to audience:

- Human needs to see it? `announce` (Telegram, Discord, Slack)
- External system needs the data? `webhook`
- Background maintenance? `none`

When in doubt, `announce`. Visibility beats silence for any job that produces practical output.

### Step 5: Space Your Jobs

Don't stack five jobs at the same time. Even if your infrastructure can handle it, the output flood is overwhelming for the human reviewer.

Our spacing: 01:30, 05:30, 12:00 for daily jobs. That's roughly 4-6 hours between deliveries. Each result gets attention when it arrives instead of competing with three other reports for mindshare.

### Step 6: Write the Monitoring Entry

Before you consider a cron job "done," make sure it writes to your memory log. Job ID, timestamp, output summary, status. Every run. Non-negotiable.

---

## Frequently Asked Questions

**How do I test a cron job before going live?**

Trigger it manually first. Run the exact payload as a one-off task and verify the output arrives where you expect. Don't schedule anything until you've seen it work at least once end-to-end. Our credential fetch pattern, job execution, and delivery all got tested manually before we ever set a schedule.

**Can I pause a job temporarily without deleting it?**

Yes. Disable the job in your cron configuration. The schedule stays intact, but the job won't fire until you re-enable it. Useful during maintenance windows or when you're iterating on the payload.

**What if a job runs longer than the interval between executions?**

You get overlapping runs. For most marketing jobs this is just wasteful, not dangerous. But for jobs that write to shared resources, overlaps can cause data corruption. Defense: space your jobs with generous buffers, and consider adding a "skip if previous run still active" check.

**How does cron interact with the memory system?**

Each isolated job can write to the memory log just like any main-session task. The monitoring entries shown in this chapter are written by the jobs themselves as part of their execution. For deeper context on how memory works across sessions, see Chapter 4 (Memory Architecture).

**Do cron jobs have access to the same tools as the main session?**

Yes. An `agentTurn` job starts a full agent session with access to all configured tools and skills. The only difference is it runs in an isolated context. It can fetch URLs, call APIs, read files, and use any skill the agent normally has. The credential fetch pattern (covered in this chapter and related to the security principles in Chapter 3) ensures it has the same API access too.

---

## The Automation Mindset

the thing about cron automation that took us a while to internalize.

The goal isn't zero human involvement. The goal is human involvement only where it matters.

Our morning drafts still need human approval before posting. That's deliberate. The agent generates the content, but a human decides whether it goes live. The automation handles the 80% (research, drafting, formatting, delivery). The human handles the 20% (judgment, taste, final approval).

This isn't a limitation. It's the design. Full autonomy sounds appealing until your agent auto-posts something tone-deaf during a market crash. The "set it and forget it" in the chapter title has a caveat: "until it breaks" includes "until the context changes in ways the automation can't anticipate."

Cron jobs are your agent's work schedule. You're still the manager. You just stopped doing the actual work.

That's the unlock.

---

## CTA Checklist

Before you close this chapter, verify you've internalized the key principles:

- [ ] **Identify 3 recurring tasks** that you currently trigger manually. These are your first cron candidates.
- [ ] **Default to isolated sessions** with `agentTurn` payload for all scheduled jobs.
- [ ] **Always fetch fresh credentials** at the start of every job. The `cd workspace && bash scripts/fetch-secrets.sh && source ~/.openclaw/.env` pattern is non-negotiable.
- [ ] **Set delivery to `announce`** for any job that produces output a human should see.
- [ ] **Space your jobs** at least 2 hours apart to avoid output flooding and rate limit collisions.
- [ ] **Write monitoring entries** to your memory log. Job ID, timestamp, summary, status. Every run.
- [ ] **Review weekly** for trends, not daily for anomalies. Calm monitoring beats anxious hovering.
- [ ] **Document failures immediately.** When something breaks, write down what happened, why, and how you fixed it. Your memory log is your operational playbook.
- [ ] **Start with one job.** Get it running reliably for a week before adding the next one. Automation debt is real.
- [ ] **Remember the 80/20 split.** Automate the repetitive work. Keep humans in the loop for judgment calls.

---

*Next chapter: we turn agent memory into institutional knowledge. How structured logs, tacit learning, and cross-session context make your agent smarter every day it runs.*
