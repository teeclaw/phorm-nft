#!/bin/bash
# Rotate GPG secrets: new wallet key + new passphrase
# Usage: bash rotate-secrets.sh <new_private_key> <new_passphrase>
set -euo pipefail

NEW_PRIVATE_KEY="${1:-}"
NEW_PASSPHRASE="${2:-}"

if [ -z "$NEW_PRIVATE_KEY" ] || [ -z "$NEW_PASSPHRASE" ]; then
  echo "Usage: $0 <new_private_key> <new_passphrase>"
  exit 1
fi

source ~/.openclaw/.env

SECRETS_PATH="$HOME/.openclaw/.env.secrets.gpg"
BACKUP_PATH="$HOME/.openclaw/.env.secrets.gpg.bak.$(date +%s)"

echo "→ Backing up current secrets file..."
cp "$SECRETS_PATH" "$BACKUP_PATH"
chmod 600 "$BACKUP_PATH"
echo "  Backup: $BACKUP_PATH"

echo "→ Decrypting current secrets..."
CURRENT=$(gpg --batch --decrypt --passphrase-fd 3 \
  "$SECRETS_PATH" 3<<<"$OPENCLAW_GPG_PASSPHRASE" 2>/dev/null)

echo "→ Building new secrets with rotated wallet key..."
NEW_SECRETS=$(echo "$CURRENT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
d['AGENT_WALLET_PRIVATE_KEY'] = '$NEW_PRIVATE_KEY'
print(json.dumps(d, indent=2))
")

echo "→ Re-encrypting with new passphrase..."
echo "$NEW_SECRETS" | gpg --batch --symmetric --cipher-algo AES256 \
  --passphrase-fd 3 \
  --output "$SECRETS_PATH.new" 3<<<"$NEW_PASSPHRASE" 2>/dev/null

echo "→ Verifying new file can be decrypted..."
VERIFY=$(gpg --batch --decrypt --passphrase-fd 3 \
  "$SECRETS_PATH.new" 3<<<"$NEW_PASSPHRASE" 2>/dev/null | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print('Keys:', list(d.keys()))")
echo "  $VERIFY"

echo "→ Replacing old secrets file..."
mv "$SECRETS_PATH.new" "$SECRETS_PATH"
chmod 600 "$SECRETS_PATH"

echo "→ Fixing permissions on backup too..."
chmod 600 "$BACKUP_PATH"

echo ""
echo "✓ Secrets rotated successfully"
echo "  New wallet key: installed"
echo "  Old passphrase: STILL IN .env (remove manually or via update script)"
echo "  New passphrase: must be stored in GCP metadata (see instructions)"
echo ""
echo "  Backup kept at: $BACKUP_PATH"
echo "  Delete after confirming everything works: rm $BACKUP_PATH"
