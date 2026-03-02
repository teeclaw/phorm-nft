# Agent Operations Manual - Landing Page

Next.js landing page for the Agent Operations Manual with dual payment options (Gumroad + x402).

## Features

- **Awwwards-level Design**: Modern, minimalist, high-performance
- **Dual Payment Options**: 
  - Gumroad (credit card)
  - x402 (USDC on Base)
- **GSAP Animations**: Smooth scroll triggers and page transitions
- **Responsive**: Mobile-first design
- **Accessible**: WCAG 2.1 AA compliant
- **Fast**: Lighthouse score target 95+

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- GSAP 3.x
- Google Fonts (Space Grotesk + Inter)

## Project Structure

```
landing-manual/
├── app/
│   ├── api/
│   │   ├── gumroad/webhook/       # Gumroad webhook handler
│   │   ├── x402/
│   │   │   ├── initiate/          # x402 payment initiation
│   │   │   └── verify/            # x402 payment verification
│   │   └── download/
│   │       ├── generate/          # Signed URL generation
│   │       └── file/              # PDF file serving
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Landing page
│   └── globals.css                # Global styles
├── public/
│   └── agent-operations-manual.pdf  # PDF file (from TeeDesign)
└── README.md
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   npm run start
   ```

## Payment Integration

### Gumroad Setup

1. Create product on Gumroad ($39)
2. Configure webhook URL: `https://agent18608.xyz/api/payments/gumroad/webhook`
3. Add product ID to `.env.local`

### x402 Setup

1. Configure wallet address in `.env.local`
2. Test payment flow on Base testnet
3. Verify transaction verification works
4. Deploy to production

## Download Delivery

1. PDF file should be placed in `public/agent-operations-manual.pdf`
2. Signed URLs expire after 24 hours
3. Downloads are logged for analytics

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Custom Server

1. Build: `npm run build`
2. Start: `npm run start`
3. Configure Nginx/Caddy reverse proxy
4. Set up SSL certificate

## TODO

- [ ] Add email delivery (SendGrid integration)
- [ ] Add analytics tracking
- [ ] Add database for purchase records
- [ ] Implement x402 transaction verification
- [ ] Add payment success/failure pages
- [ ] Add 60-day refund policy
- [ ] Test end-to-end payment flows
- [ ] Add Lighthouse CI
- [ ] Add tests (Playwright)

## Design System

Follows `DESIGN-SYSTEM.md`:
- 8px grid system
- Space Grotesk (display) + Inter (body)
- Black background (#000) with white text
- Smooth GSAP animations
- Mobile-responsive
- Accessible focus states
- Performance optimized

## Performance Targets

- Lighthouse Score: ≥95
- LCP: <2.5s
- INP: <200ms
- CLS: <0.1
- Page Weight: <500KB

## License

© 2026 Mr. Tee. All rights reserved.
