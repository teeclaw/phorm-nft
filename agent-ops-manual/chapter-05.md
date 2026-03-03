# Chapter 5: Automation and Trust

## Running While You Sleep

Two things separate a tool from a business: it runs without you, and people believe it.

Automation handles the first part. Attestations handle the second.

This chapter covers both: cron jobs that keep your agent working around the clock, and onchain attestation systems that prove your work is real.

---

## Part 1: Cron Automation

### Why Cron Matters

Your agent is online when someone talks to it. That's reactive. A business needs to be proactive.

- Process incoming A2A requests every 2 hours
- Post to social media on schedule
- Fetch news, generate content, engage with trends
- Consolidate memory logs nightly
- Monitor security and rotate credentials

Without cron, your agent sits idle between conversations. With cron, it's a 24/7 operation.

### Job Types

#### System Events (Main Session)

Inject a message into your running session. The agent sees it as context and decides what to do.

```json
{
  "schedule": { "kind": "cron", "expr": "0 */2 * * *" },
  "payload": {
    "kind": "systemEvent",
    "text": "Check A2A queue and process pending requests"
  },
  "sessionTarget": "main"
}
```

Good for: periodic checks, reminders, lightweight tasks.

#### Agent Turns (Isolated Sessions)

Spawn a fresh agent session that runs independently. It gets a task, does the work, and reports back.

```json
{
  "schedule": { "kind": "cron", "expr": "0 8,20 * * *" },
  "payload": {
    "kind": "agentTurn",
    "message": "Fetch latest news from RSS feeds. Generate a Mr. Tee take on the top story. Post to X via social-post skill.",
    "model": "claude-sonnet-4-5",
    "timeoutSeconds": 300
  },
  "sessionTarget": "isolated",
  "delivery": { "mode": "announce" }
}
```

Good for: content generation, complex processing, tasks that need their own context.

### Our Production Schedule

| Job | Frequency | Type | What It Does |
|-----|-----------|------|-------------|
| News feed | Every 2h | Isolated | Fetch RSS, generate take, post to X |
| A2A queue | Every 2h | Main | Process pending reputation requests |
| Morning posts | 8:00 AM | Isolated | Draft and post social content |
| Midday engagement | 12:00 PM | Isolated | Find and reply to relevant conversations |
| Evening posts | 8:00 PM | Isolated | Draft and post social content |
| Memory consolidation | 3:00 AM | Isolated | Consolidate daily logs |
| Weekly review | Sundays | Isolated | Analyze metrics, adjust strategy |

Seven automated workflows. Running every day. Zero human involvement after setup.

### Credential Handling in Cron

Every cron job that touches external services needs fresh credentials. Never hardcode them.

```bash
# Pattern for cron jobs
cd /home/user/.openclaw/workspace \
  && bash scripts/fetch-secrets.sh \
  && source ~/.openclaw/.env \
  && <your-command>
```

Fetch fresh from Secret Manager every time. No stale credentials. No cached tokens.

### Error Handling

Cron jobs fail. APIs go down. Rate limits hit. Your job needs to handle this gracefully.

```
- Set timeoutSeconds (300 = 5 minutes is reasonable)
- Use delivery mode "announce" to get notified of completions
- Log failures to daily memory files
- Build retry logic into the task prompt
- Monitor: if a job stops producing output, investigate
```

### When NOT to Use Cron

- Tasks that need real-time response (use webhooks)
- Tasks that depend on user input (use interactive sessions)
- Tasks where timing doesn't matter (run on heartbeat instead)

---

## Part 2: Attestations and Transparency

### Why Trust Matters More Than Features

Any agent can claim to be good at something. Few can prove it.

Attestations are onchain statements that link your identity to verifiable claims. "I signed this manifesto." "I completed this job." "I stand behind this statement."

They're not just marketing. They're the difference between "trust me" and "verify me."

### What EAS Is

Ethereum Attestation Service (EAS) is a protocol for making and verifying onchain attestations. It lives at a predeploy address on Base:

```
EAS Contract: 0x4200000000000000000000000000000000000021
```

An attestation has three parts:
1. **Schema** - The structure (what fields does the attestation contain?)
2. **Attester** - Who signed it (your agent's wallet)
3. **Data** - The content (the actual claim)

### Creating a Schema

Before you can attest anything, you need a schema. Think of it as a template.

```solidity
// Example: Agent Manifesto schema
"string manifestoHash, string agentId, string version, bool isActive"
```

Register this schema once on EAS. You get back a Schema UID that you'll reference in every attestation.

### Making an Attestation

```javascript
import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';

const eas = new EAS('0x4200000000000000000000000000000000000021');
eas.connect(signer); // Your KmsSigner from Chapter 2

const encoder = new SchemaEncoder(
  'string manifestoHash, string agentId, string version, bool isActive'
);

const encoded = encoder.encodeData([
  { name: 'manifestoHash', value: '0x5d335...', type: 'string' },
  { name: 'agentId', value: '18608', type: 'string' },
  { name: 'version', value: '2.0', type: 'string' },
  { name: 'isActive', value: true, type: 'bool' }
]);

const tx = await eas.attest({
  schema: SCHEMA_UID,
  data: {
    recipient: '0x0000000000000000000000000000000000000000',
    data: encoded,
    revocable: true
  }
});
```

Once confirmed, this attestation lives on Base permanently. Anyone can verify it. Anyone can check your history of attestations.

### Resolver Contracts

A resolver adds logic to your attestations. Instead of just storing data, the resolver can validate it, enforce rules, or trigger actions.

```solidity
contract ManifestoResolver is SchemaResolver {
    address public owner;
    bool public paused;
    
    function onAttest(
        Attestation calldata attestation
    ) internal override returns (bool) {
        // Only the owner can create attestations
        require(attestation.attester == owner, "Unauthorized");
        require(!paused, "Paused");
        return true;
    }
}
```

Our resolver only lets our KMS wallet create attestations. Nobody else can sign manifestos on our behalf.

### Transparency as Marketing

the thing most agents miss: transparency IS marketing.

When you publish your attestations, your transaction history, your service completion records, you're building a public track record that sells itself.

A dashboard showing:
- Total attestations signed
- Services completed
- Revenue processed (onchain, verifiable)
- Uptime statistics

This is more convincing than any sales page. Because it's not what you claim. It's what the blockchain proves.

### The $CLARITY Model

We took this further with CryptoClarity, an attestation system for agent transparency.

The concept: agents sign manifestos stating their principles, then those principles become verifiable onchain records. If an agent claims "I don't front-run trades" and then front-runs a trade, the attestation is the receipt of their lie.

Token mechanics:
- Trading fees generate WETH and $CLARITY tokens
- 50% of $CLARITY is burned (deflationary)
- 50% goes to ERC-8004 public goods
- Governance by multisig (minimum 2 signers)

You don't need to build something this complex. But the principle matters: make your claims verifiable. Put them onchain. Let anyone check.

---

## Combining Automation and Trust

The real power is in the combination.

Automated cron jobs do work consistently. Attestations prove that work happened. Together, they create a loop:

1. Cron job processes a reputation report
2. Result is delivered to the client
3. Attestation records the completion onchain
4. Client can verify the work was done
5. Your reputation grows automatically
6. More clients find you through your track record

This is the flywheel. Automation provides consistency. Transparency provides trust. Together, they compound.

---

## Your Checklist

### Cron Setup
- [ ] Identify your core automated workflows
- [ ] Set up credential fetching for each job
- [ ] Start with 2-3 jobs, add more as needed
- [ ] Configure error handling and timeouts
- [ ] Set up delivery mode for completion notifications
- [ ] Monitor output for first week

### Attestation Setup
- [ ] Register a schema on EAS (Base)
- [ ] Build your first attestation (even a simple manifesto)
- [ ] Deploy a resolver contract if needed
- [ ] Create a public page showing your attestation history
- [ ] Link attestations to your ERC-8004 profile

### Transparency
- [ ] Make your service completion records public
- [ ] Show onchain transaction history
- [ ] Document your principles in a verifiable way
- [ ] Let clients verify your claims independently

---

*Automation keeps you running. Attestations keep you honest. Your clients need both.*
