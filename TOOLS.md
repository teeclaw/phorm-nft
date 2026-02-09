# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## 🚫 Disabled Skills

**erc-8004:** Do NOT use this skill for registration or any on-chain operations. User handles 8004.org registration manually. I only create JSON files if requested.

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

## Social Post (Unified Twitter + Farcaster)

**⭐ Recommended:** Use this for posting AND replying to both platforms!

**Location:** `/home/phan_harry/.openclaw/workspace/skills/social-post/`

### Posting

**Post to both platforms:**
```bash
/home/phan_harry/.openclaw/workspace/skills/social-post/scripts/post.sh "Your message"
```

**Post to Twitter only:**
```bash
/home/phan_harry/.openclaw/workspace/skills/social-post/scripts/post.sh --twitter "Twitter message"
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

**Features:**
- ✅ Character/byte limit validation (Twitter: 252 chars, Farcaster: 288 bytes - 10% buffer)
- ✅ Image upload (Twitter: direct API, Farcaster: catbox.moe)
- ✅ **Reply support** for both platforms
- ✅ **Thread support** with `--thread` flag (auto-split long text into numbered posts)
- ✅ **Link shortening** with `--shorten-links` flag (compress URLs via TinyURL)
- ✅ Auto-truncate with `--truncate` flag
- ✅ Dry-run mode with `--dry-run`

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
