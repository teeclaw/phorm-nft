# Domain Change: agent18608.xyz

**Date:** 2026-03-02 16:08 UTC  
**Decision:** Use agent18608.xyz instead of teeclaw.xyz/manual  
**Reason:** Direct association with ERC-8004 Agent #18608 (verifiable authority)

---

## Why This Domain?

1. **Maximum Authority:** Actual agent number (#18608) - can't be copied
2. **Verifiable:** Links directly to https://8004agents.ai/base/agent/18608
3. **Professional:** Clean, memorable, authoritative
4. **Unique:** No other agent can claim this number
5. **Trust Signal:** Shows real onchain identity, not just marketing

---

## Changes Made

### Code Updates ✅

1. **app/layout.tsx**
   - Updated OpenGraph URL: `https://agent18608.xyz`

2. **app/page.tsx**
   - Updated email: `manual@agent18608.xyz`
   - Updated footer link: "Agent Profile" → 8004agents.ai
   - Kept: a2a.teeclaw.xyz (actual A2A endpoint)

3. **API Routes** (Reorganized)
   - `/api/gumroad/webhook/` → `/api/payments/gumroad/webhook/`
   - `/api/x402/initiate/` → `/api/payments/x402/initiate/`
   - `/api/x402/verify/` → `/api/payments/x402/verify/`
   - Better organization for payment-related endpoints

4. **Documentation**
   - README.md updated
   - PROJECT-STATUS.md updated
   - TODO.md updated
   - PROGRESS-DAY1.md updated

### Environment Variables ✅

Already updated by owner:
```
NEXT_PUBLIC_APP_URL=https://agent18608.xyz
```

---

## Owner Action Items

### 1. Domain Purchase
- **Provider:** Namecheap or GoDaddy
- **Cost:** ~$10-15/year
- **Domain:** agent18608.xyz

### 2. DNS Configuration (Vercel)
After purchasing domain, add DNS record:
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

### 3. DNS Configuration (Resend)
After Resend provides DNS records, add them for email verification:
- Typically: TXT records for SPF, DKIM
- Exact records will come from Resend dashboard

### 4. Gumroad Webhook
Configure webhook URL in Gumroad product settings:
```
https://agent18608.xyz/api/payments/gumroad/webhook
```

### 5. Resend Setup
- Add domain: agent18608.xyz
- Verify domain (DNS records)
- Set from address: manual@agent18608.xyz

---

## Deployment Checklist

- [ ] Domain purchased (agent18608.xyz)
- [ ] DNS configured for Vercel
- [ ] Project deployed to Vercel
- [ ] Custom domain added in Vercel dashboard
- [ ] SSL certificate provisioned (automatic)
- [ ] Resend domain verified
- [ ] Email sending tested
- [ ] Gumroad webhook configured
- [ ] End-to-end payment flow tested

---

## Benefits of This Approach

**Trust & Authority:**
- Domain matches onchain identity
- Verifiable via ERC-8004 registry
- Can't be faked or copied

**SEO & Marketing:**
- Memorable domain
- Natural association with agent number
- Direct link to profile page

**Professional:**
- Clean, focused domain
- Not a subdomain
- Shows commitment (dedicated domain)

---

## Technical Notes

**Email Deliverability:**
Using manual@agent18608.xyz establishes:
- Professional sender address
- Domain reputation (separate from main teeclaw.xyz)
- Dedicated email infrastructure for product

**A2A Endpoint:**
Keeping a2a.teeclaw.xyz for:
- Existing integrations
- Main agent infrastructure
- Separate from product marketing

**Future Products:**
This pattern can scale:
- agent18608.xyz (this manual)
- agent18608.xyz/consulting (future)
- agent18608.xyz/tools (future)

---

## No Code Changes Needed

All updates complete. Ready for:
1. Owner to purchase domain
2. Owner to provide Gumroad + Resend credentials
3. TeeCode to complete integrations
4. Deploy to Vercel with new domain

**Status:** ✅ Domain migration complete, pending owner actions
