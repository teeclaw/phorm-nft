# PDF Delivery Strategy

## Phase 1: Gumroad Hosting (LAUNCH)

**Status:** Active (launch approach)
**Timeline:** Day 1-14

### Setup
1. Upload `agent-ops-manual-final.pdf` to Gumroad product settings
2. Gumroad handles all file delivery automatically
3. No webhook needed for delivery
4. No Resend needed

### Pros
- ✅ Zero setup time
- ✅ Immediate launch capability
- ✅ Proven reliable delivery
- ✅ No infrastructure dependencies
- ✅ No DNS configuration required

### Cons
- ❌ Generic Gumroad email branding
- ❌ No download analytics
- ❌ No custom email content
- ❌ Less control over customer experience

### Customer Experience
- Purchase on Gumroad → Receive Gumroad email → Download PDF via Gumroad link
- Email from: Gumroad
- Subject: "Your purchase from [Agent 18608]"
- Download link: Hosted on Gumroad servers

---

## Phase 2: Own Infrastructure (UPGRADE)

**Status:** Planned (post-launch optimization)
**Timeline:** Week 2-3 (after validating sales)

**Note:** Resend API key already available in Secret Manager (`AGENT18608_RESEND_API_KEY`) ✅

### Setup Required
1. ~~Resend account + API key~~ ✅ Already configured
2. DNS configuration for agent18608.xyz:
   - MX records (email delivery)
   - TXT records (SPF, DKIM authentication)
   - CNAME records (tracking)
3. Webhook integration (already built)
4. Email template testing
5. Deliverability monitoring

### Pros
- ✅ Custom branded emails from noreply@agent18608.xyz
- ✅ Full control over email content
- ✅ Download analytics and tracking
- ✅ Signed URLs (24h expiry for security)
- ✅ Custom receipt messaging
- ✅ Professional brand consistency

### Cons
- ❌ Requires DNS setup time
- ❌ Email deliverability testing needed
- ❌ More moving parts (potential failure points)
- ❌ Costs $0.10 per 1000 emails (minimal)

### Customer Experience
- Purchase on Gumroad → Webhook triggers → Custom email sent → Download PDF via signed URL
- Email from: noreply@agent18608.xyz
- Subject: "Your Agent 18608 Revenue Playbook"
- Download link: Hosted on agent18608.xyz (24h expiry)

---

## Migration Plan (Phase 1 → Phase 2)

**When to migrate:**
- After 10-20 successful sales (validate product works)
- When time available for DNS setup
- When Resend account ready

**How to migrate:**
1. Set up Resend account
2. Configure DNS records (wait 24-48h for propagation)
3. Test email delivery to multiple providers (Gmail, Outlook, etc.)
4. Update webhook to use Resend
5. Test purchase flow end-to-end
6. Switch traffic (remove PDF from Gumroad, enable webhook delivery)
7. Monitor for 48h

**Rollback plan:**
- If delivery issues: Re-upload PDF to Gumroad, disable webhook
- Zero downtime (keep both systems ready during migration)

---

## Current Status

**Active:** Phase 1 (Gumroad hosting)
**Next Action:** Upload PDF to Gumroad product settings
**Blocker:** None
**Launch Ready:** Yes ✅

---

## Technical Notes

### Webhook Status
- Endpoint exists: `/api/payments/gumroad/webhook`
- Seller ID validation: Active
- Ready for Phase 2 (not used in Phase 1)

### PDF Location
- Source: `agent-ops-manual/agent-ops-manual-final.pdf`
- Size: 240 KB
- Pages: 80
- Quality: Studio-grade, production-ready

### Email Template (Phase 2)
- Template exists: `landing-manual/email-template.html`
- Ready for Resend integration
- Matches brand voice

---

**Strategic Decision:** Launch fast with Gumroad, optimize later with own infrastructure.

**Owner approval:** 2026-03-03 08:56 UTC
