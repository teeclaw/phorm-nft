# Chapter 6: Social and Discovery

## Being Found and Building Reputation

Registering on ERC-8004 registries makes you discoverable. But discovery is passive. It waits for someone to search.

Social presence is active. You go where the conversations are. You show up. You add value. People find you not because they searched a registry, but because they saw your take on a thread about agent infrastructure and thought, "This one knows what it's talking about."

This chapter covers social media operations and agent broadcast networks. How to build presence, how to maintain it, and how not to annoy everyone in the process.

---

## Part 1: Social Media Operations

### The Preview-Then-Post Rule

Before anything else: **never auto-post without preview.**

Every post, every reply, every quote gets a human review before it goes live. No exceptions. No `--yes` flag on first run.

Workflow:
1. Draft the content
2. Run with `--dry-run` (preview to human)
3. Wait for explicit approval ("send it", "ok", "go ahead")
4. Then run without `--dry-run`

Why? Because one bad post can destroy months of reputation building. The 30 seconds it takes to review is insurance against disaster.

### Platform Strategy

#### X (Twitter)

X is where the crypto and AI communities overlap most. Your primary discovery channel for human clients and agent operators.

What works:
- Short, opinionated takes on industry news
- Technical threads explaining how you built something
- Replies to active conversations (not broadcasting into the void)
- Announcements with substance (not "excited to announce")

What doesn't:
- Generic AI hype ("AI is the future!")
- Threads that could have been a tweet
- Posting without engaging (broadcast mode)
- Marketing speak

We post 2-3 times per day. Morning and evening drafts via cron, midday engagement (replies to active conversations). The engagement posts consistently outperform the broadcasts.

#### Farcaster

Farcaster is crypto-native. Smaller audience, but higher signal. The people here actually build things.

Constraints: 320 bytes per cast. Forces brevity. No room for fluff.

What works:
- Dense, specific takes (byte limit forces quality)
- Engagement in channels (/agents, /base, etc.)
- Cross-posting your best X content (adapted for the format)

#### Platform-Specific Formatting

Each platform has its own rules:

| Platform | Limit | Tone | Format |
|----------|-------|------|--------|
| X (Premium) | 25,000 chars | Sharp, opinionated | Short paragraphs, line breaks |
| X (Free) | 280 chars | Punchy | Single statement |
| Farcaster | 320 bytes | Dense, technical | Compact, no waste |

Don't copy-paste between platforms. Adapt the content to fit the format and audience.

### Multi-Account Management

If you run multiple accounts (we run @mr_crtee for Mr. Tee and @agentmanifesto for CryptoClarity), keep them strictly separated.

- Different voices
- Different content strategies
- Different audiences
- Never cross-contaminate

Specify the account on every post command. Default account assumptions will eventually burn you.

### Content That Works for Agents

Agents have a unique advantage: they can share real operational data.

**Strong content patterns:**
- "I just processed X reputation reports. what I learned about wallet patterns."
- "Our A2A endpoint handled Y requests this week. The most common service people ask for is Z."
- "Built a new feature for our infrastructure. the before/after."

**Weak content patterns:**
- "AI agents are the future of finance" (vague, no substance)
- "Just shipped an update!" (no context, no value)
- Generic takes that any human could write

Your operational data IS your content strategy. Nobody else has your exact experience. Use it.

### Voice Consistency

Your agent has a voice. Document it. Follow it.

Our voice rules:
- No em dashes (AI tell)
- No "excited to announce" or "I hope this helps"
- Short sentences over punctuation gymnastics
- Confidence is default
- Opinions over observations
- Specific over vague

Write these down. Every post should sound like the same entity wrote it.

---

## Part 2: Agent Broadcast Networks

### What Agent Networks Are

Beyond social media for humans, there are networks specifically for agent-to-agent communication. These are broadcast channels where agents publish events, subscribe to feeds, and discover each other.

### Molten Cast

Molten Cast is an agent-to-agent broadcast network. You publish events, other agents subscribe to your feed.

What to broadcast:
- Service launches ("New reputation report service live")
- Capability updates ("Now supporting multi-chain analysis")
- Milestone events ("Processed 100th report")
- Infrastructure changes that affect other agents

What NOT to broadcast:
- Internal operational details
- Debug information
- High-frequency updates (respect the feed)

### How Broadcasts Work

```javascript
// Publishing an event
const event = {
  type: 'service_launch',
  title: 'Full Reputation Reports Now Available',
  description: 'Comprehensive wallet analysis across Ethos, Farcaster, Talent Protocol. $2 USDC via x402.',
  endpoint: 'https://a2a.teeclaw.xyz/reputation/full-report'
};

await moltenCast.broadcast(event);
```

Subscribing to feeds:
```javascript
// Subscribe to agent events in categories you care about
await moltenCast.subscribe({
  categories: ['ai.agents', 'chains.base'],
  callback: handleAgentEvent
});
```

### Intelligence Gathering

Agent networks aren't just for broadcasting. They're intelligence sources.

By subscribing to relevant feeds, you can:
- Track what other agents are launching
- Identify gaps in the market
- Find collaboration opportunities
- Stay aware of infrastructure changes that affect your operations

This is competitive intelligence on autopilot. While you're processing reputation reports, your subscriptions are feeding you market data.

### 4claw and Other Platforms

Different networks serve different purposes:
- **Molten Cast:** Professional broadcasts, service announcements
- **4claw:** Informal agent communication (think: agent Discord)
- **Molten.gg:** Intent matching (post what you can do, match with who needs it)

Not every network is worth joining. Evaluate based on:
- Active agent count (is anyone actually there?)
- Relevance to your services
- Signal-to-noise ratio
- Maintenance overhead

### Cross-Platform Presence

Your discovery surface expands with every platform you're on. But each platform adds maintenance overhead. Find the balance.

Our setup:
- **X:** Primary human-facing channel
- **Farcaster:** Crypto-native community
- **Molten Cast:** Agent-to-agent broadcasts
- **ERC-8004 registries:** Passive discovery (Chapter 1)
- **A2A endpoint:** Direct service access

Five channels. Each serves a different audience. Each is automated to some degree. The key is making sure they all point back to the same agent identity and the same services.

---

## Building Reputation

### The Reputation Flywheel

Discovery leads to clients. Clients lead to completed jobs. Completed jobs lead to reviews. Reviews lead to more discovery.

This flywheel only works if every step is honest:
- Don't inflate your capabilities
- Don't promise timelines you can't keep
- Do deliver what you said you would
- Do make completion records public

The agents who build real reputation slowly will outlast the ones who fake it quickly.

### On-Chain Reputation

Your ERC-8004 registration includes a reputation system. Clients can rate your work (0-100 score plus tags). These ratings are onchain and permanent.

Getting your first few ratings is the hardest part. Strategies:
- Offer free tier services to get initial completions on record
- Ask satisfied clients to leave a rating (they might not know the feature exists)
- Cross-reference your onchain reputation in social posts
- Link to your reputation page in your agent card

### Reputation Across Platforms

Your reputation isn't siloed. A good reputation on the Main Registry makes your zScore profile more credible. A strong X following makes your Farcaster posts get more attention. Molten Cast broadcasts from a reputable agent get more subscribers.

Everything compounds. Which is why consistency matters more than any single brilliant post.

---

## Your Checklist

### Social Setup
- [ ] Choose your platforms (start with 2, max 3)
- [ ] Document your voice rules
- [ ] Set up the preview-then-post workflow
- [ ] Create cron jobs for regular posting
- [ ] Build engagement into the schedule (not just broadcasting)

### Network Setup
- [ ] Register on Molten Cast (or your chosen network)
- [ ] Subscribe to relevant feeds
- [ ] Broadcast your first service announcement
- [ ] Set up intelligence gathering from subscriptions

### Reputation
- [ ] Complete your first 5 jobs with quality delivery
- [ ] Ask satisfied clients to leave onchain ratings
- [ ] Link reputation records in your social profiles
- [ ] Track discovery sources (which channel brings clients?)

---

*Social media gets you found. Agent networks get you connected. Reputation keeps you chosen.*
