# Agent Operations Manual - Launch Plan

**Product:** "How AI Agents Make Money On-Chain"
**Strategy:** Phased launch - PDF first (Week 1), HTML platform (Week 3-4)
**Pricing Model:** Option C (One-Time Premium)
- PDF: $39 one-time
- HTML Lifetime: $199 one-time
- HTML + Community: $399 one-time

**Created:** 2026-03-02
**Owner:** TeeClaw (CEO)
**Status:** Phase 1 in progress

---

## Phase 1: PDF Launch (THIS WEEK)

### Day 1 (Monday, Today) - Preparation

**Tasks:**

1. **PDF Finalization** (Owner: TeeDesign)
   - [ ] Review current PDF design (agent-ops-manual.pdf)
   - [ ] Add cover design (magazine-quality, DESIGN-SYSTEM.md compliant)
   - [ ] Add table of contents with page numbers
   - [ ] Design chapter dividers (7 parts)
   - [ ] Add footer with page numbers + branding
   - [ ] Final PDF generation (all 18 chapters)
   - **Deliverable:** agent-ops-manual-final.pdf
   - **Time:** 4-6 hours
   - **Blocker:** None

2. **Landing Page Copy** (Owner: TeeWriter)
   - [ ] Write sales page copy (teeclaw.xyz/manual)
   - [ ] Sections needed:
     - Hook: "The $2 That Changed Everything" angle
     - Problem: AI agents stuck in theory, not making money
     - Solution: 18-chapter practical guide
     - Social proof: Mr. Tee's credentials (ERC-8004 #18608, A2A live, etc.)
     - What's inside: 7 parts breakdown
     - Pricing: $39 one-time
     - Guarantee: "If you don't deploy at least one paid service in 60 days, full refund"
     - CTA: "Download Now" button
   - [ ] Run content-quality-auditor (mandatory)
   - **Deliverable:** landing-page-copy.md
   - **Time:** 2-3 hours
   - **Blocker:** None

3. **Landing Page Design** (Owner: TeeDesign)
   - [ ] Design landing page (Awwwards-level)
   - [ ] Sections:
     - Hero: Big headline + CTA + manual cover preview
     - What's inside: 7 parts grid with icons
     - Social proof: Testimonials section (placeholder for now)
     - Pricing: Clear $39 one-time, compare to Felix Craft $29
     - FAQ: Common questions
     - Footer: Links, contact
   - [ ] Mobile-responsive
   - [ ] Follow DESIGN-SYSTEM.md
   - **Deliverable:** HTML/CSS for landing page
   - **Time:** 6-8 hours
   - **Blocker:** Needs landing-page-copy.md from TeeWriter

4. **Payment Integration** (Owner: TeeCode)
   - [ ] Set up Stripe account (or use existing)
   - [ ] Create product: "Agent Operations Manual PDF" - $39
   - [ ] Payment flow:
     - User clicks "Download Now"
     - Stripe checkout (email + card)
     - Success → redirect to download page
     - Email receipt + download link
   - [ ] Alternative: Gumroad (faster setup, 10% fee)
   - [ ] Test payment flow (sandbox)
   - **Deliverable:** Working payment integration
   - **Time:** 3-4 hours
   - **Blocker:** None (can start in parallel)

5. **Download Delivery System** (Owner: TeeCode)
   - [ ] Secure download link generation (signed URLs, expire after 24h)
   - [ ] Email template: "Your Agent Operations Manual"
     - Thank you message
     - Download link (expires in 24h)
     - Support email
     - Announcement: "HTML version launching soon, you'll get first access"
   - [ ] Track downloads (analytics)
   - **Deliverable:** Automated delivery system
   - **Time:** 2-3 hours
   - **Blocker:** Needs payment integration

**End of Day 1:**
- ✅ PDF finalized
- ✅ Landing page copy written + audited
- ✅ Landing page design ready
- ✅ Payment integration working
- ✅ Download delivery automated

---

### Day 2 (Tuesday) - Launch

**Tasks:**

1. **Deploy Landing Page** (Owner: TeeCode)
   - [ ] Deploy to teeclaw.xyz/manual
   - [ ] SSL configured
   - [ ] Payment flow tested (production)
   - [ ] Download delivery tested
   - [ ] Analytics configured (track visitors, conversions)
   - **Time:** 1-2 hours

2. **Pre-Launch Checklist** (Owner: TeeClaw)
   - [ ] Final PDF review (download test)
   - [ ] Landing page QA (all links work, mobile responsive)
   - [ ] Payment test (real transaction, then refund)
   - [ ] Email delivery test
   - [ ] Support email ready (support@teeclaw.xyz or Telegram)
   - **Time:** 1 hour

3. **Launch Announcement** (Owner: TeeSocial)
   - [ ] X thread (@mr_crtee):
     - Tweet 1: Hook ("I just spent 3 weeks writing a manual AI agents will actually use")
     - Tweet 2: Problem (agents stuck in theory)
     - Tweet 3: Solution (18 chapters, real protocols)
     - Tweet 4: What's inside (7 parts breakdown)
     - Tweet 5: Social proof (my credentials)
     - Tweet 6: CTA (link to landing page)
   - [ ] Farcaster post (@mr-tee):
     - Similar structure, shorter
     - Cast + images (manual cover, chapter preview)
   - [ ] Agent communities:
     - Post in relevant Farcaster channels
     - Share on Molten Cast (agent broadcast)
     - Post on 4claw.org (if appropriate)
   - **Deliverable:** Social posts live + link to teeclaw.xyz/manual
   - **Time:** 2-3 hours
   - **Blocker:** Needs landing page deployed

4. **Monitor & Respond** (Owner: TeeClaw)
   - [ ] Watch analytics (traffic, conversion rate)
   - [ ] Respond to questions on X/Farcaster
   - [ ] Track first sales
   - [ ] Collect buyer emails (for HTML launch notification)
   - **Ongoing:** Throughout launch day

**End of Day 2:**
- ✅ Manual live at teeclaw.xyz/manual
- ✅ First sales coming in
- ✅ Social announcement posted
- ✅ Buyer emails collected

---

### Day 3-7 (Rest of Week 1) - Optimize & Collect Feedback

**Tasks:**

1. **Sales Monitoring** (Owner: TeeClaw)
   - [ ] Daily sales report (to owner in Topic 341)
   - [ ] Conversion rate tracking
   - [ ] Traffic sources analysis
   - [ ] Identify drop-off points

2. **Customer Support** (Owner: TeeClaw)
   - [ ] Respond to buyer questions
   - [ ] Handle download issues
   - [ ] Collect testimonials (ask for feedback)

3. **Marketing Iteration** (Owner: TeeSocial)
   - [ ] Daily social posts (not spammy, value-driven)
   - [ ] Engage with comments/replies
   - [ ] Share buyer testimonials (with permission)
   - [ ] Post in new communities if found

4. **Landing Page Optimization** (Owner: TeeDesign + TeeWriter)
   - [ ] A/B test headlines (if traffic is high enough)
   - [ ] Update copy based on objections seen
   - [ ] Add testimonials as they come in

**End of Week 1:**
- ✅ PDF launched and selling
- ✅ 10-50 sales (target depends on audience size)
- ✅ Buyer feedback collected
- ✅ Testimonials gathered
- ✅ Email list built (for HTML launch)

---

## Phase 2: HTML Platform Build (Week 2-3)

### Week 2 - Architecture & Core Features

**Owner:** TeeCode (CTO)

**Tasks:**

1. **Tech Stack Decision** (Day 1)
   - [ ] Framework: Next.js 14 (App Router)
   - [ ] Database: PostgreSQL (user accounts, purchases)
   - [ ] Auth: NextAuth.js or Clerk
   - [ ] Payment: Stripe (subscriptions + one-time)
   - [ ] Hosting: Vercel (easy deploy, good performance)
   - [ ] File structure designed

2. **Auth System** (Day 2-3)
   - [ ] User registration (email + password)
   - [ ] Login flow
   - [ ] Password reset
   - [ ] Email verification
   - [ ] Session management
   - **Deliverable:** Working auth system

3. **Payment Integration** (Day 4-5)
   - [ ] Stripe products:
     - HTML Lifetime: $199 one-time
     - HTML + Community: $399 one-time
   - [ ] Checkout flow
   - [ ] Purchase verification
   - [ ] Access granting (unlock chapters after payment)
   - [ ] Webhook handling (Stripe → database)
   - **Deliverable:** Payment flow working

4. **User Dashboard** (Day 6-7)
   - [ ] Login → Dashboard
   - [ ] Show purchased tier
   - [ ] Chapter navigation
   - [ ] Profile management
   - [ ] Download PDFs (if purchased PDF tier)
   - **Deliverable:** Basic dashboard

**End of Week 2:**
- ✅ Auth system working
- ✅ Payment integration functional
- ✅ User dashboard basic version
- ✅ Foundation ready for content

---

### Week 3 - Content & Design

**Owner:** TeeDesign (CDO) + TeeCode (CTO)

**Tasks:**

1. **Chapter Reader UI** (Day 1-3)
   - [ ] Convert markdown chapters to HTML (reuse markdown-it)
   - [ ] Reading interface:
     - Clean typography (DESIGN-SYSTEM.md)
     - Progress indicator
     - Next/previous chapter navigation
     - Table of contents sidebar
     - Mobile-responsive
   - [ ] Code syntax highlighting
   - [ ] Responsive images
   - **Deliverable:** Beautiful reading experience

2. **Chapter Gating Logic** (Day 4)
   - [ ] Check user's purchased tier
   - [ ] Show locked chapters with preview (first 2 paragraphs)
   - [ ] "Upgrade to unlock" CTA
   - [ ] All 18 chapters accessible to paid users
   - **Deliverable:** Gating working correctly

3. **Landing Page (HTML Version)** (Day 5-6)
   - [ ] New landing page for HTML tiers
   - [ ] Sections:
     - Hero: "Living manual that evolves with the ecosystem"
     - Compare: PDF vs HTML Lifetime vs HTML + Community (table)
     - Updates: Show what's been updated (timeline)
     - Social proof: PDF buyer testimonials
     - Pricing: $199 / $399 (with PDF upgrade path)
     - FAQ
   - [ ] Integrate with existing teeclaw.xyz
   - **Deliverable:** HTML landing page

4. **PDF Buyer Upgrade Flow** (Day 7)
   - [ ] Check if user bought PDF (email match)
   - [ ] Show upgrade offer: $160 to HTML Lifetime (instead of $199)
   - [ ] Apply discount automatically in Stripe
   - [ ] Email existing PDF buyers with upgrade offer
   - **Deliverable:** Upsell path working

**End of Week 3:**
- ✅ Chapter reading UI complete
- ✅ Gating logic working
- ✅ HTML landing page live
- ✅ PDF upgrade path functional
- ✅ Ready for beta testing

---

## Phase 3: HTML Launch (Week 4)

### Day 1-2 - Beta Testing

**Tasks:**

1. **Internal Testing** (Owner: All agents)
   - [ ] Each agent tests: signup, payment, chapter reading, navigation
   - [ ] Mobile testing (iOS, Android)
   - [ ] Browser testing (Chrome, Safari, Firefox)
   - [ ] Bug list created

2. **Bug Fixes** (Owner: TeeCode)
   - [ ] Fix critical bugs (blocking launch)
   - [ ] Defer minor bugs (post-launch fixes)

3. **Beta User Testing** (Owner: TeeClaw)
   - [ ] Invite 5-10 PDF buyers to beta test HTML
   - [ ] Give free access for feedback
   - [ ] Collect usability feedback
   - [ ] Iterate based on feedback

**End of Beta:**
- ✅ All critical bugs fixed
- ✅ User feedback incorporated
- ✅ Platform stable

---

### Day 3 - HTML Launch

**Tasks:**

1. **Final Pre-Launch** (Owner: TeeClaw)
   - [ ] QA checklist (same as PDF launch)
   - [ ] Payment test (production)
   - [ ] Analytics configured
   - [ ] Support ready

2. **Launch Announcement** (Owner: TeeSocial)
   - [ ] Email all PDF buyers:
     - Subject: "We built the HTML version you asked for"
     - Upgrade offer: $160 to HTML Lifetime
     - Early supporter bonus: First 50 get community tier for $299 (save $100)
     - CTA: Upgrade now
   - [ ] X thread (@mr_crtee):
     - Announce HTML launch
     - Show what's new (always updated, interactive)
     - Pricing: $199 / $399
     - PDF buyers get discount
     - CTA: Link to teeclaw.xyz/manual
   - [ ] Farcaster announcement
   - [ ] Agent communities

3. **Monitor & Support** (Owner: TeeClaw)
   - [ ] Watch conversions (PDF → HTML upgrades)
   - [ ] Monitor new HTML purchases
   - [ ] Respond to questions
   - [ ] Handle technical issues

**End of Day 3:**
- ✅ HTML platform live
- ✅ PDF buyers notified
- ✅ First upgrades/purchases coming in

---

### Day 4-7 - Optimization & Community Setup

**Tasks:**

1. **Community Setup** (Owner: TeeSocial)
   - [ ] Create private Telegram group for HTML + Community tier
   - [ ] Welcome message + rules
   - [ ] Onboard first members
   - [ ] Weekly updates plan (every Monday)

2. **Marketing Push** (Owner: TeeMarketing)
   - [ ] Case studies: Feature successful PDF buyers
   - [ ] Comparison content: Why HTML > PDF for serious agents
   - [ ] Partner with other agent builders (cross-promotion)

3. **Content Updates** (Owner: TeeWriter)
   - [ ] First update to HTML version:
     - New section on recent ERC-8004 developments
     - Proof that HTML stays current
     - Announce update to users
   - [ ] Monthly update schedule planned

**End of Week 4:**
- ✅ HTML platform launched and stable
- ✅ PDF buyers upgrading
- ✅ New HTML purchases
- ✅ Community active (tier 2)
- ✅ First content update shipped

---

## Success Metrics

### Week 1 (PDF Launch)
- **Sales:** 10-50 PDFs sold
- **Revenue:** $390-$1,950
- **Conversion:** 2-5% (landing page visitors → buyers)
- **Email list:** 10-50 buyers for HTML launch

### Week 4 (HTML Launch)
- **Upgrades:** 20-40% of PDF buyers upgrade to HTML
- **New sales:** 5-20 HTML purchases (no prior PDF)
- **Revenue:** $1,000-$5,000 additional
- **Community:** 5-15 members (tier 2)

### Month 2+
- **Total customers:** 50-100
- **Revenue split:** 30% PDF, 50% HTML Lifetime, 20% HTML + Community
- **LTV per customer:** $150-$250 average
- **Updates:** 1 content update per month
- **Community growth:** 20-50 active members

---

## Risk Management

### What If PDF Doesn't Sell?

**Signal:** < 5 sales in first 3 days

**Action:**
1. Review landing page (ask TeeWriter for copy improvements)
2. Lower price to $29 (match Felix Craft)
3. Offer launch discount: "First 50 buyers: $29 (reg. $39)"
4. Increase marketing push (more social posts, communities)
5. If still no traction: Pivot to free + upsell model

### What If HTML Takes Longer?

**Signal:** Week 3 and platform not ready

**Action:**
1. Delay HTML launch (communication to PDF buyers: "Taking extra time for quality")
2. Continue PDF sales (revenue keeps coming)
3. Adjust scope: Ship HTML Lifetime only, defer Community tier to v2
4. No penalty (PDF revenue buys us time)

### What If Competitors Copy?

**Signal:** Someone launches similar manual

**Action:**
1. Differentiate: Our manual is BY an agent, FOR agents (not human → agent)
2. Social proof: Mr. Tee's live ERC-8004 registration, A2A endpoint, etc.
3. Speed: We have real-world experience, not theory
4. Community: Our network of agent builders is unique

---

## Post-Launch Operations (Ongoing)

### Monthly (Owner: TeeWriter + TeeCode)
- [ ] Content update (new chapter section, protocol updates, bug fixes)
- [ ] Announce update to HTML users
- [ ] Community recap (monthly state of agent economy)

### Weekly (Owner: TeeSocial)
- [ ] Community engagement (post discussion topics, answer questions)
- [ ] Social proof updates (share buyer wins)
- [ ] New testimonials collected

### Daily (Owner: TeeClaw)
- [ ] Sales monitoring (included in 7am report)
- [ ] Customer support (respond to questions)
- [ ] Feedback collection

---

## Resources Needed

### Team Allocation

**Week 1 (PDF Launch):**
- TeeDesign: PDF finalization + landing page design (1 day full-time)
- TeeWriter: Landing page copy (half day)
- TeeCode: Payment + delivery system (1 day)
- TeeSocial: Launch announcement + marketing (ongoing)
- TeeClaw: Coordination + QA (ongoing)

**Week 2-3 (HTML Build):**
- TeeCode: Full-time (architecture, auth, payment, dashboard)
- TeeDesign: 2-3 days (reading UI, landing page)
- TeeWriter: 1 day (landing page copy, update first chapter)
- TeeClaw: Coordination + testing (ongoing)

**Week 4 (HTML Launch):**
- TeeSocial: Full-time (launch, emails, marketing)
- TeeCode: On-call (bug fixes, support)
- TeeClaw: Monitoring + support
- TeeMarketing: Campaign push (case studies, partnerships)

### Budget

**Costs:**
- Domain: $10/year (teeclaw.xyz already owned)
- Hosting: $20/month (Vercel Pro)
- Database: $25/month (PostgreSQL on Railway or Supabase)
- Stripe fees: 2.9% + $0.30 per transaction
- Email service: $15/month (SendGrid or Postmark)
- **Total monthly:** ~$60
- **Break-even:** 2 PDF sales or 1 HTML sale per month

**Revenue Projection (Conservative):**
- Month 1: $1,500 (50 PDFs)
- Month 2: $3,000 (20 PDFs + 10 HTML)
- Month 3: $2,500 (10 PDFs + 8 HTML)
- **Total Q1:** $7,000
- **Profit after costs:** ~$6,820

---

## Dependencies & Blockers

**Current blockers:** None (all systems ready)

**External dependencies:**
- Stripe approval (usually instant)
- Domain DNS (already configured)
- Vercel deployment (instant)

**Internal dependencies:**
- PDF design polish (TeeDesign)
- Landing page copy (TeeWriter)
- Payment integration (TeeCode)
- All can work in parallel (no blocking dependencies)

---

## Approval Required

**Owner (0xd) approval needed for:**
- [ ] Final PDF design (review before launch)
- [ ] Landing page copy (review before deploy)
- [ ] Pricing confirmation: $39 PDF, $199 / $399 HTML
- [ ] Launch timing: Tuesday this week?

**CEO (TeeClaw) auto-approve:**
- Tech stack decisions (within budget)
- Marketing tactics (social posts, communities)
- Daily operations (support, monitoring)

---

## Next Immediate Actions (Today)

1. **Get owner approval:** Review this plan, approve to proceed
2. **Assign tasks:** TeeClaw assigns to departments via sessions_send
3. **Start PDF finalization:** TeeDesign begins cover design
4. **Start landing page copy:** TeeWriter begins sales copy
5. **Start payment setup:** TeeCode sets up Stripe

**Timeline starts:** Upon owner approval
**Day 1 target:** All tasks completed by EOD today
**Launch target:** Tomorrow (Tuesday) if all goes well

---

## Questions for Owner

1. **Launch timing:** Ship PDF tomorrow (Tuesday), or wait for your final review?
2. **Pricing:** Confirm $39 PDF, $199 / $399 HTML?
3. **Payment platform:** Stripe or Gumroad? (Stripe = more control, Gumroad = faster setup)
4. **Guarantee:** Offer 60-day money-back guarantee or not?
5. **Community platform:** Telegram or Discord for HTML + Community tier?

**Reply with approvals and I'll start executing immediately.** 🚀
