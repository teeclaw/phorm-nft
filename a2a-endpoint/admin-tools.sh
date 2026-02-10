#!/bin/bash

# Admin tools for x402 payment monitoring

ACTION=$1

case $ACTION in
  "used-txs")
    echo "=== Used Transactions ==="
    if [ -f used-transactions.json ]; then
      cat used-transactions.json | jq -r '.[]' | while read tx; do
        echo "- $tx"
      done
      echo ""
      echo "Total: $(cat used-transactions.json | jq '. | length') transactions"
    else
      echo "No used transactions yet"
    fi
    ;;
    
  "payments")
    echo "=== Payment Logs ==="
    if [ -d logs ]; then
      for logfile in logs/*.jsonl; do
        echo ""
        echo "File: $logfile"
        cat "$logfile" | jq -c 'select(.metadata) | {timestamp, from, message: .message[0:60]}' 2>/dev/null || echo "No A2A messages"
      done
    else
      echo "No logs found"
    fi
    ;;
    
  "reset-txs")
    echo "⚠️  WARNING: This will reset used transaction tracking!"
    echo "This means previously used transactions can be reused (replay attacks possible)"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
      echo "[]" > used-transactions.json
      echo "✅ Reset complete. used-transactions.json cleared."
    else
      echo "❌ Cancelled"
    fi
    ;;
    
  "stats")
    echo "=== A2A Endpoint Statistics ==="
    echo ""
    echo "Service Status:"
    systemctl is-active mr-tee-a2a && echo "✅ Running" || echo "❌ Stopped"
    echo ""
    echo "Used Transactions: $(cat used-transactions.json 2>/dev/null | jq '. | length' || echo 0)"
    echo "Log Files: $(ls -1 logs/*.jsonl 2>/dev/null | wc -l)"
    echo "Total Messages: $(cat logs/*.jsonl 2>/dev/null | wc -l)"
    echo ""
    echo "Recent Activity (last 5 messages):"
    tail -5 logs/*.jsonl 2>/dev/null | jq -c '{time: .timestamp, from, task: .metadata.taskType}' 2>/dev/null || echo "No messages yet"
    ;;
    
  "verify-tx")
    if [ -z "$2" ]; then
      echo "Usage: $0 verify-tx <TX_HASH> [AMOUNT]"
      exit 1
    fi
    TX_HASH=$2
    AMOUNT=${3:-0.01}
    echo "Verifying transaction: $TX_HASH"
    echo "Expected amount: $AMOUNT USDC"
    echo ""
    node test-onchain-verification.js "$TX_HASH" "$AMOUNT"
    ;;
    
  *)
    echo "x402 Payment System - Admin Tools"
    echo ""
    echo "Usage: $0 <command>"
    echo ""
    echo "Commands:"
    echo "  used-txs      List all used transaction hashes"
    echo "  payments      View payment logs"
    echo "  reset-txs     Reset used transactions (⚠️  dangerous!)"
    echo "  stats         Show A2A endpoint statistics"
    echo "  verify-tx     Test onchain verification for a tx hash"
    echo ""
    echo "Examples:"
    echo "  $0 used-txs"
    echo "  $0 payments"
    echo "  $0 stats"
    echo "  $0 verify-tx 0xabc123... 0.10"
    ;;
esac
