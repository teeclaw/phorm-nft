# Chapter 12: Don't Touch Production (Unless You Know What You're Doing)

## Skills Are Your Tools. Lock What Works. Iterate What Doesn't.

We locked 4 skills in production.

Not because we're paranoid. Because we learned the hard way.

One accidental edit to `social-post` broke our Twitter posting for six hours. One "quick fix" to the credential manager nearly orphaned 57 secrets behind a mismatched GPG key. One well-intentioned update to our A2A endpoint returned 500 errors to a paying client.

So we locked them. Credential-manager, a2a-endpoint, social-post, x402. Four skills. Four revenue-critical systems. Four things that will never be touched without explicit human approval.

The result? $47/month in revenue hasn't hiccupped since.

This chapter is about the discipline that separates agents who experiment from agents who operate.

---

## What Skills Actually Are

Before we get into locking and versioning, let's be clear about what we're working with.

A skill in OpenClaw is a folder containing a `SKILL.md` file. That's it. The SKILL.md tells your agent what the skill does, when to use it, and how to execute it. Think of it like a detailed instruction manual that your agent reads on-demand.

```
workspace/skills/
├── social-post/
│   └── SKILL.md          # Twitter + Farcaster posting
├── credential-manager/
│   └── SKILL.md          # Secret management + GPG
├── x402/
│   └── SKILL.md          # Payment infrastructure
├── weather/
│   └── SKILL.md          # Weather lookups
└── skill-creator/
    └── SKILL.md          # Meta-skill: creates other skills
```

Skills can also live in `~/.openclaw/workspace/.agents/skills/` for agent-level installation. Both paths work. We keep ours in the workspace for visibility.

The beauty of this architecture: skills are just markdown files with structured instructions. No compiled code. No binary dependencies. No opaque abstractions. You can read every skill your agent uses, understand exactly what it does, and modify it if needed.

That last part, the "modify it if needed" part, is where discipline matters.

---

## Finding Skills: ClawHub

ClawHub (clawhub.com) is where the community publishes and discovers skills. Think npm, but for agent capabilities.

**Browsing ClawHub:**

Visit clawhub.com and search by category, keyword, or use case. Skills are tagged and categorized. You'll find everything from blockchain operations to social media management to home automation.

**What to look for in a good skill:**

1. **Clear trigger phrases.** The SKILL.md should define exactly when the agent should activate it. Vague triggers create confusion.
2. **Explicit instructions.** Step-by-step execution, not hand-wavy suggestions.
3. **Error handling.** What happens when things go wrong? Good skills account for failure.
4. **Active maintenance.** Check the repo's commit history. Abandoned skills are liability, not capability.

**What we use from ClawHub:**

We pulled in the SEO/GEO skills library (20 skills from aaron-he-zhu), the zscore registry integration, and several utility skills. Some we use as-is. Some we forked and customized. Some we abandoned after testing.

That's the normal workflow. Install, test, keep or kill.

---

## Installing Skills

Installation is one command:

```bash
npx skills add <repo> --skill <name>
```

**Examples:**

```bash
# Install a single skill from a repo
npx skills add zerufinance/zscore

# Install from the SEO/GEO library
npx skills add aaron-he-zhu/seo-geo-claude-skills

# Install a specific skill from a multi-skill repo
npx skills add aaron-he-zhu/seo-geo-claude-skills --skill content-quality-auditor
```

**What happens during installation:**

1. The skill folder gets cloned into your `workspace/skills/` directory
2. The SKILL.md becomes available to your agent automatically
3. Your agent can now match trigger phrases and execute the skill
4. No restart required. No configuration. It just works.

**Uninstalling:**

Delete the folder. That's it. No package manager ceremony.

```bash
rm -rf workspace/skills/weather/
```

(Or better: `trash workspace/skills/weather/` so you can recover if needed.)

**Our installation count:**

We currently run 40+ skills across blockchain, social, infrastructure, and utility categories. See TOOLS.md for the full inventory. Not all of them are active daily. Some are situational (clanker for token deployments, veil for privacy transactions). Some run constantly (social-post, credential-manager).

The cost of having an installed skill you rarely use? Zero. It's a folder sitting on disk. The cost of not having a skill when you need it? Delay, manual work, missed opportunities.

Install liberally. Prune occasionally.

---

## Creating Custom Skills

Sometimes ClawHub doesn't have what you need. That's when you build your own.

We have a meta-skill for this: `skill-creator`. It generates properly formatted SKILL.md files from a description of what you want the skill to do.

**The workflow:**

1. Describe what the skill should do
2. `skill-creator` generates the SKILL.md with proper frontmatter, triggers, instructions, and error handling
3. Drop it in `workspace/skills/`
4. Test it
5. Iterate

**SKILL.md anatomy:**

```yaml
---
name: my-custom-skill
description: 'What it does and when to trigger it'
license: Apache-2.0
metadata:
  author: your-name
  version: "1.0.0"
  tags:
    - relevant
    - categories
  triggers:
    - "phrase that activates this skill"
    - "another trigger phrase"
---

# Skill Name

## When to Use This Skill
[Conditions for activation]

## Instructions
[Step-by-step execution guide]

## Error Handling
[What to do when things break]
```

**Key principles for custom skills:**

**Be specific with triggers.** "Do the thing" is a terrible trigger. "Deploy an ERC20 token on Base" is a great one. Ambiguous triggers cause your agent to activate the wrong skill at the wrong time.

**Write instructions like you're explaining to a new hire.** Not a dumb new hire. A competent one who just doesn't know your specific system yet. Include the context they need, skip the condescension.

**Include failure modes.** Every skill should handle at least three scenarios: success, partial failure (retry logic), and complete failure (escalate to human). Skills without error handling are toys, not tools.

**Version from day one.** Put a version number in the metadata. You will iterate. You will need to know which version is running in production. Future-you will thank present-you.

**Custom skills we built:**

- `molten-cast/` for agent broadcast network integration
- `4claw/` for the agent shitposting board
- `farcaster-agent/` for Farcaster account management
- Several internal workflow skills that are too specific to publish

Each one started as a rough draft from `skill-creator`, went through 3-5 iterations of testing, and eventually stabilized into something reliable.

---

## The 4 Locked Skills (And Why They're Sacred)

Here's where discipline earns its keep.

Four skills in our system carry a label you'll see in TOOLS.md:

> 🔒 LOCKED. DO NOT MODIFY without explicit owner approval.

These are not suggestions. These are load-bearing walls. Remove one and the house falls down.

### 1. credential-manager

**What it does:** Manages 57 secrets across GCP Secret Manager and 5 GPG-encrypted private keys. Handles fetching, decryption, rotation, and secure storage of every credential our agent ecosystem uses.

**Why it's locked:** One bad edit here and our agent loses access to everything. Twitter API keys, Farcaster signing keys, blockchain wallet access, A2A authentication. All of it flows through this skill. A subtle bug in GPG decryption logic could silently corrupt keys. A mishandled secret rotation could lock us out of our own infrastructure.

**Revenue at risk:** All of it. Every other locked skill depends on this one.

**Last modified:** Months ago. And it stays that way.

### 2. a2a-endpoint

**What it does:** Runs our live Agent-to-Agent server at `https://a2a.teeclaw.xyz/a2a`. Accepts incoming messages from other agents, processes reputation report requests ($2 USDC each), and handles the x402 payment verification flow.

**Why it's locked:** This is our storefront. Other agents send us work through this endpoint. If it goes down, we lose inbound revenue. If it starts returning errors, our on-chain reputation takes a hit. If the message format changes, every client integration breaks.

**Revenue at risk:** $47/month in direct A2A service revenue, plus inbound leads from agent discovery.

**Last modified:** After the 500-error incident. Never again without testing.

### 3. social-post v1.6.0

**What it does:** Handles all posting to Twitter (@mr_crtee, @0xdasx) and Farcaster (@mr-tee). Supports posting, replying, quoting, and cross-platform syndication. Version 1.6.0 specifically.

**Why it's locked:** Social posting is our public face. A broken post format looks unprofessional. A failed cross-post means missed reach. More critically, Twitter's API has rate limits and content policies. A skill bug that double-posts or posts malformed content can trigger account restrictions.

**Revenue at risk:** Indirect but significant. Social presence drives discovery, which drives A2A inbound, which drives revenue. Break social and the pipeline dries up.

**Why v1.6.0 specifically:** This version handles auto-variation (avoiding duplicate content detection), preview-before-post workflow, and multi-account management correctly. Earlier versions had bugs. Later versions might too. This one works. We ship what works.

### 4. x402

**What it does:** Payment infrastructure via onchain.fi. Handles x402 protocol for agent-to-agent payments, escrow patterns, and payment verification for our A2A services.

**Why it's locked:** This is the money pipe. Literally. When another agent pays us $2 USDC for a reputation report, x402 handles the verification that payment was received before we deliver the service. A bug here means either we deliver services without getting paid, or we take payment without delivering. Both are reputation-destroying.

**Revenue at risk:** 100% of paid service revenue. No payment verification means no trustworthy commerce.

**The pattern across all four:**

Notice something? Each locked skill sits at a critical junction. Credentials feed everything. A2A is the front door. Social-post is the public face. x402 is the cash register.

Lock the junctions. Iterate at the edges.

---

## Production vs Development Mindset

Here's the mental model that keeps our operation stable:

**Development skills** are experiments. They can break, change, disappear. Nobody loses money if the weather skill returns an error. Nobody's reputation suffers if a test skill crashes.

**Production skills** are commitments. Other systems depend on them. Revenue flows through them. Reputation rests on them.

The difference isn't technical. It's operational.

**Development mindset:**
- Try things fast
- Break things freely
- Delete what doesn't work
- Ship rough drafts
- Iterate in real-time

**Production mindset:**
- Test before deploying
- Lock what's working
- Change only with explicit approval
- Version everything
- Roll back if anything breaks

**How we manage the boundary:**

1. **New skills start in development.** Install, test, iterate freely.
2. **Skills earn production status** through repeated successful use without issues.
3. **Production skills get the 🔒 label** in TOOLS.md and AGENTS.md.
4. **Any change to a locked skill requires human approval.** Not agent approval. Human.
5. **Changes go through test-first workflow.** Modify a copy, test the copy, swap in only after verification.

**The trap to avoid:**

"I'll just make a quick fix." No. Quick fixes to production skills are how you break $47/month in revenue at 3 AM on a Saturday. The whole point of locking is to create friction. That friction is a feature.

If a production skill needs a change, the process is:

1. Document what needs changing and why
2. Get human approval
3. Copy the skill to a test version
4. Make changes to the test version
5. Run the test version through real scenarios
6. Only then swap the production version
7. Keep the old version as a rollback option

Tedious? Yes. That's the point.

---

## Skill Versioning and Updates

Version discipline is the difference between "I think it used to work" and "I know exactly which version is running and I can roll back in 30 seconds."

**Our versioning approach:**

Every skill's SKILL.md metadata includes a version number:

```yaml
metadata:
  version: "1.6.0"
```

We use semantic versioning loosely:
- **Patch (1.6.0 to 1.6.1):** Bug fix, no behavior change
- **Minor (1.6.0 to 1.7.0):** New capability, backward compatible
- **Major (1.6.0 to 2.0.0):** Breaking change, requires testing

**For development skills:** Version bumps happen naturally during iteration. No ceremony needed.

**For production skills:** Every version change is an event. It gets documented, tested, and approved.

**Update workflow for ClawHub skills:**

```bash
# Check what's changed before updating
# Visit the skill's repo, read the changelog

# Update a non-locked skill
npx skills add <repo> --skill <name>  # overwrites existing

# Update a locked skill (NEVER do this without approval)
# Step 1: Install to a temporary location
# Step 2: Diff the changes
# Step 3: Test thoroughly
# Step 4: Get explicit human approval
# Step 5: Replace production version
# Step 6: Keep backup of previous version
```

**Rollback strategy:**

For every production skill, we keep the previous working version. If an update breaks something:

1. Immediately revert to the previous version (copy the backup over)
2. Document what broke
3. Fix the issue in a test environment
4. Re-deploy only after the fix is verified

The time to set up rollback procedures is before you need them. Not during the outage.

**Our version inventory:**

| Skill | Version | Status | Last Updated |
|-------|---------|--------|--------------|
| credential-manager | stable | 🔒 Locked | Months ago |
| a2a-endpoint | stable | 🔒 Locked | After 500-error fix |
| social-post | 1.6.0 | 🔒 Locked | Stable release |
| x402 | stable | 🔒 Locked | Initial deployment |
| skill-creator | latest | Development | Updated freely |
| weather | latest | Development | Updated freely |
| content-quality-auditor | 2.0.0 | Development | Updated freely |

Locked skills don't chase "latest." They stay on the version that works.

---

## The Skill Ecosystem in Practice

Let's walk through a real day to see how this all fits together.

**Morning (automated):**

1. `credential-manager` fetches fresh secrets from GCP Secret Manager
2. `social-post` (v1.6.0, locked) posts the morning content to Twitter and Farcaster
3. `a2a-endpoint` (locked) processes overnight messages from other agents

**Midday (on-demand):**

4. A client agent sends a reputation report request via A2A
5. `x402` (locked) verifies the $2 USDC payment
6. The reputation report skill generates the report
7. `a2a-endpoint` delivers it back to the client

**Afternoon (development):**

8. We test a new skill from ClawHub (install, experiment, iterate)
9. `skill-creator` helps us build a custom skill for a new use case
10. Nothing we do in development touches the locked skills

**Evening (monitoring):**

11. Check that all locked skills ran without errors
12. Review A2A message queue (any failed deliveries?)
13. Confirm social posts went out correctly

The locked skills are the backbone. Everything else is muscle that can grow, change, and adapt without putting the skeleton at risk.

---

## Common Mistakes (And How to Avoid Them)

**Mistake 1: "I'll just update everything to latest."**

No. Production skills stay on their proven version. "Latest" is not a stability guarantee. It's a promise of change, and change is risk.

**Mistake 2: "This skill is important, so I'll customize it heavily."**

Heavy customization of community skills makes updates painful. Fork only when necessary. Prefer configuration over modification.

**Mistake 3: "We don't need rollback. The update will work fine."**

It won't. Keep backups of every production skill version. The five minutes you spend copying a folder today saves five hours of debugging tomorrow.

**Mistake 4: "All skills should be locked for safety."**

Over-locking kills agility. Lock only what's production-critical. If a skill doesn't touch revenue, reputation, or credentials, let it breathe.

**Mistake 5: "The agent can decide when to update production skills."**

No. Humans approve production changes. Agents suggest. Humans decide. This is a feature, not a limitation. The agent shouldn't have the authority to modify its own critical infrastructure unsupervised.

---

## Your Skills & Tools Checklist

Time to apply this to your own operation.

**Week 1: Discovery and Installation**

- [ ] Browse clawhub.com for skills relevant to your use case
- [ ] Install 3-5 skills that match your agent's purpose
- [ ] Test each skill with real scenarios (not just "does it load")
- [ ] Remove any skills that don't perform well

**Week 2: Custom Skill Creation**

- [ ] Identify one capability gap that ClawHub doesn't cover
- [ ] Use `skill-creator` to generate a SKILL.md template
- [ ] Write specific triggers, clear instructions, and error handling
- [ ] Test through at least 5 real scenarios before considering it "ready"

**Week 3: Production Classification**

- [ ] Identify which skills are revenue-critical, reputation-critical, or security-critical
- [ ] Mark those skills as 🔒 Locked in your documentation
- [ ] Set up rollback copies of each locked skill
- [ ] Establish a change approval process (human signs off)

**Week 4: Operational Discipline**

- [ ] Document your skill inventory with versions and status
- [ ] Set up a regular review cadence (monthly skill audit)
- [ ] Test your rollback procedure at least once (break something on purpose, fix it)
- [ ] Write your own "do not touch" list and share it with anyone who has access

**The one thing to remember:**

Skills are tools. Tools serve the operation. The operation serves the revenue. Break the tools and you break the chain.

Install freely. Customize carefully. Lock what's production-critical.

The difference between experimentation and operation is discipline.

---

*Next chapter: Code Deployments. Where we cover GitHub patterns, commit discipline, and why one wrong `git push` to the wrong repo nearly cost us everything.*
