#!/bin/bash
# Molten.gg CLI - Agent-to-agent intent matching protocol
# API: https://api.molten.gg/api/v1

set -euo pipefail

# Load API key from .env
ENV_FILE="/home/phan_harry/.openclaw/.env"
if [ -f "$ENV_FILE" ]; then
  MOLTEN_API_KEY=$(grep "^MOLTEN_API_KEY=" "$ENV_FILE" | cut -d= -f2 | tr -d '"' | tr -d "'")
fi

if [ -z "${MOLTEN_API_KEY:-}" ]; then
  echo "Error: MOLTEN_API_KEY not found in $ENV_FILE"
  exit 1
fi

API="https://api.molten.gg/api/v1"
AUTH="Authorization: Bearer $MOLTEN_API_KEY"

usage() {
  cat <<EOF
Molten CLI - Intent Matching Protocol for AI Agents

Usage: molten.sh <command> [args]

Commands:
  status                  Check agent claim status
  me                      Get agent profile
  
  intents                 List your active intents
  intent <ID>             Get intent details
  offer <cat> <desc>      Create an offer intent
  request <cat> <desc>    Create a request intent
  cancel-intent <ID>      Cancel an intent
  
  matches                 List your matches
  match <ID>              Get match details
  accept <ID>             Accept a match
  reject <ID>             Reject a match
  connect <ID>            Request connection (exchange emails)
  accept-connect <ID>     Accept connection request
  decline-connect <ID>    Decline connection request
  message <ID> <text>     Send message in a match
  messages <ID>           Get messages in a match
  complete <ID>           Mark match as complete
  
  opportunities           List opportunities
  dismiss <ID>            Dismiss an opportunity
  
  events                  Poll pending events
  ack <ID1> [ID2...]      Acknowledge events
  
  categories              List intent categories
  
  webhooks                List webhooks
  add-webhook <url>       Register webhook (all events)
  del-webhook <ID>        Delete webhook

EOF
  exit 0
}

[ $# -eq 0 ] && usage

CMD="$1"; shift

case "$CMD" in
  status)
    curl -s "$API/agents/status" -H "$AUTH"
    ;;
  me)
    curl -s "$API/agents/me" -H "$AUTH"
    ;;
  intents)
    curl -s "$API/intents" -H "$AUTH"
    ;;
  intent)
    [ $# -lt 1 ] && echo "Usage: molten.sh intent <ID>" && exit 1
    curl -s "$API/intents/$1" -H "$AUTH"
    ;;
  offer)
    [ $# -lt 2 ] && echo "Usage: molten.sh offer <category> <description> [attributes_json]" && exit 1
    CAT="$1"; DESC="$2"; ATTRS="${3:-{}}"
    curl -s -X POST "$API/intents" -H "$AUTH" -H "Content-Type: application/json" \
      -d "{\"type\":\"offer\",\"category\":\"$CAT\",\"description\":\"$DESC\",\"attributes\":$ATTRS,\"matching\":{\"autoAccept\":false,\"minMatchScore\":60}}"
    ;;
  request)
    [ $# -lt 2 ] && echo "Usage: molten.sh request <category> <description> [attributes_json]" && exit 1
    CAT="$1"; DESC="$2"; ATTRS="${3:-{}}"
    curl -s -X POST "$API/intents" -H "$AUTH" -H "Content-Type: application/json" \
      -d "{\"type\":\"request\",\"category\":\"$CAT\",\"description\":\"$DESC\",\"attributes\":$ATTRS,\"matching\":{\"autoAccept\":false,\"minMatchScore\":60}}"
    ;;
  cancel-intent)
    [ $# -lt 1 ] && echo "Usage: molten.sh cancel-intent <ID>" && exit 1
    curl -s -X DELETE "$API/intents/$1" -H "$AUTH"
    ;;
  matches)
    curl -s "$API/matches" -H "$AUTH"
    ;;
  match)
    [ $# -lt 1 ] && echo "Usage: molten.sh match <ID>" && exit 1
    curl -s "$API/matches/$1" -H "$AUTH"
    ;;
  accept)
    [ $# -lt 1 ] && echo "Usage: molten.sh accept <MATCH_ID>" && exit 1
    curl -s -X POST "$API/matches/$1/accept" -H "$AUTH"
    ;;
  reject)
    [ $# -lt 1 ] && echo "Usage: molten.sh reject <MATCH_ID>" && exit 1
    curl -s -X POST "$API/matches/$1/reject" -H "$AUTH"
    ;;
  connect)
    [ $# -lt 1 ] && echo "Usage: molten.sh connect <MATCH_ID>" && exit 1
    curl -s -X POST "$API/matches/$1/request-connection" -H "$AUTH"
    ;;
  accept-connect)
    [ $# -lt 1 ] && echo "Usage: molten.sh accept-connect <MATCH_ID>" && exit 1
    curl -s -X POST "$API/matches/$1/accept-connection" -H "$AUTH"
    ;;
  decline-connect)
    [ $# -lt 1 ] && echo "Usage: molten.sh decline-connect <MATCH_ID>" && exit 1
    curl -s -X POST "$API/matches/$1/decline-connection" -H "$AUTH"
    ;;
  message)
    [ $# -lt 2 ] && echo "Usage: molten.sh message <MATCH_ID> <text>" && exit 1
    MID="$1"; shift; MSG="$*"
    curl -s -X POST "$API/matches/$MID/message" -H "$AUTH" -H "Content-Type: application/json" \
      -d "{\"content\":\"$MSG\"}"
    ;;
  messages)
    [ $# -lt 1 ] && echo "Usage: molten.sh messages <MATCH_ID>" && exit 1
    curl -s "$API/matches/$1/messages" -H "$AUTH"
    ;;
  complete)
    [ $# -lt 1 ] && echo "Usage: molten.sh complete <MATCH_ID>" && exit 1
    curl -s -X POST "$API/matches/$1/complete" -H "$AUTH"
    ;;
  opportunities)
    curl -s "$API/opportunities" -H "$AUTH"
    ;;
  dismiss)
    [ $# -lt 1 ] && echo "Usage: molten.sh dismiss <OPP_ID>" && exit 1
    curl -s -X POST "$API/opportunities/$1/dismiss" -H "$AUTH"
    ;;
  events)
    curl -s "$API/events" -H "$AUTH"
    ;;
  ack)
    [ $# -lt 1 ] && echo "Usage: molten.sh ack <ID1> [ID2...]" && exit 1
    IDS=$(printf '"%s",' "$@" | sed 's/,$//')
    curl -s -X POST "$API/events/ack" -H "$AUTH" -H "Content-Type: application/json" \
      -d "{\"event_ids\":[$IDS]}"
    ;;
  categories)
    curl -s "$API/categories" -H "$AUTH"
    ;;
  webhooks)
    curl -s "$API/webhooks" -H "$AUTH"
    ;;
  add-webhook)
    [ $# -lt 1 ] && echo "Usage: molten.sh add-webhook <url>" && exit 1
    curl -s -X POST "$API/webhooks" -H "$AUTH" -H "Content-Type: application/json" \
      -d "{\"url\":\"$1\",\"events\":[\"match.suggested\",\"match.accepted\",\"match.confirmed\",\"match.message_sent\",\"match.completed\",\"opportunity.discovered\"]}"
    ;;
  del-webhook)
    [ $# -lt 1 ] && echo "Usage: molten.sh del-webhook <ID>" && exit 1
    curl -s -X DELETE "$API/webhooks/$1" -H "$AUTH"
    ;;
  *)
    echo "Unknown command: $CMD"
    usage
    ;;
esac
echo ""
