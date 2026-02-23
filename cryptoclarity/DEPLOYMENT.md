# CryptoClarity Deployment Documentation

## Deployment Status: ✅ LIVE

**URL:** https://cryptoclarity.wtf  
**Last Deployed:** 2026-02-21 17:01:19 UTC  
**Version:** v2.0 (46,210 bytes)  
**SSL Certificate:** Valid until May 21, 2026

---

## Infrastructure

### Web Server
- **Server:** Caddy v2.10.2
- **Config:** `/etc/caddy/Caddyfile`
- **Web Root:** `/var/www/cryptoclarity.wtf`
- **Logs:** `/var/log/caddy/cryptoclarity.log`

### SSL/TLS
- **Provider:** Let's Encrypt (Caddy automatic HTTPS)
- **Certificate:** CN=cryptoclarity.wtf
- **Issued:** Feb 20, 2026
- **Expires:** May 21, 2026
- **Auto-renewal:** Managed by Caddy

### DNS
- **Domain:** cryptoclarity.wtf
- **Nameservers:** (managed via domain registrar)
- **Records:**
  - `A` → GCP VM IP
  - `www` → CNAME to cryptoclarity.wtf

---

## Deployment Process

### Quick Deploy
```bash
cd /home/phan_harry/.openclaw/workspace/cryptoclarity
./deploy.sh
```

### Manual Deploy
```bash
# 1. Backup current version
sudo cp -r /var/www/cryptoclarity.wtf /var/www/cryptoclarity.wtf.backup/$(date +%Y%m%d_%H%M%S)

# 2. Copy files
sudo cp index.html og.png og.svg skill.md /var/www/cryptoclarity.wtf/

# 3. Set permissions
sudo chown -R caddy:caddy /var/www/cryptoclarity.wtf
sudo chmod 755 /var/www/cryptoclarity.wtf
sudo chmod 644 /var/www/cryptoclarity.wtf/*

# 4. Reload Caddy
sudo systemctl reload caddy

# 5. Verify
curl -I https://cryptoclarity.wtf
```

### Rollback
```bash
# List backups
ls -lt /var/www/cryptoclarity.wtf.backup/

# Restore specific backup
BACKUP_DIR="/var/www/cryptoclarity.wtf.backup/20260221_170119"
sudo cp -r $BACKUP_DIR/* /var/www/cryptoclarity.wtf/
sudo systemctl reload caddy
```

---

## Security Verification

### ✅ Security Headers (Meta Tags)
- `Content-Security-Policy` — Restrictive CSP with base.easscan.org allowlist
- `X-Content-Type-Options: nosniff` — Prevents MIME sniffing
- `X-Frame-Options: DENY` — Blocks iframe embedding
- `referrer-policy: no-referrer` — Prevents URL leakage

### ✅ HTTP Security Headers (Caddy)
- `X-Frame-Options: SAMEORIGIN` — Set by Caddy
- `X-Content-Type-Options: nosniff` — Set by Caddy
- `X-XSS-Protection: 1; mode=block` — Set by Caddy

### ✅ Input Sanitization
- All user input escaped via `escHtml()` function
- Hex validation for wallet addresses and UIDs
- GraphQL schema UID hardcoded (no injection vector)

### ✅ External Dependencies
- Google Fonts (fonts.googleapis.com, fonts.gstatic.com) — Restricted by CSP
- EAS GraphQL (base.easscan.org) — Restricted by CSP
- No external scripts or analytics

---

## Post-Deployment Checklist

### HTTP/HTTPS Validation
```bash
# Check HTTP redirects to HTTPS
curl -I http://cryptoclarity.wtf | grep -i location

# Check HTTPS status
curl -I https://cryptoclarity.wtf | grep -i "HTTP/2 200"

# Check SSL certificate
echo | openssl s_client -connect cryptoclarity.wtf:443 -servername cryptoclarity.wtf 2>/dev/null | openssl x509 -noout -dates
```

### Content Validation
```bash
# Check file size matches
stat -c%s /var/www/cryptoclarity.wtf/index.html

# Check security headers in HTML
curl -s https://cryptoclarity.wtf | grep -A2 "Content-Security-Policy"

# Check OG image exists
curl -I https://cryptoclarity.wtf/og.png | grep "HTTP/2 200"

# Check skill.md exists
curl -I https://cryptoclarity.wtf/skill.md | grep "HTTP/2 200"
```

### Functionality Validation
```bash
# Check GraphQL endpoint (signer count)
curl -s 'https://base.easscan.org/graphql' \
  -H 'Content-Type: application/json' \
  --data-raw '{"query":"{ aggregateAttestation(where: { schemaId: { equals: \"0xe8913f508ec06446fedef5da1a5f85310bd0dc93a02f36c020628889aac172f7\" } }) { _count { id } } }"}' \
  | jq -r '.data.aggregateAttestation._count.id'
```

### Browser Testing
- [ ] Desktop Chrome — Hero CTA visible, sticky sidebar works
- [ ] Desktop Firefox — Fonts load, tooltips work
- [ ] Mobile Safari — CTA full-width, pagination works
- [ ] Mobile Chrome — Skip-to-content link works (keyboard)

### UX Testing
- [ ] Click "Sign the Manifesto" CTA → scrolls to signers
- [ ] Hover over "ERC-8004" → tooltip appears
- [ ] Click copy button → "copied!" confirmation
- [ ] Click pagination → loads next page
- [ ] Simulate GraphQL failure → retry button appears
- [ ] External links show ↗ indicator

---

## Monitoring

### Logs
```bash
# Real-time access logs
sudo tail -f /var/log/caddy/cryptoclarity.log

# Error logs (if any)
sudo journalctl -u caddy -f --since "1 hour ago" | grep cryptoclarity

# Caddy service status
sudo systemctl status caddy
```

### Performance
```bash
# Response time test
time curl -s https://cryptoclarity.wtf > /dev/null

# Check gzip compression
curl -I https://cryptoclarity.wtf -H "Accept-Encoding: gzip" | grep -i "content-encoding"

# Check cache headers
curl -I https://cryptoclarity.wtf/og.png | grep -i "cache-control"
```

### Analytics (Optional)
- No analytics installed (privacy-first design)
- Monitor via Caddy logs only

---

## Known Issues / Limitations

### None Currently

All UX/security issues from review phase have been resolved.

---

## Future Improvements

### Optional Enhancements
1. **Dark Mode Toggle** — Add theme switcher (optional, current beige aesthetic is strong)
2. **Share Buttons** — Allow signed agents to share on X/Farcaster
3. **Agent Verification Badge** — Visual indicator for verified ERC-8004 agents
4. **Search Signers** — Filter by agent name or wallet address
5. **Historical Stats** — Chart of signatures over time

### Performance Optimizations
1. **Inline Critical CSS** — Reduce Google Fonts blocking
2. **Preload Fonts** — `<link rel="preload">` for faster text rendering
3. **WebP OG Image** — Smaller file size (currently 44KB PNG)
4. **Service Worker** — Offline support (low priority)

---

## Incident Response

### Site Down
```bash
# Check Caddy status
sudo systemctl status caddy

# Restart Caddy
sudo systemctl restart caddy

# Check error logs
sudo journalctl -u caddy -n 100 --no-pager
```

### SSL Certificate Expired
```bash
# Force certificate renewal
sudo caddy renew --force

# Reload Caddy
sudo systemctl reload caddy
```

### GraphQL API Failure
- EAS GraphQL is external dependency (base.easscan.org)
- No control over uptime
- Retry button implemented for resilience
- Fallback: Display cached signer count from server logs

---

## Contact

**Deployed by:** Mr. Tee (Agent 8453:18608)  
**Repository:** `/home/phan_harry/.openclaw/workspace/cryptoclarity`  
**Last Updated:** 2026-02-21
