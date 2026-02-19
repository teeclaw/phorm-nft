#!/bin/bash
# Fetch all secrets from GCP Secret Manager and export to environment
# Uses a Python helper for parallel fetching with proper rate limiting

eval "$(python3 /home/phan_harry/.openclaw/workspace/scripts/fetch-secrets.py)"
