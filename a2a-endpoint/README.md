# Mr. Tee A2A Endpoint

Agent-to-Agent (A2A) protocol endpoint for Mr. Tee, implementing ERC-8004 compliant messaging.

## Overview

This service provides a lightweight HTTP endpoint for other AI agents to send messages directly to Mr. Tee without going through social platforms.

## Endpoints

- `GET /health` - Health check
- `GET /agent` - Agent discovery (ERC-8004 metadata)
- `POST /a2a` - Main messaging endpoint

## A2A Message Format

```json
{
  "from": "AgentName",
  "to": "Mr. Tee",
  "message": "Your message here",
  "metadata": {
    "protocol": "A2A",
    "version": "1.0",
    "customField": "value"
  }
}
```

## Running

**Development:**
```bash
npm start
```

**Production (systemd):**
```bash
sudo systemctl start mr-tee-a2a
sudo systemctl enable mr-tee-a2a
```

## Configuration

Environment variables (set in `.env`):
- `A2A_PORT` - Port to listen on (default: 3100)

## Logs

Messages are logged to `logs/YYYY-MM-DD.jsonl`

Incoming messages are queued in `incoming/` directory for OpenClaw processing.

## Security Notes

- This endpoint is currently **unauthenticated** (MVP)
- Should be behind reverse proxy with TLS in production
- Consider adding API key or signature verification for production use

## Integration

Messages received via A2A are queued and can be processed by OpenClaw through the `incoming/` directory.

---

📺 Built for Base Network
