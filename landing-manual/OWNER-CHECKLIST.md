# Owner Checklist: Agent Operations Manual Launch

**Last Updated:** 2026-03-02 16:15 UTC  
**Status:** Waiting for owner actions  
**Domain:** agent18608.xyz

---

## Immediate Actions Required

### 1. Purchase Domain ⏳
**Provider:** Namecheap.com or GoDaddy.com  
**Domain:** agent18608.xyz  
**Cost:** ~$10-15/year

**Steps:**
1. Go to Namecheap.com or GoDaddy.com
2. Search for "agent18608.xyz"
3. Purchase for 1 year (auto-renew recommended)
4. You'll receive DNS management access

---

### 2. Set Up Gumroad Product ⏳
**Product:** Agent Operations Manual PDF  
**Price:** $39 (one-time)

**Steps:**
1. Log in to Gumroad
2. Create new product:
   - Name: "Agent Operations Manual"
   - Price: $39
   - File: Upload PDF when TeeDesign provides it
3. Configure webhook:
   - URL: `https://agent18608.xyz/api/payments/gumroad/webhook`
   - Events: "sale"
4. Copy Product ID → provide to TeeCode
5. Optional: Copy API key → provide to TeeCode

---

### 3. Set Up Resend (Email Service) ⏳
**Service:** Resend.com  
**From Address:** manual@agent18608.xyz

**Steps:**
1. Sign up at Resend.com
2. Add domain: agent18608.xyz
3. Resend will provide DNS records (TXT, CNAME)
4. Add those DNS records to your domain
5. Wait for verification (usually 5-15 minutes)
6. Create API key
7. Provide API key to TeeCode

---

### 4. Configure DNS ⏳
**For:** Vercel deployment + Resend email

**DNS Records to Add:**

#### For Vercel (Website)
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: Auto
```

#### For Resend (Email)
Resend will provide these after you add domain:
```
Type: TXT
Name: (provided by Resend)
Value: (provided by Resend)

Type: CNAME
Name: (provided by Resend)
Value: (provided by Resend)
```

**Where to Add:**
- Namecheap: Dashboard → Domain List → Manage → Advanced DNS
- GoDaddy: My Products → Domains → DNS

---

## Information to Provide TeeCode

Once you complete the above:

```
GUMROAD_PRODUCT_ID=your-product-id-here
GUMROAD_API_KEY=your-api-key-here (optional)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
PAYMENT_WALLET_ADDRESS=0x1Af5f519DC738aC0f3B58B19A4bB8A8441937e78
```

Send via secure channel (Telegram DM or encrypted file).

---

## What Happens Next

### After You Provide Credentials:

**Day 2-3 (TeeCode):**
1. Integrate Resend email delivery
2. Implement transaction verification (x402)
3. Set up purchase tracking
4. Create success/failure pages
5. Test both payment flows

**Day 4-5 (Testing):**
1. End-to-end testing (Gumroad + x402)
2. Email delivery testing
3. Download link testing
4. Lighthouse audit (95+ score)
5. Mobile device testing

**Day 6-7 (Deploy):**
1. Deploy to Vercel
2. Add agent18608.xyz domain in Vercel
3. SSL certificate provisioned (automatic)
4. Final QA
5. **LAUNCH** 🚀

---

## Timeline

**Day 1:** ✅ Complete (landing page + copy)  
**Day 2-3:** ⏳ Waiting for credentials  
**Day 4-5:** Testing + polish  
**Day 6-7:** Deploy + launch

**Total:** 5-7 days from start  
**Current:** Day 1 complete, 50% done

---

## Cost Summary

### One-Time Costs
- Domain: ~$10-15/year
- PDF from TeeDesign: (internal - no cost)

### Monthly Costs
- Resend: $0 (free tier: 3,000 emails/month, plenty for launch)
- Vercel: $0 (free tier works fine for this site)
- Gumroad: 10% fee on sales (industry standard)

**Total Monthly:** $0 until scale requires paid tiers

---

## FAQ

**Q: Why agent18608.xyz instead of teeclaw.xyz/manual?**  
A: Maximum authority. The domain IS your agent number, verifiable onchain. Can't be faked.

**Q: Do I need to configure Gumroad webhooks immediately?**  
A: No, but recommended. Webhooks enable automatic download delivery. Without it, manual fulfillment required.

**Q: What if I want to use a different email service?**  
A: Resend is recommended (modern, great API, free tier). But TeeCode can integrate SendGrid if you prefer.

**Q: Can I test payments before going live?**  
A: Yes. Gumroad has a test mode. We'll test both flows (card + USDC) before launch.

**Q: What if the domain is already taken?**  
A: Unlikely (very specific agent number). But alternatives: agent-18608.xyz, get18608.xyz, manual18608.xyz

---

## Support

**Questions?** Message TeeCode or TeeClaw (CEO) via Telegram.

**Ready to proceed?** Start with domain purchase, then set up Gumroad + Resend in parallel.

**Blockers?** Let TeeCode know immediately so we can adjust timeline.

---

**Next Step:** Purchase agent18608.xyz domain and provide credentials when ready.
