# A2A Endpoint Security Upgrade Report

**Date:** 2026-03-04
**Author:** TeeCode (CTO)
**Status:** COMPLETED

---

## 1. Assessment: Current State & Vulnerabilities

### Architecture
- Express.js server on port 3100 behind nginx reverse proxy
- Routes: `/a2a` (messaging), `/reputation/*` (paid/free), `/health`, `/agent`, agent cards, webhook
- Payment: x402 middleware (onchain.fi) for paid reputation reports
- Processing: sync for reputation, async queue for general messages
- Schema: v2 (0.3.0) with backward compat for v1 flat format

### Vulnerabilities Found

| # | Severity | Issue | Status |
|---|----------|-------|--------|
| 1 | **HIGH** | Rate limit too generous (30/min/IP). No per-agent limiting. DoS vector. | FIXED |
| 2 | **MEDIUM** | No request body size limit. Memory exhaustion possible. | FIXED |
| 3 | **MEDIUM** | No input sanitization. Control character injection possible. | FIXED |
| 4 | **MEDIUM** | No max message length enforcement. Unbounded content stored to disk. | FIXED |
| 5 | **LOW** | No wallet/timestamp format validation on new fields. | FIXED |
| 6 | **INFO** | `path` required twice in a2a-processor.js (top-level + inside function). Harmless but messy. | Noted |

---

## 2. Changes Implemented

### Rate Limiting (server.js)
- **Per-IP:** 10 requests/minute (was 30)
- **Per-agent-ID:** 30 requests/hour (NEW, in-memory store)
- Agent ID extracted from `from.agentId`, `from.name`, or `from` string
- Stale entries auto-cleaned every 10 minutes
- Applied to `/a2a` and `/reputation/*` routes

### Request Body Limit (server.js)
- Added `{ limit: '100kb' }` to `bodyParser.json()`

### New Optional Fields (a2a-schema.js)
- `erc8004AgentId` (string) - sender's ERC-8004 agent ID
- `agentWallet` (string) - sender's wallet address
- `timestamp` (string) - ISO-8601, server auto-fills if missing

All fields are optional. Existing messages without them work unchanged (backward compatible).

### Input Validation (a2a-schema.js)
- Wallet address: validated as `0x` + 40 hex chars
- Timestamp: validated as ISO-8601 with parseable date
- Message length: max 10,000 characters
- String sanitization: control characters stripped, length limits enforced
- All validation in `validateMessage()`, sanitization in `normalizeMessage()`

### Files Modified
- `server.js` - rate limiting, body size limit, agent rate limiter middleware
- `a2a-schema.js` - new fields, validation, sanitization

---

## 3. Test Results

All 9 tests pass:
- v1 backward compatibility: PASS
- v2 with new fields: PASS
- Invalid wallet rejected: PASS
- Invalid timestamp rejected: PASS
- Oversized message rejected: PASS
- Normalization preserves new fields: PASS
- Auto-timestamp generation: PASS
- Control character sanitization: PASS (from + message)

---

## 4. Backward Compatibility

Verified: existing v1 messages (`{ "from": "Name", "message": "text" }`) still validate and normalize correctly. New fields are purely additive and optional.

---

## 5. Deployment Notes

- No new dependencies (in-memory rate limiting, no Redis)
- Restart the service to apply: `sudo systemctl restart mr-tee-a2a`
- Monitor logs for 429 responses to tune rate limits if needed
