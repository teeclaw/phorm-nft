# 🚀 $DRAEVEN Launch Checklist

## Pre-Launch Tasks

### 1. Content Updates (REQUIRED)
- [ ] Replace contract address in `index.html` (line ~370)
  - Current: `"Coming Soon — TBA"`
  - Update to actual contract address
- [ ] Add buy button link (line ~374)
  - Current: `href="#"`
  - Update to Uniswap/DEX swap URL
- [ ] Add chart link (line ~375)
  - Current: `href="#"`
  - Update to DexScreener/DexTools chart
- [ ] Add X (Twitter) link (line ~379)
  - Current: `href="#"`
  - Update to actual Twitter profile
- [ ] Add Telegram link (line ~387)
  - Current: `href="#"`
  - Update to actual Telegram group

### 2. Meta Tags & SEO
- [ ] Add OG image
  - Create 1200x630px image featuring one or all characters
  - Upload to `/images/og-image.jpg`
  - Update meta tag in `<head>` (line ~16)
- [ ] Update OG URL to actual domain (line ~17)
- [ ] Verify meta description and keywords

### 3. Favicon
- [ ] Replace placeholder emoji favicon (line ~37)
  - Create proper favicon.ico + SVG
  - Add to root directory
  - Update favicon links in `<head>`

### 4. Testing

#### Browser Testing
- [ ] Desktop Chrome (latest)
- [ ] Desktop Firefox (latest)
- [ ] Desktop Safari (latest)
- [ ] iPhone Safari (iOS 15+)
- [ ] Android Chrome (latest)

#### Functionality Testing
- [ ] All navigation links work
- [ ] Smooth scrolling works
- [ ] Mobile menu opens/closes
- [ ] Character card hover effects work
- [ ] Buy button redirects correctly
- [ ] Social links open in new tabs
- [ ] Contract address copy works (click to copy)

#### Accessibility Testing
- [ ] Tab through all interactive elements
- [ ] Screen reader test (basic)
- [ ] Test with animations disabled (`prefers-reduced-motion`)
  - In Chrome DevTools > Rendering > Emulate CSS prefers-reduced-motion
- [ ] Validate HTML: https://validator.w3.org/
- [ ] Check contrast ratios (WCAG AA)

#### Performance Testing
- [ ] Run Lighthouse audit (aim ≥95)
  - Performance ≥95
  - Accessibility 100
  - Best Practices ≥95
  - SEO ≥95
- [ ] Test on slow 3G connection
- [ ] Verify LCP < 2.5s
- [ ] Check CLS < 0.1
- [ ] Confirm page weight < 500KB (excl CDN)

### 5. Server Configuration

#### GCP VM Setup
- [ ] Upload files to `/var/www/mrcrt.xyz/`
- [ ] Set correct permissions: `chmod 644` files, `chmod 755` directories
- [ ] Verify image permissions: `chmod 644 images/*.jpg`

#### Nginx Configuration
Add to nginx config:
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name mrcrt.xyz www.mrcrt.xyz;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name mrcrt.xyz www.mrcrt.xyz;
    
    root /var/www/mrcrt.xyz;
    index index.html;
    
    # SSL (via Certbot/Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/mrcrt.xyz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mrcrt.xyz/privkey.pem;
    
    # Compression
    gzip on;
    gzip_vary on;
    gzip_types text/css application/javascript image/svg+xml;
    gzip_min_length 1024;
    
    # Cache headers
    location ~* \.(jpg|jpeg|png|webp|svg|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location ~* \.(css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
```

- [ ] Test nginx config: `sudo nginx -t`
- [ ] Reload nginx: `sudo systemctl reload nginx`
- [ ] Verify HTTPS works
- [ ] Test compression: `curl -H "Accept-Encoding: gzip" -I https://mrcrt.xyz`

### 6. DNS & Domain
- [ ] Point mrcrt.xyz A record to GCP VM IP
- [ ] Verify DNS propagation: `dig mrcrt.xyz`
- [ ] SSL certificate via Let's Encrypt: `sudo certbot --nginx -d mrcrt.xyz -d www.mrcrt.xyz`

### 7. Final Checks
- [ ] No console errors
- [ ] All images load
- [ ] Animations smooth at 60fps
- [ ] Mobile responsive (test all breakpoints)
- [ ] Copy to clipboard works
- [ ] Forms work (if any)

---

## Post-Launch

### Monitoring
- [ ] Set up Uptime Robot or similar
- [ ] Monitor Google Search Console
- [ ] Track Lighthouse scores weekly

### Social Proof
- [ ] Share on X
- [ ] Pin to Telegram
- [ ] Submit to Awwwards (if quality warrants)

### Analytics (Optional)
- [ ] Add Plausible/Fathom (privacy-friendly)
- [ ] Track buy button clicks
- [ ] Monitor contract address copies

---

## Quick Deploy Commands

```bash
# Upload to GCP VM
cd /home/phan_harry/.openclaw/workspace/draeven-site
rsync -avz --exclude='.git' --exclude='README.md' --exclude='LAUNCH.md' \
  . user@vm-ip:/var/www/mrcrt.xyz/

# On VM: Set permissions
cd /var/www/mrcrt.xyz
find . -type d -exec chmod 755 {} \;
find . -type f -exec chmod 644 {} \;

# Test and reload nginx
sudo nginx -t && sudo systemctl reload nginx
```

---

## Rollback Plan

If critical issues found post-launch:
1. Keep a backup of current index.html
2. Revert nginx to previous config
3. Fix locally, re-test, re-deploy

---

**Target Go-Live:** When contract is deployed + all checkboxes complete

Built with 🖤 for the apocalypse.
