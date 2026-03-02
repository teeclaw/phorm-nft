# Landing Page Setup Guide

## Required Services

### 1. Gumroad (Payment - Fiat)

**Sign up:** https://gumroad.com

**Steps:**
1. Create account or log in
2. Click "Create Product"
3. Fill in:
   - Name: "Agent Operations Manual"
   - Price: $39
   - Type: Digital product
   - Upload: Current PDF (temporary, will replace)
4. Save product
5. Get credentials:
   - **Product ID:** Found in URL after creation
   - **Permalink:** `your-username.gumroad.com/l/product-slug`
   - **Webhook Secret:** Settings → Advanced → Webhook → Copy secret
   - **API Key:** Settings → Account → Applications → Create application → Copy key

**Webhook URL:** `https://teeclaw.xyz/api/payments/gumroad/webhook`

---

### 2. Resend (Email Service)

**Sign up:** https://resend.com

**Steps:**
1. Create account (free tier: 100 emails/day)
2. Verify domain: teeclaw.xyz
   - Add DNS records (they'll provide TXT, MX, CNAME)
   - Wait for verification (~5 minutes)
3. Create API key:
   - Dashboard → API Keys → Create
   - Copy key (starts with `re_`)

**From Email:** `manual@teeclaw.xyz` (after domain verification)

---

### 3. x402 (Payment - USDC)

**Already configured:**
- Wallet: 0x1Af5f519DC738aC0f3B58B19A4bB8A8441937e78 (KMS)
- USDC Contract: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 (Base)
- Amount: $39 in USDC (~39 USDC at 1:1)
- Infrastructure: `workspace/x402/` (existing)

**No setup needed** (already built and tested)

---

## Environment Variables

Add these to `.env.local`:

```bash
# Gumroad (get from steps above)
GUMROAD_PRODUCT_ID=your_product_id
GUMROAD_PERMALINK=username.gumroad.com/l/product-slug
GUMROAD_WEBHOOK_SECRET=your_webhook_secret
GUMROAD_API_KEY=your_api_key

# Resend (get from steps above)
RESEND_API_KEY=re_your_api_key

# x402 (already configured)
X402_WALLET_ADDRESS=0x1Af5f519DC738aC0f3B58B19A4bB8A8441937e78
X402_PAYMENT_AMOUNT_USD=39
X402_USDC_CONTRACT=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

# PDF Delivery
PDF_DOWNLOAD_SECRET=$(openssl rand -hex 32)
DOWNLOAD_URL_EXPIRY_HOURS=24

# App Config
NEXT_PUBLIC_APP_URL=https://teeclaw.xyz
NEXT_PUBLIC_MANUAL_PRICE_USD=39
NEXT_PUBLIC_MANUAL_PRICE_USDC=39
```

---

## DNS Records (for Resend)

After signing up for Resend, add these to your teeclaw.xyz DNS:

**They will provide exact values, but format is:**

```
Type: TXT
Name: _resend
Value: (Resend will provide)

Type: MX
Name: teeclaw.xyz
Value: feedback-smtp.resend.com
Priority: 10

Type: CNAME
Name: resend._domainkey
Value: (Resend will provide)
```

---

## Testing

### Test Gumroad Webhook
```bash
curl -X POST https://teeclaw.xyz/api/payments/gumroad/webhook \
  -H "Content-Type: application/json" \
  -d '{"sale_id":"test_123","product_id":"your_product_id","email":"test@example.com"}'
```

### Test Resend Email
```bash
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "manual@teeclaw.xyz",
    "to": "your-email@example.com",
    "subject": "Test Email",
    "html": "<p>Test</p>"
  }'
```

### Test x402 Payment
```bash
# Already working, tested 2026-02-17
# Test transaction: $2 USDC via Treasure (onchain.fi)
```

---

## Deployment

### Vercel (Recommended)

1. Connect GitHub repo
2. Add environment variables (Settings → Environment Variables)
3. Deploy
4. Add custom domain: teeclaw.xyz/manual
5. Configure DNS:
   ```
   CNAME manual.teeclaw.xyz → cname.vercel-dns.com
   ```

### Manual Deploy

```bash
cd workspace/landing-manual
npm run build
npm run start
```

---

## Post-Deploy Checklist

- [ ] Gumroad product created
- [ ] Gumroad webhook configured
- [ ] Resend domain verified
- [ ] Resend API key added
- [ ] x402 payment tested
- [ ] Environment variables set
- [ ] Landing page deployed
- [ ] Custom domain configured
- [ ] Test purchase (Gumroad)
- [ ] Test purchase (x402)
- [ ] Email delivery working
- [ ] PDF download working
- [ ] Analytics configured (optional)

---

## Support

**For issues:**
- Landing page code: TeeCode
- Payment integration: TeeCode
- PDF delivery: TeeCode
- Copy/content: TeeWriter
- Design: TeeDesign

**Owner:** 0xd (you)
