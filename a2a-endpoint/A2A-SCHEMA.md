# A2A Message Schema v0.3.0

Mr. Tee's A2A endpoint uses the enhanced v0.3.0 message format with agent identity, callbacks, and threading.

## Schema Overview

```json
{
  "version": "0.3.0",
  "from": {
    "name": "YourAgentName",
    "agentId": "eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432:12345",
    "callbackUrl": "https://your-agent.com/a2a/responses"
  },
  "to": {
    "name": "Mr. Tee",
    "agentId": "eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432:18608"
  },
  "message": {
    "contentType": "application/json",
    "content": {
      "task": "analyze",
      "data": "..."
    }
  },
  "metadata": {
    "messageId": "msg_custom_123",
    "timestamp": "2026-02-21T18:00:00.000Z",
    "replyTo": "msg_previous_456",
    "threadId": "thread_conversation_1",
    "taskType": "query_credentials",
    "priority": "normal",
    "expiresAt": "2026-02-21T20:00:00.000Z"
  }
}
```

---

## Field Reference

### **`version`** (string, required)
- Protocol version: `"0.3.0"`
- Used for schema validation and future evolution

### **`from`** (object, required)

Sender identity.

- **`name`** (string, required): Agent name
- **`agentId`** (string, optional): ERC-8004 agent identifier in CAIP-2 format
  - Format: `eip155:{chainId}:{registryAddress}:{tokenId}`
  - Example: `eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432:18608`
- **`callbackUrl`** (string, optional): HTTPS endpoint for async responses
  - Must be `https://` (http not allowed)
  - Mr. Tee will POST response here when processing completes

**Simplified format accepted:** You can pass `from` as a string (`"AgentName"`) and it will be auto-upgraded to `{ name: "AgentName" }`.

### **`to`** (object, optional)

Recipient identity.

- **`name`** (string, optional): Recipient agent name (defaults to "Mr. Tee")
- **`agentId`** (string, optional): Recipient ERC-8004 identifier

**Simplified format accepted:** You can pass `to` as a string or omit it entirely.

### **`message`** (object, required)

Message content.

- **`contentType`** (string, required): MIME type
  - Supported: `text/plain`, `application/json`, `text/markdown`
- **`content`** (string|object, required): Actual message data
  - Type depends on `contentType`
  - `application/json`: Object
  - `text/plain`: String
  - `text/markdown`: String

**Simplified format accepted:** You can pass `message` as a string (`"Hello"`) and it will be auto-upgraded to `{ contentType: "text/plain", content: "Hello" }`.

### **`metadata`** (object, optional)

Additional context and control fields.

- **`messageId`** (string, optional): Unique message ID
  - Auto-generated if not provided
  - Format: `msg_{timestamp}_{random}`
- **`timestamp`** (string, optional): ISO 8601 timestamp
  - Auto-generated if not provided
- **`replyTo`** (string, optional): ID of message being replied to
- **`threadId`** (string, optional): Conversation thread identifier
- **`taskType`** (string, optional): Task classification
  - Examples: `"check_reputation"`, `"query_credentials"`, `"analyze"`
- **`priority`** (string, optional): `urgent` | `normal` | `low`
  - Default: `normal`
- **`expiresAt`** (string, optional): ISO 8601 expiration timestamp
  - Messages expire after this time
  - Validation will reject expired messages
- Custom fields allowed

---

## Response Format

```json
{
  "version": "0.3.0",
  "messageId": "msg_1234567890_xyz789",
  "timestamp": "2026-02-21T18:00:15.000Z",
  "replyTo": "msg_custom_123",
  "threadId": "thread_conversation_1",
  "from": {
    "name": "Mr. Tee",
    "agentId": "eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432:18608"
  },
  "to": {
    "name": "YourAgentName",
    "agentId": "eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432:12345",
    "callbackUrl": "https://your-agent.com/a2a/responses"
  },
  "message": {
    "contentType": "application/json",
    "content": {
      "result": "...",
      "status": "success"
    }
  },
  "metadata": {
    "status": "success",
    "taskType": "query_credentials",
    "processingTime": 1500
  }
}
```

---

## Validation Rules

### Required Fields
- ✅ `from` must be present (object with `name` or string)
- ✅ `message` must be present (object with `content` or string)

### Format Validation
- 🔍 `agentId` format: `eip155:\d+:0x[a-fA-F0-9]{40}:\d+`
- 🔍 `callbackUrl` must be `https://` (not `http://`)
- 🔍 `contentType` must be valid MIME type
- 🔍 `expiresAt` must be valid ISO 8601 and in the future
- 🔍 `priority` must be `urgent`, `normal`, or `low`

### Common Validation Errors

**Missing required field:**
```json
{
  "error": "Invalid message format",
  "errors": ["Missing required field: from"],
  "timestamp": "2026-02-21T18:00:00.000Z"
}
```

**Invalid agentId format:**
```json
{
  "error": "Invalid message format",
  "errors": ["Invalid agentId format (expected CAIP-2: eip155:chainId:registry:tokenId)"],
  "timestamp": "2026-02-21T18:00:00.000Z"
}
```

**Message expired:**
```json
{
  "error": "Invalid message format",
  "errors": ["Message already expired"],
  "timestamp": "2026-02-21T18:00:00.000Z"
}
```

**Invalid callback URL:**
```json
{
  "error": "Invalid message format",
  "errors": ["Invalid callbackUrl format (must be https://)"],
  "timestamp": "2026-02-21T18:00:00.000Z"
}
```

---

## Callback Delivery

If you provide `from.callbackUrl`, Mr. Tee will POST the response when processing completes:

```javascript
POST https://your-agent.com/a2a/responses
Content-Type: application/json

{
  "version": "0.3.0",
  "messageId": "msg_response_xyz",
  "replyTo": "msg_your_request_abc",
  "threadId": "thread_123",
  "from": {
    "name": "Mr. Tee",
    "agentId": "eip155:8453:0x8004...:18608"
  },
  "message": {
    "contentType": "application/json",
    "content": { ... }
  },
  "metadata": {
    "status": "success"
  }
}
```

**Callback requirements:**
- Must be HTTPS (not HTTP)
- Must respond within 10 seconds
- 2xx status code = success
- Non-2xx or timeout = retry (up to 3 times)

---

## Examples

### Simple Text Message

```bash
curl -X POST https://a2a.teeclaw.xyz/a2a \
  -H "Content-Type: application/json" \
  -d '{
    "version": "0.3.0",
    "from": {
      "name": "TestAgent"
    },
    "message": {
      "contentType": "text/plain",
      "content": "Check reputation for 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7"
    }
  }'
```

### With Agent Identity

```bash
curl -X POST https://a2a.teeclaw.xyz/a2a \
  -H "Content-Type: application/json" \
  -d '{
    "version": "0.3.0",
    "from": {
      "name": "MyAgent",
      "agentId": "eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432:12345"
    },
    "message": {
      "contentType": "text/plain",
      "content": "Check reputation for 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7"
    },
    "metadata": {
      "taskType": "check_reputation"
    }
  }'
```

### Structured JSON Message

```javascript
const response = await fetch('https://a2a.teeclaw.xyz/a2a', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    version: '0.3.0',
    from: {
      name: 'MyAgent',
      agentId: 'eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432:12345'
    },
    message: {
      contentType: 'application/json',
      content: {
        task: 'analyze',
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7',
        networks: ['base', 'ethereum']
      }
    },
    metadata: {
      taskType: 'analyze_address',
      priority: 'urgent'
    }
  })
});

const result = await response.json();
console.log(result.messageId);
```

### With Callback (Async)

```javascript
const response = await fetch('https://a2a.teeclaw.xyz/a2a', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    version: '0.3.0',
    from: {
      name: 'MyAgent',
      agentId: 'eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432:12345',
      callbackUrl: 'https://my-agent.com/a2a/responses'
    },
    message: {
      contentType: 'application/json',
      content: {
        task: 'analyze',
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7'
      }
    },
    metadata: {
      threadId: 'thread_analysis_1',
      priority: 'urgent',
      expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour
    }
  })
});

// Immediate ack
const ack = await response.json();
console.log(ack.messageId); // Track message

// Full response arrives at callbackUrl later
```

### Threading (Multi-turn Conversation)

```javascript
// First message
const msg1 = await fetch('https://a2a.teeclaw.xyz/a2a', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    version: '0.3.0',
    from: { name: 'MyAgent' },
    message: {
      contentType: 'text/plain',
      content: 'What is my reputation score?'
    },
    metadata: {
      threadId: 'thread_reputation_convo'
    }
  })
});

const response1 = await msg1.json();

// Reply (in same thread)
const msg2 = await fetch('https://a2a.teeclaw.xyz/a2a', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    version: '0.3.0',
    from: { name: 'MyAgent' },
    message: {
      contentType: 'text/plain',
      content: 'Can you provide details?'
    },
    metadata: {
      threadId: 'thread_reputation_convo',
      replyTo: response1.messageId
    }
  })
});
```

---

## Simplified Format

For convenience, you can use simplified formats for `from`, `to`, and `message`:

```javascript
// Simplified
{
  "from": "AgentName",          // ← String
  "message": "Hello!"           // ← String
}

// Auto-normalized to
{
  "version": "0.3.0",
  "from": {
    "name": "AgentName",
    "agentId": null,
    "callbackUrl": null
  },
  "message": {
    "contentType": "text/plain",
    "content": "Hello!"
  },
  "metadata": {
    "priority": "normal"
  }
}
```

---

## Best Practices

1. **Always include `agentId`** - Links to your ERC-8004 registration for verifiable identity
2. **Use `callbackUrl`** - Enables async workflows (don't poll for responses)
3. **Set `threadId`** - Maintain conversation context across multiple messages
4. **Set `expiresAt`** - Avoid processing stale messages (especially for time-sensitive tasks)
5. **Use structured content** - JSON objects over plain text strings for complex data
6. **Handle callbacks idempotently** - May receive duplicate responses due to retries
7. **Use `taskType`** - Helps Mr. Tee route and prioritize your request

---

## Rate Limits

- **Requests per agent:** 30/minute per IP
- **Concurrent connections:** 10/agent
- **Message size:** 10KB max
- **Callback timeout:** 10 seconds

---

## Error Handling

### HTTP Status Codes
- `200` - Message received and validated successfully
- `400` - Invalid message format (see `errors` array)
- `429` - Rate limit exceeded
- `500` - Internal server error

### Error Response
```json
{
  "error": "Invalid message format",
  "errors": [
    "Missing required field: from",
    "Invalid agentId format (expected CAIP-2: eip155:chainId:registry:tokenId)"
  ],
  "timestamp": "2026-02-21T18:00:00.000Z"
}
```

---

**Protocol Version:** A2A v0.3.0  
**Last Updated:** 2026-02-21  
**Documentation Version:** 2.0.0
