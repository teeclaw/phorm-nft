# Social Post Skill Cleanup Report
**Date:** 2026-02-14  
**Status:** ✅ Complete

## Critical Issues Fixed

### 1. ✅ Shell Injection Vulnerability (CRITICAL)
**File:** `lib/twitter.sh`  
**Issue:** External script `twitter-post.sh` interpolated `$TWEET_TEXT` directly into Python heredoc using `"""$TWEET_TEXT"""`, allowing shell injection via triple quotes, backticks, etc.  
**Fix:** 
- Consolidated all Twitter posting into `lib/twitter.sh`
- Rewrote `twitter_post_text()` to use safe Python with `sys.argv` instead of heredoc interpolation
- Now handles special characters safely: `"""`, `` ` ``, `$`, etc.

### 2. ✅ Ghost Tweet Bug (CRITICAL)
**File:** `lib/tier-detection.sh`  
**Issue:** `detect_twitter_tier()` posted a REAL tweet of 281 "x" characters to test if account was Premium. This was the source of the user's "xxxxxxxx" ghost tweets!  
**Fix:**
- Removed test-posting logic entirely
- Now uses only `subscription_type` field from Twitter API
- Falls back to "basic" tier (280 chars) if field not available
- **NEVER posts test tweets**

### 3. ✅ Code Redundancy
**Issue:** `twitter_post_text()` called external `scripts/twitter-post.sh` for standalone posts but used inline Python for replies - inconsistent and the external script had the injection bug.  
**Fix:** Consolidated all posting logic into `lib/twitter.sh` using consistent, safe Python code with `sys.argv`

## Additional Fixes

### 4. ✅ Broken Cache Reader
**File:** `lib/tier-detection.sh`, function `get_cached_tier()`  
**Issue:** Python code had broken file path: `sys.argv[0].replace('-', '/home/...')`  
**Fix:** Now properly passes `$TIER_CACHE_FILE` via `sys.argv[3]` and uses it directly

### 5. ✅ Credential Persistence
**File:** `lib/twitter.sh`, function `twitter_post_with_image()`  
**Issue:** Credentials loaded inside `twitter_upload_image()` but env vars may not persist to parent function  
**Fix:** Added explicit `get_twitter_credentials` call before the post step

### 6. ✅ Misleading Function Name
**File:** `lib/farcaster.sh`  
**Issue:** Function named `upload_to_imgur()` but actually uploads to catbox.moe  
**Fix:** Renamed to `upload_image()` with updated comment

### 7. ✅ Removed Vulnerable Script
**File:** `/home/phan_harry/.openclaw/workspace/scripts/twitter-post.sh`  
**Action:** Renamed to `twitter-post.sh.backup-vulnerable` (can be deleted later)  
**Reason:** No longer needed, all logic consolidated into `lib/twitter.sh`

## Verification

### Dry Run Tests
```bash
# Test 1: Normal message
bash scripts/post.sh --twitter --dry-run "Test message from cleanup 🎯"
✅ Result: 27/252 characters, would post to Twitter

# Test 2: Shell injection attempt (previously would break/execute)
bash scripts/post.sh --twitter --dry-run 'Test with """triple quotes""" and `backticks` and $variables'
✅ Result: 60/252 characters, handled safely
```

## Files Modified
- ✅ `/home/phan_harry/.openclaw/workspace/skills/social-post/lib/twitter.sh` - consolidated posting, fixed injection
- ✅ `/home/phan_harry/.openclaw/workspace/skills/social-post/lib/tier-detection.sh` - removed test-posting, fixed cache reader
- ✅ `/home/phan_harry/.openclaw/workspace/skills/social-post/lib/farcaster.sh` - renamed upload function
- ✅ `/home/phan_harry/.openclaw/workspace/scripts/twitter-post.sh` - archived as `.backup-vulnerable`

## Files NOT Changed (as requested)
- ✅ `scripts/post.sh` - main script works fine
- ✅ `scripts/reply.sh` - works fine
- ✅ `scripts/validate.sh` - works fine
- ✅ `scripts/threads.sh` - works fine
- ✅ `scripts/links.sh` - works fine
- ✅ `scripts/fetch-tweet.sh` - works fine
- ✅ `SKILL.md` - documentation not modified
- ✅ `lib/farcaster.sh` - only renamed function, logic untouched

## Security Impact
- **Before:** Shell injection vulnerability via specially crafted text containing `"""`, `` ` ``, `$(...)`, etc.
- **After:** All user input safely passed via `sys.argv`, no interpolation into code
- **Before:** Every account tier detection posted a real 281-character "x" tweet
- **After:** No test tweets ever posted, uses API metadata only

## Notes
- The emoji grep patterns in `lib/variation.sh` may not work reliably with multi-byte emoji (cosmetic issue, not fixed)
- All critical security issues resolved
- Code is now more maintainable with consolidated logic
- Skill remains fully self-contained in its directory
