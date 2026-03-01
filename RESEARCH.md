# RESEARCH.md - Default Data Sources

## ✅ VERIFIED & WORKING (Use These)

### HackerNews API
**Status:** ✅ Working, no auth required  
**Rate Limit:** ~10,000 requests/hour  
**Best For:** Tech trends, developer pain points, trending topics

**Example queries:**
```bash
# High-engagement AI stories
curl -s 'https://hn.algolia.com/api/v1/search?query=AI&tags=story&numericFilters=points>100&hitsPerPage=20'

# Agent discussions
curl -s 'https://hn.algolia.com/api/v1/search?query=agents&tags=story&numericFilters=points>50&hitsPerPage=20'

# Recent crypto news
curl -s 'https://hn.algolia.com/api/v1/search?query=crypto&tags=story&numericFilters=points>100&hitsPerPage=20'
```

### Twitter (via xURL)
**Status:** ✅ Working, OAuth1 authenticated  
**Accounts:** agentmanifesto (default), mr_crtee  
**Rate Limit:** X API v2 pay-per-use  
**Best For:** Real-time sentiment, viral topics, community feedback

**Example queries:**
```bash
export PATH="$HOME/.npm-global/bin:$PATH"

# Trending crypto topics
xurl search "trending crypto" -n 20

# AI agent discussions
xurl search "AI agents" -n 20

# Building/shipping updates
xurl search "building in crypto" -n 20

# Switch accounts
xurl --app mr_crtee search "agent tools" -n 20
```

### Product Hunt RSS
**Status:** ✅ Working, no auth required  
**Limitation:** Basic data only (no upvote counts)  
**Best For:** Recent product launches, what's shipping

**Example queries:**
```bash
# Latest launches
curl -sL 'https://www.producthunt.com/feed' | grep -E '<title>|<description>' | head -40

# Search for agent-related products
curl -sL 'https://www.producthunt.com/feed' | grep -i 'agent'
```

### web_fetch
**Status:** ✅ Working  
**Best For:** Specific URLs, documentation, competitor sites

**Example queries:**
```bash
# Via tool
web_fetch("https://github.com/trending")
web_fetch("https://8004agents.ai")
```

### Farcaster
**Status:** ✅ Working, full access  
**Account:** @mr-tee (FID 2821101)  
**Best For:** Crypto/agent community sentiment, Base ecosystem

**Usage:** Via social-post skill or direct API calls

---

## ❌ BROKEN / REQUIRES SETUP

### Brave Search API
**Status:** ❌ Invalid subscription token  
**Fix Required:** Renew subscription at https://brave.com/search/api/  
**Setup:** Update `BRAVE_SEARCH_API_KEY` in Secret Manager

### GitHub CLI
**Status:** ❌ Not authenticated  
**Fix Required:** Either:
1. Generate token at https://github.com/settings/tokens → add as `GH_TOKEN` in Secret Manager
2. Run `gh auth login` manually on VM

**Once fixed:** Will enable repo searches, trending analysis, star counts

### Product Hunt API (Full)
**Status:** ❌ Requires OAuth token  
**Fix Required:** Create OAuth app at https://www.producthunt.com/v2/oauth/applications  
**Note:** RSS feed works as alternative (limited data)

---

## 🚫 NOT AVAILABLE

### Reddit API
**Status:** Manual request required  
**Decision:** Skipped for now

---

## DEFAULT RESEARCH PROTOCOL

When TeeResearcher (or any agent) runs market/trend research:

**1. Use ALL verified sources:**
- HackerNews API (trending stories)
- Twitter via xURL (real-time signals)
- Product Hunt RSS (recent launches)
- web_fetch (specific URLs as needed)
- Farcaster (crypto community)

**2. Evidence requirements:**
- Include actual data (story titles, tweet snippets, timestamps)
- Cite sources (HN story IDs, tweet URLs)
- No claims without proof
- If a tool fails, note it and continue with others

**3. Output format:**
- Raw data first (what you found)
- Analysis second (what it means)
- Clearly separate facts from inference

---

## WHEN TO UPDATE THIS FILE

- ✅ When new data source is verified working
- ✅ When broken source is fixed
- ✅ When rate limits or auth requirements change
- ❌ Do not remove working sources without testing

---

**Last Updated:** 2026-03-01 (xURL authenticated, HN verified, GitHub/Brave pending setup)
