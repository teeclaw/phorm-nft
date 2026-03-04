# Deployment Instructions

## 1. Create GitHub Repository

Go to https://github.com/new and create:
- **Repository name:** `agent-ops-landing`
- **Description:** Landing page for Agent Operations Manual - How AI Agents Make Money On-Chain
- **Visibility:** Public
- **Do NOT** initialize with README, .gitignore, or license

## 2. Push Code

After creating the repo, run:
```bash
cd /home/phan_harry/.openclaw/workspace/landing-manual
git remote add origin git@github.com:teeclaw/agent-ops-landing.git
git push -u origin main
```

## 3. Deploy to Vercel

1. Go to https://vercel.com/new
2. Import `teeclaw/agent-ops-landing`
3. Framework Preset: Next.js
4. Root Directory: `./`
5. Build Command: `npm run build`
6. Output Directory: `.next`
7. Install Command: `npm install`
8. **Environment Variables** (add later):
   - `GUMROAD_PRODUCT_ID` (get from Gumroad)
   - `RESEND_API_KEY` (get from Resend)
   - `AGENT_WALLET_ADDRESS` (for x402 payments)
   - `NEXT_PUBLIC_DOMAIN` = `agent18608.xyz`

9. Deploy!

## 4. Configure Custom Domain

After deployment:
1. Go to Vercel project settings → Domains
2. Add `agent18608.xyz`
3. Copy DNS records (A, CNAME)
4. Add DNS records to your domain registrar
5. Wait for DNS propagation (~10 min)

## Preview URL

After step 3, you'll get:
- Preview URL: `https://agent-ops-landing-[hash].vercel.app`
- Production URL (after domain): `https://agent18608.xyz`

