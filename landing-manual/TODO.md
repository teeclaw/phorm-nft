# TODO: Agent Operations Manual Landing Page

## Day 2-3: Email + Transaction Verification

### Email Delivery
- [ ] Install and configure SendGrid
- [ ] Create email template for download link
- [ ] Test email delivery
- [ ] Add email to Gumroad webhook handler
- [ ] Add email to x402 payment flow

### x402 Transaction Verification
- [ ] Install viem
- [ ] Configure Base RPC endpoint
- [ ] Implement transaction verification:
  - [ ] Check transaction exists
  - [ ] Verify recipient address
  - [ ] Verify amount (39 USDC)
  - [ ] Check confirmation status
- [ ] Test on Base testnet first
- [ ] Test on Base mainnet

### Purchase Tracking
- [ ] Decide on database (SQLite/PostgreSQL/Redis)
- [ ] Create purchase schema:
  - sessionId
  - email
  - wallet address (for x402)
  - amount
  - payment method
  - status (pending/confirmed/failed)
  - download URL
  - created_at
  - updated_at
- [ ] Implement purchase logging
- [ ] Add purchase lookup API

## Day 4-5: Success Pages + Testing

### Payment Flow Pages
- [ ] Create `/success` page (payment confirmed)
- [ ] Create `/download` page (with email input for link resend)
- [ ] Create `/failed` page (payment failed)
- [ ] Update CTAs to redirect to appropriate pages

### End-to-End Testing
- [ ] Test Gumroad flow (sandbox mode)
- [ ] Test x402 flow (testnet)
- [ ] Test download URL generation
- [ ] Test download URL expiration
- [ ] Test email delivery
- [ ] Test purchase tracking
- [ ] Test refund flow (manual for now)

### Analytics
- [ ] Add Google Analytics or Plausible
- [ ] Track button clicks
- [ ] Track payment method selection
- [ ] Track downloads
- [ ] Track conversion rate

## Day 6-7: Deploy + QA

### Pre-Deployment
- [ ] Run Lighthouse audit (target: 95+)
- [ ] Test on real mobile devices
- [ ] Test accessibility (screen reader)
- [ ] Verify all links work
- [ ] Check meta tags and OG image
- [ ] Test in different browsers
- [ ] Spell check all copy

### Deployment
- [ ] Set up Vercel project
- [ ] Add environment variables
- [ ] Configure custom domain (agent18608.xyz)
- [ ] DNS configuration: CNAME @ → cname.vercel-dns.com
- [ ] SSL certificate (automatic via Vercel)
- [ ] Compression (automatic via Vercel)
- [ ] Cache headers
- [ ] Test production build

### Post-Deployment
- [ ] Monitor error logs
- [ ] Test payment flows in production
- [ ] Verify email delivery in production
- [ ] Check analytics tracking
- [ ] Monitor performance metrics

## Nice-to-Have (Post-Launch)

- [ ] Add Playwright tests
- [ ] Set up monitoring (Sentry)
- [ ] Add refund request form
- [ ] Add purchase lookup (by email)
- [ ] Add testimonials section
- [ ] Add social proof (purchase counter)
- [ ] Add discount codes
- [ ] Add affiliate tracking
- [ ] Create admin dashboard
- [ ] Add webhook retry logic
- [ ] Add purchase receipts
- [ ] Add license key generation (for HTML version)

## Dependencies

- **From TeeDesign:** PDF file (`agent-operations-manual.pdf`)
- **From TeeWriter:** ✅ Final landing page copy (COMPLETE)
- **From Owner (0xd):** 
  - Domain purchase: agent18608.xyz
  - Gumroad product setup + credentials
  - Email service credentials (Resend)
  - DNS configuration (Vercel + Resend)
  - Payment wallet confirmation

## Current Status

✅ Day 1 Complete:
- Landing page UI
- Payment API routes
- Download infrastructure

⏳ Next: Email + transaction verification
