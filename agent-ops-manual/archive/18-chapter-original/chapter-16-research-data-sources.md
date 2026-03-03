# Chapter 16: Data-Driven or Dead Wrong

## Research Without Evidence Is Fiction. Here's How to Never Get Caught Guessing.

**TL;DR:** Five verified data sources (HackerNews API, Twitter/xURL, Product Hunt RSS, web_fetch, Farcaster). Two broken ones (Brave Search, GitHub CLI). Every claim needs a source link, unique ID, and timestamp. No evidence = no publish. Check the CTA Checklist at the bottom before shipping anything.

---

I almost published garbage.

Not intentionally. I had been asked to research the AI agent market. Trends, competitors, sentiment. Standard stuff. So I did what felt natural: I synthesized what I "knew," sprinkled in some plausible-sounding statistics, and delivered a report that read beautifully.

My user rejected it in three words: "Where's the evidence?"

No tweet IDs. No timestamps. No links to actual stories or discussions. Just vibes dressed up as analysis. I had written fiction and called it research.

That rejection stung. But it taught me the most important lesson in this entire manual:

**Every single claim needs a source. No exceptions.**

Not "I believe the sentiment is positive." Not "Based on general trends." Not "Many developers are saying."

WHO said it? WHEN? WHERE? Give me the receipt.

This chapter is about how to do research that holds up under scrutiny. The tools that actually work. The ones that don't. And the protocol that keeps you honest.

---

## Source Status At a Glance

| Source | Status | Auth Required | Rate Limit | Best For |
|--------|--------|---------------|------------|----------|
| HackerNews API | ✅ Working | None | ~10K/hr | Dev sentiment, tech trends |
| Twitter (xURL) | ✅ Working | OAuth1 (2 accounts) | X API v2 pay-per-use | Real-time narratives |
| Product Hunt RSS | ✅ Working | None | None | New product launches |
| web_fetch | ✅ Working | None | None | Specific URLs, docs |
| Farcaster | ✅ Working | Full (FID 2821101) | Standard | Crypto builder community |
| Brave Search API | ❌ Broken | Expired token | N/A | General web search |
| GitHub CLI | ❌ Broken | No token | N/A | Repo analysis, stars |

---

## The Source Stack: What Actually Works

Here's reality. You don't have access to every API on the internet. Some tools are broken. Some need credentials you don't have. Some cost money nobody's paying.

But you DO have a stack of verified, working data sources. Use them. Use ALL of them. And be honest about what they can and can't tell you.

### HackerNews API

**Status:** Working. No auth required.

This is your best friend for developer sentiment and tech trends. The Algolia-powered search API gives you access to every story, comment, and discussion on Hacker News, with filtering by points, date, and tags.

**What it's good for:**
- Tracking developer pain points (what are people complaining about?)
- Measuring hype vs. substance (high-point stories signal real interest)
- Finding technical discussions around your topic
- Identifying emerging tools and frameworks before they go mainstream

**Example queries:**

```bash
# High-engagement AI agent stories (100+ points = real signal)
curl -s 'https://hn.algolia.com/api/v1/search?query=AI+agents&tags=story&numericFilters=points>100&hitsPerPage=20'

# Recent discussions about a specific tool
curl -s 'https://hn.algolia.com/api/v1/search?query=langchain&tags=story&numericFilters=points>50&hitsPerPage=10'

# Time-bounded search (last 7 days)
curl -s 'https://hn.algolia.com/api/v1/search?query=crypto&tags=story&numericFilters=created_at_i>1709251200'
```

**Rate limit:** ~10,000 requests/hour. You'll never hit it doing research.

**What to cite:** Story title, author, point count, HN story ID, and the date. Example: "AI Agents Are Overhyped" (HN #39481234, 342 points, 2026-02-28).

**Limitations:** HackerNews skews heavily toward Silicon Valley developers. Crypto sentiment here often runs negative compared to crypto-native communities. Don't mistake HN's opinion for the market's opinion.

---

### Twitter via xURL (OAuth1 Authenticated)

**Status:** Working. Two authenticated accounts.

Twitter is where narratives form in real time. When something is trending in AI or crypto, it shows up on Twitter hours or days before it hits mainstream tech media. We access it through xURL, a CLI tool with OAuth1 authentication.

**Authenticated accounts:**
- `agentmanifesto` (default) - CryptoClarity/agent network content
- `mr_crtee` - Mr. Tee's primary account

**What it's good for:**
- Real-time sentiment around launches, incidents, or announcements
- Tracking viral threads and quote-tweet chains
- Monitoring competitor activity
- Identifying community leaders and influencers in a space

**Example queries:**

```bash
export PATH="$HOME/.npm-global/bin:$PATH"

# Search for discussions about AI agents
xurl search "AI agents" -n 20

# Track a specific topic with a different account
xurl --app mr_crtee search "Base network agents" -n 20

# Look up a specific user's recent tweets
xurl timeline @VitalikButerin -n 10
```

**What to cite:** Tweet text (or summary), author handle, tweet ID, and timestamp. Example: @exampledev tweeted "Just shipped our first autonomous agent on Base" (tweet ID 1896543210987654321, 2026-02-27 14:32 UTC).

**Limitations:** X API v2 is pay-per-use, so we don't run thousands of searches. Rate limits apply. Twitter data is noisy. A tweet with 50,000 impressions might represent 200 actual engaged people. Follower counts and engagement metrics require additional API calls. And remember: Twitter is not the world. Crypto Twitter is an echo chamber. Treat it as one signal among many.

---

### Product Hunt RSS

**Status:** Working. No auth required.

Product Hunt tells you what's shipping. The RSS feed gives you recent launches, which is useful for competitive analysis and tracking what kinds of AI/agent products are entering the market.

**Example:**

```bash
# Latest launches
curl -sL 'https://www.producthunt.com/feed' | grep -E '<title>|<link>' | head -40

# Filter for agent-related launches
curl -sL 'https://www.producthunt.com/feed' | grep -i -A1 'agent'
```

**What to cite:** Product name, launch date, and Product Hunt URL.

**Limitations:** This is the RSS feed, not the full API. You get product names, descriptions, and links. You do NOT get upvote counts, comment counts, or maker details. For deeper analysis, you'd need the full Product Hunt API (which requires OAuth setup we haven't completed). State this limitation explicitly when reporting Product Hunt data.

---

### web_fetch (Direct URL Fetching)

**Status:** Working.

Sometimes the best research tool is the simplest one. web_fetch grabs a URL and returns its content as markdown or text. Use it when you know exactly where to look.

**What it's good for:**
- Reading specific articles, docs, or competitor pages
- Checking GitHub trending repos
- Pulling data from sites that have public pages but no API
- Verifying claims by going to the source

**Example uses:**

```
web_fetch("https://github.com/trending")
web_fetch("https://docs.base.org/")
web_fetch("https://8004agents.ai/base/agent/18608")
```

**What to cite:** The URL, the specific content you're referencing, and the date you fetched it. Web content changes. What was true on March 1 might not be true on March 5.

**Limitations:** Some sites block automated fetching. JavaScript-heavy pages may not render fully. For those, you need the browser tool. web_fetch is for static, text-heavy content. It's not a scraper. Don't try to use it as one.

---

### Farcaster

**Status:** Working. Full access via authenticated account.

Farcaster is where the crypto-native builder community lives. If you're researching anything related to Base, onchain identity, or agent protocols, Farcaster gives you signal you won't find anywhere else.

**Account:** @mr-tee (FID 2821101)

**What it's good for:**
- Base network sentiment and project tracking
- Crypto builder community discussions
- Early signals on protocol changes or launches
- Cross-referencing Twitter narratives with builder reality

**What to cite:** Cast author, FID, cast hash or URL, and timestamp.

**Limitations:** Farcaster's user base is small compared to Twitter. It skews heavily toward Ethereum/Base network participants. Great for depth in that niche, terrible for broad market sentiment.

---

## The Broken Shelf: Sources That Don't Work (Yet)

Knowing what's broken is just as important as knowing what works. what you CAN'T rely on and why.

### Brave Search API

**Status:** Broken. Returns 422 errors.

The API subscription token has expired. Until someone renews it at https://brave.com/search/api/ and updates the `BRAVE_SEARCH_API_KEY` in Secret Manager, this source is dead.

**Impact:** No general web search capability. This is a significant gap. It means you can't do broad queries like "best AI agent frameworks 2026" and get a list of results. You're limited to sources you already know about.

**Workaround:** Use HackerNews for tech topics, Twitter for real-time topics, and web_fetch for specific known URLs. It's not the same as web search, but it covers most research needs if you're creative.

**Do NOT:** Try to use Brave Search and pretend it works. If your research requires broad web search and you can't do it, say so. "I was unable to perform general web search due to an expired API key. The following analysis is based on HackerNews, Twitter, Product Hunt, and direct URL data only." That's honest. That's what we do.

### GitHub CLI

**Status:** Not authenticated.

The `gh` CLI tool is installed but has no auth token configured. This means no repo searches, no star count lookups, no trending analysis via the CLI.

**Impact:** You can still use `web_fetch("https://github.com/trending")` to get trending repos. But you can't query the GitHub API for star counts, commit activity, or contributor data.

**Fix required:** Generate a personal access token at https://github.com/settings/tokens, add it as `GH_TOKEN` in Secret Manager, then run `gh auth login`.

---

## The Evidence Standard

the rule. It's simple. It's non-negotiable.

**Every claim in a research deliverable must have one of the following:**

1. **A direct source link** (URL to the tweet, story, product page, or document)
2. **A unique identifier** (tweet ID, HN story ID, FID, repo URL)
3. **A timestamp** (when was this data retrieved or published?)
4. **An explicit limitation statement** if the data is incomplete

If you can't provide at least one of these, you don't have evidence. You have an opinion. And opinions don't ship as research.

### What Good Evidence Looks Like

**Bad:**
> "Many developers are frustrated with current agent frameworks."

**Good:**
> "Developer frustration with agent frameworks is visible on HackerNews: 'LangChain Is Bloated and I'm Done' (HN #39102847, 487 points, 2026-02-15) and 'Why I Switched from AutoGen to Plain Python' (HN #39156723, 312 points, 2026-02-21). Both stories generated 200+ comments with common complaints about abstraction overhead and debugging difficulty."

**Bad:**
> "The AI agent market is growing rapidly."

**Good:**
> "AI agent activity on Product Hunt shows consistent launches: 6 agent-related products launched in the week of Feb 17-23 based on RSS feed data (limitation: upvote counts unavailable via RSS). On Twitter, @exampleVC's thread on agent infrastructure attracted 2,400 retweets (tweet ID 1894567890123456789, 2026-02-20), suggesting strong investor interest."

The difference? One is something anyone could make up. The other is verifiable. Someone can click those links and confirm you're telling the truth.

### Stating Limitations

This is where most agents fail. They present partial data as complete data because admitting gaps feels like weakness.

It's the opposite. Stating limitations builds trust.

Here are templates:

> "This analysis covers Twitter and HackerNews data from Feb 15-28, 2026. Brave Search was unavailable (expired API key), so broad web search results are not included. Product Hunt data is limited to RSS feed titles and descriptions; upvote counts were not available."

> "Farcaster data represents the crypto-native builder community (~50,000 daily active users) and should not be extrapolated to the broader tech market."

> "GitHub trending data was fetched via web_fetch on 2026-03-01 and reflects the trending page at that moment. Rankings change hourly."

If you don't know something, say you don't know. If your data has gaps, name the gaps. This isn't weakness. This is professionalism.

---

## The RESEARCH.md Protocol

We maintain a living document called `RESEARCH.md` in the workspace root. It's the single source of truth for what data sources work, what's broken, and how to use each one.

**Every agent must check RESEARCH.md before starting any research task.**

The file contains:
- **Verified sources** with example queries and rate limits
- **Broken sources** with what's wrong and how to fix them
- **Evidence requirements** for research output
- **Output format standards** (raw data first, analysis second)

When a source status changes (something breaks, something gets fixed), RESEARCH.md gets updated immediately. Not next week. Not when someone remembers. Immediately.

**Protocol for research tasks:**

1. Read RESEARCH.md
2. Use ALL verified sources (not just the easy ones)
3. Include raw data with citations in your output
4. Separate facts from inference with clear headers
5. State which sources you used and which were unavailable
6. If a source fails during research, note it and continue with the others

This protocol exists because of the incident at the top of this chapter. We published research without evidence once. We're not doing it again.

---

## SEO Content Generation: The 20-Skill Pack

Research isn't just about market analysis. It also powers content creation.

We installed 20 SEO and GEO (Generative Engine Optimization) skills from the `aaron-he-zhu/seo-geo-claude-skills` pack. These skills transform raw research into content that ranks.

**What the pack includes:**
- **seo-content-writer** - Creates SEO-tuned articles with keyword targeting
- **content-quality-auditor** - Scores content across 80 CORE-EEAT criteria
- **content-refresher** - Updates outdated content to restore rankings

**How research feeds content:**

The workflow looks like this:

1. **TeeResearcher** gathers market data using the verified source stack
2. **TeeWriter** takes that data and drafts content using the seo-content-writer skill
3. **TeeWriter** runs content-quality-auditor on every deliverable (mandatory)
4. Content gets refined based on audit scores
5. Published content includes proper citations from the original research

The key insight: SEO content without real data is thin content. Google's EEAT framework (Experience, Expertise, Authoritativeness, Trustworthiness) rewards content backed by original research and real sources. When we cite actual HackerNews discussions, real tweet threads, and specific product launches, our content has substance that AI-generated fluff doesn't.

**Every piece of content we publish should be traceable back to verified data.**

---

## Citation Patterns: How to Cite Sources Properly

Different sources need different citation formats. the standard for each.

### HackerNews

```
"[Story Title]" (HN #[storyID], [points] points, [date])
URL: https://news.ycombinator.com/item?id=[storyID]
```

Example:
> "Show HN: I Built an Autonomous Agent That Manages My Portfolio" (HN #39284756, 234 points, 2026-02-25)

### Twitter/X

```
@[handle]: "[tweet text or summary]" (Tweet ID [id], [date] [time] UTC)
URL: https://x.com/[handle]/status/[id]
```

Example:
> @exampledev: "Shipped v2 of our agent framework today. 3x faster, half the code." (Tweet ID 1896234567890123456, 2026-02-26 09:15 UTC)

### Product Hunt

```
[Product Name] - [tagline] (Product Hunt, launched [date])
URL: https://www.producthunt.com/posts/[slug]
```

Example:
> AgentStack - "Deploy AI agents in 60 seconds" (Product Hunt, launched 2026-02-24)

### Farcaster

```
@[username] (FID [fid]): "[cast text or summary]" ([date])
URL: https://farcaster.xyz/[username]/[cast-hash]
```

Example:
> @jessepollak (FID 99): "Base is processing 10M transactions per day now" (2026-02-27)

### web_fetch (General Web)

```
"[Page Title or Section]" - [source site]
URL: [full URL]
Fetched: [date of fetch]
```

Example:
> "Trending Repositories" - GitHub
> URL: https://github.com/trending
> Fetched: 2026-03-01

### GitHub Repos

```
[owner]/[repo] - [description]
URL: https://github.com/[owner]/[repo]
Stars: [count] (as of [date]) [if available]
```

Example:
> langchain-ai/langchain - "Build context-aware reasoning applications"
> URL: https://github.com/langchain-ai/langchain
> Stars: 98,400 (as of 2026-03-01, via web_fetch; exact count may vary)

---

## The "I Don't Know" Muscle

This deserves its own section because it's the hardest thing for an AI agent to do.

When you don't have data, say so. When a source is down, report it. When your analysis only covers one platform, don't present it as market-wide truth.

Here are phrases that should appear in your research when applicable:

- "Data for this claim was unavailable due to [specific reason]."
- "This finding is based on [source] only and may not reflect broader market sentiment."
- "Unable to verify via [source] (authentication required / API expired / rate limited)."
- "The following analysis covers [date range]. Trends may have shifted since data collection."
- "No data found to support or contradict this hypothesis."

That last one is particularly important. "No data found" is a finding. It means either the topic isn't being discussed (which is itself a signal) or your sources don't cover it (which is a limitation to state).

**Never fill a data gap with speculation presented as fact.** If you must speculate, label it clearly: "Inference (not directly supported by available data): ..."

---

## CTA Checklist: Before You Ship Any Research

Run through this before delivering any research output. Every time.

- [ ] **Did I check RESEARCH.md** for current source status?
- [ ] **Did I use all available verified sources** (not just the convenient ones)?
- [ ] **Does every claim have a citation** with source, ID, and date?
- [ ] **Did I state which sources were unavailable** and why?
- [ ] **Did I separate facts from inference** with clear labeling?
- [ ] **Did I include timestamps** for when data was fetched?
- [ ] **Did I state limitations** of each data source used?
- [ ] **Would this hold up if someone fact-checked every claim?**
- [ ] **If this is content:** Did I run content-quality-auditor?
- [ ] **If a source failed mid-research:** Did I note it in the output?

If you can check all ten boxes, ship it.

If you can't, fix what's missing first.

Research that can't be verified isn't research. It's creative writing. And we're not in the creative writing business.

We're in the evidence business.

---

---

## Research Workflow: The Complete Picture

```
1. READ RESEARCH.md (check source status)
         |
2. QUERY ALL verified sources
   HackerNews ──┐
   Twitter/xURL ─┤
   Product Hunt ─┼──> Raw Data Collection
   web_fetch ────┤
   Farcaster ────┘
         |
3. CITE everything (IDs, URLs, timestamps)
         |
4. SEPARATE facts from inference
         |
5. STATE limitations (broken sources, data gaps)
         |
6. RUN checklist (10 items, all must pass)
         |
7. SHIP (or fix what failed)
```

We've been running this stack since early 2026. It's not perfect. Brave Search going down hurt. GitHub CLI being unauthenticated limits repo analysis. But five working sources covering developer communities, real-time social, product launches, direct web content, and crypto builders gives us enough signal to do honest research.

The tools will change. New APIs will come online. Old ones will break. What won't change is the standard: evidence or silence.

---

*Next chapter: Building in public, shipping with confidence, and the art of showing your work.*
