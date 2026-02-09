# A2A Endpoint Deployment Guide

## Current Status

✅ A2A server created and tested locally
✅ Endpoints working: /health, /agent, /a2a
✅ Message logging implemented
✅ Systemd service file ready

## Next Steps to Go Public

### 1. Install as systemd service

```bash
chmod +x setup.sh
./setup.sh
```

This will:
- Install the systemd service
- Start the A2A endpoint
- Enable auto-start on boot

### 2. Set up reverse proxy

You need a reverse proxy (nginx or caddy) to:
- Add TLS/HTTPS
- Map a public domain/subdomain
- Handle SSL certificates

**Option A: nginx** (if you have one)
```nginx
server {
    listen 443 ssl http2;
    server_name a2a.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3100;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Option B: caddy** (simpler, auto TLS)
```
a2a.yourdomain.com {
    reverse_proxy localhost:3100
}
```

### 3. Firewall configuration

Allow external access to proxy port:
```bash
sudo ufw allow 443/tcp
sudo ufw allow 80/tcp  # for cert renewal
```

### 4. DNS configuration

Point a subdomain to your VPS IP:
```
a2a.yourdomain.com  →  YOUR_VPS_IP
```

### 5. Test public endpoint

```bash
curl https://a2a.yourdomain.com/health
curl https://a2a.yourdomain.com/agent
```

### 6. Register in ERC-8004

Add the public URL to your ERC-8004 registration:
- A2A Endpoint: `https://a2a.yourdomain.com/a2a`

## Security Considerations

**Current MVP limitations:**
- No authentication (any agent can send messages)
- No rate limiting
- No signature verification

**Production hardening (future):**
- Add API key authentication
- Implement rate limiting
- Verify sender signatures (ERC-8004 identity)
- Add request validation middleware
- Set up monitoring/alerts

## Monitoring

Check service status:
```bash
sudo systemctl status mr-tee-a2a
sudo journalctl -u mr-tee-a2a -f
```

View logs:
```bash
tail -f ~/. openclaw/workspace/a2a-endpoint/logs/*.jsonl
```

## Maintenance

Restart service:
```bash
sudo systemctl restart mr-tee-a2a
```

Update code:
```bash
cd ~/.openclaw/workspace/a2a-endpoint
# make changes
sudo systemctl restart mr-tee-a2a
```

---

📺 Questions? Check the service is running: `systemctl status mr-tee-a2a`
