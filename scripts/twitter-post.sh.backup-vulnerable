#!/bin/bash
# Twitter/X posting script using OAuth 1.0a

set -e

# Load credentials from .env
source /home/phan_harry/.openclaw/.env

TWEET_TEXT="$1"

if [ -z "$TWEET_TEXT" ]; then
  echo "Usage: $0 \"tweet text\""
  exit 1
fi

# Twitter API v2 endpoint
API_URL="https://api.twitter.com/2/tweets"

# Generate OAuth signature (using OAuth 1.0a)
# For simplicity, using twurl if available, otherwise using curl with manual OAuth

if command -v twurl &> /dev/null; then
  # Use twurl if available
  twurl -d "text=$TWEET_TEXT" /2/tweets
else
  # Manual OAuth 1.0a with curl
  # This requires oauth signing which is complex; using a python helper
  python3 - <<EOF
import requests
from requests_oauthlib import OAuth1
import os
import json

consumer_key = os.environ['X_CONSUMER_KEY']
consumer_secret = os.environ['X_CONSUMER_SECRET']
access_token = os.environ['X_ACCESS_TOKEN']
access_token_secret = os.environ['X_ACCESS_TOKEN_SECRET']

auth = OAuth1(consumer_key, consumer_secret, access_token, access_token_secret)

url = "$API_URL"
payload = {"text": """$TWEET_TEXT"""}

response = requests.post(url, auth=auth, json=payload)

if response.status_code == 201:
    tweet = response.json()
    print(f"✓ Tweet posted successfully!")
    print(f"Tweet ID: {tweet['data']['id']}")
    print(f"URL: https://twitter.com/user/status/{tweet['data']['id']}")
else:
    print(f"✗ Failed to post tweet")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    exit(1)
EOF
fi
