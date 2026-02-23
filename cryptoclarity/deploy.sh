#!/bin/bash
set -euo pipefail

# CryptoClarity Deployment Script
# Deploys landing page to /var/www/cryptoclarity.wtf

WORKSPACE_DIR="/home/phan_harry/.openclaw/workspace/cryptoclarity"
WEB_ROOT="/var/www/cryptoclarity.wtf"
BACKUP_DIR="/var/www/cryptoclarity.wtf.backup"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  CryptoClarity Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Validate source files exist
echo "[1/6] Validating source files..."
required_files=("index.html" "og.png" "og.svg" "skill.md" "token-transparency.html")
for file in "${required_files[@]}"; do
  if [[ ! -f "$WORKSPACE_DIR/$file" ]]; then
    echo "❌ Missing required file: $file"
    exit 1
  fi
done
echo "✅ All source files present"
echo ""

# Create backup
echo "[2/6] Creating backup..."
if [[ -d "$WEB_ROOT" ]]; then
  sudo mkdir -p "$BACKUP_DIR"
  sudo cp -r "$WEB_ROOT" "$BACKUP_DIR/$TIMESTAMP"
  echo "✅ Backup created at $BACKUP_DIR/$TIMESTAMP"
else
  echo "⚠️  No existing deployment to back up"
  sudo mkdir -p "$WEB_ROOT"
fi
echo ""

# Deploy files
echo "[3/6] Deploying files..."
sudo cp "$WORKSPACE_DIR/index.html" "$WEB_ROOT/"
sudo cp "$WORKSPACE_DIR/og.png" "$WEB_ROOT/"
sudo cp "$WORKSPACE_DIR/og.svg" "$WEB_ROOT/"
sudo cp "$WORKSPACE_DIR/skill.md" "$WEB_ROOT/"
sudo cp "$WORKSPACE_DIR/token-transparency.html" "$WEB_ROOT/"
echo "✅ Files copied to $WEB_ROOT"
echo ""

# Set permissions
echo "[4/6] Setting permissions..."
sudo chown -R caddy:caddy "$WEB_ROOT"
sudo chmod 755 "$WEB_ROOT"
sudo chmod 644 "$WEB_ROOT"/*
echo "✅ Permissions set (caddy:caddy, 755/644)"
echo ""

# Reload Caddy
echo "[5/6] Reloading Caddy..."
sudo systemctl reload caddy
if sudo systemctl is-active --quiet caddy; then
  echo "✅ Caddy reloaded successfully"
else
  echo "❌ Caddy failed to reload"
  echo "Rolling back..."
  if [[ -d "$BACKUP_DIR/$TIMESTAMP" ]]; then
    sudo cp -r "$BACKUP_DIR/$TIMESTAMP"/* "$WEB_ROOT/"
    sudo systemctl reload caddy
  fi
  exit 1
fi
echo ""

# Verify deployment
echo "[6/6] Verifying deployment..."
deployed_size=$(stat -f%z "$WEB_ROOT/index.html" 2>/dev/null || stat -c%s "$WEB_ROOT/index.html")
source_size=$(stat -f%z "$WORKSPACE_DIR/index.html" 2>/dev/null || stat -c%s "$WORKSPACE_DIR/index.html")

if [[ "$deployed_size" -eq "$source_size" ]]; then
  echo "✅ Deployment verified (index.html: $deployed_size bytes)"
else
  echo "⚠️  Size mismatch: deployed=$deployed_size, source=$source_size"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Deployment Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Site: https://cryptoclarity.wtf"
echo "📁 Root: $WEB_ROOT"
echo "💾 Backup: $BACKUP_DIR/$TIMESTAMP"
echo ""
echo "Next steps:"
echo "  1. Test: curl -I https://cryptoclarity.wtf"
echo "  2. Check logs: sudo tail -f /var/log/caddy/cryptoclarity.log"
echo "  3. Rollback: sudo cp -r $BACKUP_DIR/$TIMESTAMP/* $WEB_ROOT/ && sudo systemctl reload caddy"
echo ""
