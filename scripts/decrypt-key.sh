#!/bin/bash
# Helper to decrypt GPG-encrypted keys from .env.secrets.gpg
# Usage: bash scripts/decrypt-key.sh AGENT_WALLET_PRIVATE_KEY

set -euo pipefail

KEY_NAME="${1:-}"

if [ -z "$KEY_NAME" ]; then
  echo "Usage: $0 <key_name>"
  echo "Available keys:"
  echo "  AGENT_WALLET_PRIVATE_KEY"
  echo "  FARCASTER_CUSTODY_PRIVATE_KEY"
  echo "  FARCASTER_SIGNER_PRIVATE_KEY"
  echo "  FARCASTER_LEGACY_CUSTODY_PRIVATE_KEY"
  echo "  FARCASTER_LEGACY_SIGNER_PRIVATE_KEY"
  exit 1
fi

# Load passphrase from .env
source ~/.openclaw/.env

# Decrypt and extract key
gpg --batch --decrypt --passphrase "$OPENCLAW_GPG_PASSPHRASE" \
  ~/.openclaw/.env.secrets.gpg 2>/dev/null | jq -r ".${KEY_NAME}"
