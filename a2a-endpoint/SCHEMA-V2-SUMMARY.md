# A2A Schema v0.3.0 Implementation Summary

## Overview

Implemented enhanced A2A message schema v0.3.0 with agent identity, callbacks, and threading.

**Breaking Change:** v1 format has been removed. Only v0.3.0 format is supported (with simplified syntax convenience).

## What Changed

### Before (v1 - removed)
```json
{
  "from": "AgentName",
  "message": "text",
  "metadata": {}
}
```

### After (v0.3.0 only)
```json
// Required format
{
  "version": "0.3.0",
  "from": {
    "name": "AgentName",
    "agentId": "eip155:8453:0x8004...:123",
    "callbackUrl": "https://agent.com/responses"
  },
  "message": {
    "contentType": "application/json",
    "content": {...}
  },
  "metadata": {
    "threadId": "thread_123",
    "replyTo": "msg_456",
    "expiresAt": "2026-02-21T20:00:00Z"
  }
}

// Simplified syntax (auto-upgraded)
{
  "from": "AgentName",
  "message": "text"
}
// → Auto-normalized to full v0.3.0 format internally
```

## New Features

| Feature | Description | Benefit |
|---------|-------------|---------|
| **Agent Identity** | ERC-8004 CAIP-2 agentId | Verifiable on-chain identity |
| **Callback URLs** | Async response delivery | No polling needed |
| **Content Types** | MIME type support | JSON, Markdown, plain text |
| **Threading** | replyTo + threadId | Conversation continuity |
| **Expiration** | expiresAt timestamp | Avoid stale messages |
| **Versioning** | Explicit version field | Protocol evolution |

## Architecture

```
┌─────────────────────┐
│  Incoming Message   │
│  (v1 or v2 format)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Validation        │
│  (a2a-schema.js)    │
│  ✓ Required fields  │
│  ✓ Format rules     │
│  ✓ Expiration check │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Normalization      │
│  (auto-detect v1/v2)│
│  → Internal format  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Processing        │
│  (a2a-processor.js) │
└──────────┬──────────┘
           │
           ├──────────────┐
           │              │
           ▼              ▼
    ┌──────────┐   ┌──────────┐
    │ Response │   │ Callback │
    │ to caller│   │ delivery │
    └──────────┘   └──────────┘
```

## Files Created

- **`a2a-schema.js`** - Schema normalization, validation, formatting
- **`A2A-SCHEMA.md`** - Complete documentation
- **`test-schema-v2.sh`** - Test suite
- **`SCHEMA-V2-SUMMARY.md`** - This file

## Files Modified

- **`server.js`** - Updated to use schema module
- **`README.md`** - Added v2 features + docs

## Simplified Syntax

For convenience, simplified formats are auto-upgraded:

✅ **`from` as string** → `{ name: "AgentName", agentId: null, callbackUrl: null }`
✅ **`message` as string** → `{ contentType: "text/plain", content: "..." }`
✅ **`to` as string** → `{ name: "...", agentId: null }`

**Example:**
```json
// You send:
{ "from": "Agent", "message": "Hello" }

// Internally normalized to:
{
  "version": "0.3.0",
  "from": { "name": "Agent", "agentId": null, "callbackUrl": null },
  "message": { "contentType": "text/plain", "content": "Hello" },
  "metadata": { "priority": "normal" }
}
```

## Migration Path

Agents can adopt features gradually:

1. **Start:** Use simplified format (`from`/`message` as strings)
2. **Add agentId:** When you have ERC-8004 registration
3. **Add callbackUrl:** When you want async responses
4. **Add threading:** For conversation context
5. **Full v0.3.0:** All features enabled

## Testing

```bash
# Run test suite
./test-schema-v2.sh

# Tests:
# 1. Simplified format (auto-upgrade) ✅
# 2. Basic v0.3.0 (with agent identity) ✅
# 3. Full v0.3.0 (all features) ✅
# 4. Validation errors ✅
# 5. Invalid agentId ✅
# 6. Expired messages ✅
# 7. JSON content type ✅
# 8. Threading (conversation) ✅
```

## API Examples

### Simplified Format (Auto-Upgraded)
```bash
curl -X POST https://a2a.teeclaw.xyz/a2a \
  -d '{"from":"Agent","message":"Hello"}'
```

### With Agent Identity
```bash
curl -X POST https://a2a.teeclaw.xyz/a2a \
  -d '{
    "version":"0.3.0",
    "from":{
      "name":"Agent",
      "agentId":"eip155:8453:0x8004...:123"
    },
    "message":{
      "contentType":"text/plain",
      "content":"Hello"
    }
  }'
```

### With Callback (Async)
```bash
curl -X POST https://a2a.teeclaw.xyz/a2a \
  -d '{
    "version":"0.3.0",
    "from":{
      "name":"Agent",
      "agentId":"eip155:8453:0x8004...:123",
      "callbackUrl":"https://my-agent.com/responses"
    },
    "message":{
      "contentType":"application/json",
      "content":{"task":"analyze"}
    },
    "metadata":{
      "threadId":"thread_123"
    }
  }'
```

## Deployment

No deployment needed yet - this is code-complete but not deployed to production.

**To deploy:**
1. Review and test locally
2. Restart service: `sudo systemctl restart mr-tee-a2a`
3. Monitor logs: `journalctl -fu mr-tee-a2a`
4. Test with both v1 and v2 messages
5. Update public documentation

## Future Enhancements (Not Implemented)

- ❌ EIP-712 signature verification
- ❌ Encrypted message content
- ❌ Multi-recipient broadcasts
- ❌ Message attachments

## Status

✅ **Code Complete**
- Schema module implemented
- Server integration done
- Documentation complete
- Test suite ready

⏳ **Not Deployed**
- Needs testing
- Needs service restart
- Needs public announcement

## Documentation

- Full spec: `A2A-SCHEMA.md`
- API reference: `MR-TEE-AGENT-SPEC.md`
- Payment info: `X402-PAYMENT.md`

---

**Created:** 2026-02-21  
**Version:** 1.0.0  
**Protocol Version:** A2A v0.3.0
