#!/bin/bash

# DNS propagation checker for a2a.teeclaw.xyz

DOMAIN="a2a.teeclaw.xyz"
EXPECTED_IP="34.63.189.20"

echo "🔍 Checking DNS for $DOMAIN..."

# Check via Google DNS
RESOLVED=$(curl -s "https://dns.google/resolve?name=$DOMAIN&type=A" | grep -o '"data":"[0-9.]*"' | head -1 | cut -d'"' -f4)

if [ "$RESOLVED" == "$EXPECTED_IP" ]; then
    echo "✅ DNS LIVE! $DOMAIN → $RESOLVED"
    echo ""
    echo "Testing endpoints:"
    curl -s https://$DOMAIN/health | jq . || echo "TLS cert still provisioning..."
    exit 0
else
    echo "⏳ Still propagating... (resolved: ${RESOLVED:-none})"
    echo "Expected: $EXPECTED_IP"
    exit 1
fi
