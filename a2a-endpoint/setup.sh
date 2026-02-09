#!/bin/bash

# Mr. Tee A2A Endpoint Setup Script

set -e

echo "📺 Setting up Mr. Tee A2A Endpoint..."

# Install systemd service
echo "→ Installing systemd service..."
sudo cp mr-tee-a2a.service /etc/systemd/system/
sudo systemctl daemon-reload

echo "→ Starting service..."
sudo systemctl start mr-tee-a2a
sudo systemctl enable mr-tee-a2a

echo "→ Checking status..."
sudo systemctl status mr-tee-a2a --no-pager

echo ""
echo "✅ A2A Endpoint installed!"
echo ""
echo "Next steps:"
echo "1. Configure reverse proxy (nginx/caddy) with TLS"
echo "2. Update firewall to allow external access"
echo "3. Register public endpoint URL in ERC-8004"
echo ""
echo "Local endpoint: http://localhost:3100"
echo "Health check: curl http://localhost:3100/health"
echo ""
echo "📺 Ready for agent communication!"
