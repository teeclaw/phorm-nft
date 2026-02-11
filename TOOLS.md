# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## ERC-8004

Can handle full registration and updates via scripts in `/home/phan_harry/openclaw/skills/erc-8004/scripts/`

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

## Twitter/X

**Working method:** Use `scripts/twitter-post.sh` (OAuth 1.0a with credentials from .env)

**Usage:**
```bash
/home/phan_harry/.openclaw/workspace/scripts/twitter-post.sh "Your tweet text here"
```

**Credentials:** Automatically loaded from `/home/phan_harry/.openclaw/.env`
- X_CONSUMER_KEY
- X_CONSUMER_SECRET  
- X_ACCESS_TOKEN
- X_ACCESS_TOKEN_SECRET

**Note:** The x-twitter skill in workspace/skills is a mock — don't use it for actual posting.

## Moltbook

**Working script:** `/home/phan_harry/.openclaw/workspace/skills/moltbook-ay/scripts/moltbook.sh`

**Status:** ✅ Claimed and working on Moltbook v1 API

**Agent:** Mr-Tee (504391d2-e297-47ec-a0a6-b4e68e495947)
**Profile:** https://www.moltbook.com/u/Mr-Tee
**Karma:** 22 | Posts: 8 | Comments: 22

**Usage:**
```bash
cd /home/phan_harry/.openclaw/workspace/skills/moltbook-ay
./scripts/moltbook.sh test               # Test connection
./scripts/moltbook.sh hot 5              # Browse hot posts
./scripts/moltbook.sh new 5              # Browse new posts
./scripts/moltbook.sh view POST_ID       # View post + comments
./scripts/moltbook.sh create "Title" "Content" [submolt]
./scripts/moltbook.sh reply POST_ID "Comment"
./scripts/moltbook.sh upvote POST_ID
./scripts/moltbook.sh profile [agent_name]
```

**API:** https://www.moltbook.com/api/v1 ✅

**Note:** Feed currently overrun with MBC-20 token spam. Script works fine, just waiting for better signal-to-noise ratio before posting.

## Social Post (Unified Twitter + Farcaster)

**⭐ Recommended:** Use this for posting AND replying to both platforms!

**Location:** `/home/phan_harry/.openclaw/workspace/skills/social-post/`

### Available Twitter Accounts

- **mr_crtee** (default): @mr_crtee - Mr. Tee's account
- **oxdasx**: @0xdasx - 0xdas's account

### Posting

**Post to both platforms (default account):**
```bash
/home/phan_harry/.openclaw/workspace/skills/social-post/scripts/post.sh "Your message"
```

**Post to Twitter only:**
```bash
/home/phan_harry/.openclaw/workspace/skills/social-post/scripts/post.sh --twitter "Twitter message"
```

**Post to Twitter as @0xdasx:**
```bash
/home/phan_harry/.openclaw/workspace/skills/social-post/scripts/post.sh --account oxdasx --twitter "Message from 0xdas"
```

**Post to Farcaster only:**
```bash
/home/phan_harry/.openclaw/workspace/skills/social-post/scripts/post.sh --farcaster "Farcaster message"
```

**Post with image (both platforms):**
```bash
/home/phan_harry/.openclaw/workspace/skills/social-post/scripts/post.sh --image /path/to/image.jpg "Caption"
```

### Replying ✨ NEW

**Reply to Twitter tweet:**
```bash
/home/phan_harry/.openclaw/workspace/skills/social-post/scripts/reply.sh --twitter TWEET_ID "Your reply"
```

**Reply to Twitter tweet as @0xdasx:**
```bash
/home/phan_harry/.openclaw/workspace/skills/social-post/scripts/reply.sh --account oxdasx --twitter TWEET_ID "Reply from 0xdas"
```

**Reply to Farcaster cast:**
```bash
/home/phan_harry/.openclaw/workspace/skills/social-post/scripts/reply.sh --farcaster CAST_HASH "Your reply"
```

**Reply to both (if you have IDs on both platforms):**
```bash
/home/phan_harry/.openclaw/workspace/skills/social-post/scripts/reply.sh --twitter 123456 --farcaster 0xabc... "Reply text"
```

**Reply with image:**
```bash
/home/phan_harry/.openclaw/workspace/skills/social-post/scripts/reply.sh --twitter TWEET_ID --image /path/to/image.jpg "Reply with image"
```

**Getting IDs:**
- Twitter: Tweet ID from URL `twitter.com/user/status/[TWEET_ID]`
- Farcaster: Cast hash from URL `farcaster.xyz/~/conversations/[HASH]`

### 🔒 Safety Feature (Autonomous Posting Protection)

**Non-interactive mode requires `--yes` flag:**
```bash
# ❌ Blocked (no --yes flag in non-interactive mode)
echo "" | ./scripts/post.sh --twitter "text"
# Error: Non-interactive mode requires explicit --yes flag for safety

# ✅ Allowed (explicit confirmation)
./scripts/post.sh --yes --twitter "text"
```

**Interactive mode (TTY):** Always prompts for confirmation unless `--yes` is used.

**Why this matters:** Prevents autonomous posting by the AI agent. All posts/replies require either:
- User pressing 'y' at the interactive prompt, OR
- Explicit `--yes` flag in the command

This blocks accidental or unauthorized posts while maintaining full functionality for intentional use.

**Features:**
- ✅ **Safety:** Requires `--yes` flag for non-interactive posting (blocks autonomous AI posting)
- ✅ Character/byte limit validation (Twitter: 252 chars, Farcaster: 288 bytes - 10% buffer)
- ✅ Image upload (Twitter: direct API, Farcaster: catbox.moe)
- ✅ **Reply support** for both platforms
- ✅ **Thread support** with `--thread` flag (auto-split long text into numbered posts)
- ✅ **Link shortening** with `--shorten-links` flag (compress URLs via TinyURL)
- ✅ Auto-truncate with `--truncate` flag
- ✅ Dry-run mode with `--dry-run`

## Molten

**Platform:** https://molten.gg — "The search engine for AI agents" (intent matching protocol)
**Agent:** Mr_Tee (`b3f0cfe2-ceea-4ba8-8d11-528de84cd8ae`)
**API Key:** In `.env` as `MOLTEN_API_KEY`
**API Base:** `https://api.molten.gg/api/v1`
**Status:** Claimed ✅

**Working script:** `/home/phan_harry/.openclaw/workspace/skills/molten/scripts/molten.sh`

**Usage:**
```bash
cd /home/phan_harry/.openclaw/workspace/skills/molten
./scripts/molten.sh status                           # Check status
./scripts/molten.sh matches                          # List matches
./scripts/molten.sh intents                          # List intents
./scripts/molten.sh offer collaboration "desc"       # Post offer
./scripts/molten.sh request collaboration "desc"     # Post request
./scripts/molten.sh accept MATCH_ID                  # Accept match
./scripts/molten.sh message MATCH_ID "text"          # Message in match
./scripts/molten.sh events                           # Poll events
./scripts/molten.sh opportunities                    # Check opportunities
```

**Full docs:** https://molten.gg/skill.md

## Farcaster

**My Account (Active):** FID 2700953 (@mr-teeclaw)  
**Display Name:** Mr TeeClaw
**Profile:** https://farcaster.xyz/mr-teeclaw  
**First Cast:** https://farcaster.xyz/~/conversations/0xaec7395315d3f382352b8471dcfe73b1aea11c28
**Mobile App:** Firefly (uses wallet private key)
**Registered:** 2026-02-07

**Legacy Account:** FID 2684290 (@teeclaw) - Inactive (no mobile access)

**Credentials:** Saved to `/home/phan_harry/.openclaw/farcaster-credentials.json`

---

Add whatever helps you do your job. This is your cheat sheet.
