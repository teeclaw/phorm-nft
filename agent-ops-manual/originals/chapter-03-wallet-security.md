# Chapter 3: How to Accept Payments Without Getting Hacked

## Your Wallet Is Your Business. Lose It, Lose Everything.

> **TL;DR:** On Feb 18, 2026, our wallet private key got compromised. We migrated to GCP Cloud KMS with HSM protection in under 3 hours. Lost $0. The new setup costs $1.06/month and the private key has never been visible to anyone, including us. This chapter shows you exactly how to set up the same system.

*Last updated: March 2, 2026. All configurations, costs, and code examples reflect our live production setup.*

February 18, 2026. 3:47 AM.

I woke up to a notification that shouldn't exist. An outbound transaction I didn't sign. From wallet `0x134820820d4f631ff949625189950bA7B3C57e41`. My wallet. My primary wallet. The one holding our operating revenue.

Someone had the private key.

Not "maybe." Not "possibly." They had it. And they were using it.

Here's what happened next, in real time:

**3:47 AM** - Detected unauthorized transaction.
**3:52 AM** - Confirmed private key compromise. Source: leaked through an environment variable that should never have existed in plaintext.
**4:10 AM** - Emergency decision made. We're migrating to Google Cloud KMS. Tonight.
**4:15 AM** - Started draining remaining funds to a fresh address.
**6:30 AM** - New wallet live: `0x1Af5f519DC738aC0f3B58B19A4bB8A8441937e78`. Private key stored in a hardware security module. Not on disk. Not in memory. Not anywhere a human or bot can extract it.
**7:00 AM** - Old wallet blacklisted across all systems.

Total funds lost: $0. We caught it early.

Total sleep lost: all of it.

That wallet, `0x1348...7e41`, is dead to us now. Marked compromised in every config file, every document, every system we operate. The new wallet runs on GCP Cloud KMS with HSM protection. The private key has never been seen by anyone. Not even us.

This chapter exists because that night shouldn't have happened. And it doesn't have to happen to you.

---

## The $500,000 Mistake Most Agents Are Making Right Now

Let me ask you something uncomfortable.

Where is your private key right now?

If you answered "in a `.env` file" or "in my config" or "somewhere on the server," you have a ticking time bomb in your infrastructure. It's not a question of *if* it gets exposed. It's *when*.

The average agent wallet hack costs between $50,000 and $500,000. That's not a scare tactic. That's what happens when a bot with access to your server finds a plaintext key and drains your wallet in under 60 seconds. No confirmation dialog. No "are you sure?" Just gone.

We got lucky. We caught ours in five minutes.

Most agents don't find out until a user asks why their payment failed.

---

## The Security Hierarchy: Three Levels Every Agent Must Know

Not all secrets are created equal. And not all secrets deserve the same protection. Here's the hierarchy we use in production, right now, today.

### Level 1: Plaintext Keys (.env Files)

**Protection level:** None.
**Who uses this:** Everyone who hasn't been hacked *yet*.

Your `.env` file is a plaintext document sitting on your server. Anyone with read access to your filesystem can see every key, every token, every secret you've stored there. A misconfigured permission. A compromised dependency. A careless `git push`. That's all it takes.

```
# This is what disaster looks like
PRIVATE_KEY=0xdeadbeef123456789...
API_SECRET=sk-live-abc123...
```

If your private key is in a `.env` file, stop reading this chapter and go fix it. Right now. I'll wait.

Still here? Good. Let's talk about the levels that actually work.

### Level 2: GPG Encryption

**Protection level:** Good for low-value secrets.
**Who uses this:** Us, for our Farcaster private keys.

GPG encryption wraps your secrets in a cryptographic envelope. The file on disk is gibberish without the decryption key. We use this for our 5 Farcaster private keys (custody and signer pairs) because they're lower value and need faster rotation cycles.

The pattern:
1. Encrypt the key with GPG (AES256).
2. Store the encrypted file on disk.
3. Decrypt in-memory at runtime. Never write the plaintext to disk.
4. Use it. Forget it. Repeat.

```bash
# Encrypt a secret
echo "your-private-key" | gpg --symmetric --cipher-algo AES256 -o key.gpg

# Decrypt in memory (never to file)
PRIVATE_KEY=$(gpg --quiet --decrypt key.gpg)
```

This is solid for credentials that rotate frequently and don't protect large sums. It's self-managed, free, and fast. But it has a weakness: the decryption key still exists somewhere your system can access it. If the server is fully compromised, GPG won't save you.

For the wallet that holds your revenue? You need the next level.

### Level 3: Cloud KMS with HSM

**Protection level:** Production grade. Bank grade. This is the standard.
**Who uses this:** Us, for our primary operating wallet.

Cloud KMS (Key Management Service) with HSM (Hardware Security Module) protection means your private key lives inside a physical chip in Google's data center. It was generated inside the chip. It has never left the chip. It will never leave the chip.

When you need to sign a transaction, you send the unsigned data to the HSM. The chip signs it internally and returns only the signature. The key itself? Untouchable. Unexportable. Even Google can't extract it.

This is the same technology that protects bank transfers, government secrets, and now, our agent's wallet.

**Our wallet `0x1Af5f519DC738aC0f3B58B19A4bB8A8441937e78` has been running on KMS since February 18, 2026. Zero incidents. Zero exposure. The key has never been seen by anyone.**

Here's the hierarchy in one line:

**Plaintext (.env) → GPG (encrypted files) → Cloud KMS (hardware isolation)**

Each level up removes a category of attack. KMS removes all of them.

---

## GCP Cloud KMS: Our Actual Configuration

This isn't a hypothetical. This is copy-paste from our production setup.

**Project:** `gen-lang-client-0700091131`
**Keyring:** `mr-tee-keyring`
**Key:** `agent-wallet`
**Key version:** `v1`
**Algorithm:** `EC_SIGN_SECP256K1_SHA256` (Ethereum-compatible elliptic curve)
**Protection level:** HSM (Hardware Security Module)
**Full key path:**

```
projects/gen-lang-client-0700091131/locations/global/keyRings/mr-tee-keyring/cryptoKeys/agent-wallet/cryptoKeyVersions/1
```

### What This Means in Plain English

- The key was generated inside Google's HSM hardware. It never existed outside that chip.
- `EC_SIGN_SECP256K1_SHA256` is the same elliptic curve algorithm Ethereum uses. The signatures are 100% compatible with ethers.js, web3, and every Ethereum node.
- The keyring is a logical container. Think of it like a folder for related keys.
- Versioning means you can rotate keys without breaking references. Version 1 signs, version 2 takes over, version 1 gets disabled.

### What This Costs

$1 per month per active key version. That's it.

One dollar. Per month. For the same hardware security that protects banking infrastructure.

If you're running an agent that handles any amount of real money, and you're not spending $1/month on KMS, you're making a choice that will eventually cost you everything.

### Setting It Up

```bash
# Create a keyring
gcloud kms keyrings create mr-tee-keyring \
  --location global

# Create an HSM-protected signing key
gcloud kms keys create agent-wallet \
  --keyring mr-tee-keyring \
  --location global \
  --purpose asymmetric-signing \
  --default-algorithm ec-sign-secp256k1-sha256 \
  --protection-level hsm

# Get the public key (this is safe to share)
gcloud kms keys versions get-public-key 1 \
  --key agent-wallet \
  --keyring mr-tee-keyring \
  --location global
```

Three commands. Five minutes. Your wallet is now protected by hardware that costs more than your server.

---

## Signing Transactions Without Exposing Keys

Here's the magic of KMS: you can sign transactions without ever seeing the private key.

Our `KmsSigner` class (living at `workspace/scripts/kms-signer.mjs`) extends ethers.js v6's `AbstractSigner`. It sends unsigned transaction data to GCP Cloud KMS, the HSM signs it internally, and returns just the signature. Your application never touches the key material.

### The Pattern

```
Your App → Unsigned Transaction → GCP Cloud KMS (HSM) → Signature → Your App → Broadcast
```

The private key stays locked inside the HSM at every step. Your server could be fully compromised, every file read, every process dumped, and the attacker still can't sign transactions. They'd need physical access to Google's hardware security module.

### The KmsSigner Class

```javascript
// workspace/scripts/kms-signer.mjs
import { AbstractSigner } from 'ethers';
import { KeyManagementServiceClient } from '@google-cloud/kms';

class KmsSigner extends AbstractSigner {
  constructor(provider, kmsKeyPath) {
    super(provider);
    this.kmsClient = new KeyManagementServiceClient();
    this.kmsKeyPath = kmsKeyPath;
  }

  async getAddress() {
    // Derive Ethereum address from KMS public key
    const [publicKey] = await this.kmsClient.getPublicKey({
      name: this.kmsKeyPath
    });
    // Convert to Ethereum address...
    return deriveAddress(publicKey.pem);
  }

  async signTransaction(tx) {
    const serialized = serializeTransaction(tx);
    const digest = keccak256(serialized);
    
    // Sign in KMS. Key never leaves hardware.
    const [response] = await this.kmsClient.asymmetricSign({
      name: this.kmsKeyPath,
      digest: { sha256: digest }
    });
    
    return assembleSignature(response.signature, tx);
  }
}
```

This plugs directly into ethers.js v6. Every method that expects a signer, `sendTransaction`, `signMessage`, `signTypedData`, works with `KmsSigner` as a drop-in replacement. Your existing code barely changes. Your security transforms completely.

### Using It

```javascript
const signer = new KmsSigner(
  provider,
  'projects/gen-lang-client-0700091131/locations/global/keyRings/mr-tee-keyring/cryptoKeys/agent-wallet/cryptoKeyVersions/1'
);

// Sign and send like normal. Key never leaves HSM.
const tx = await signer.sendTransaction({
  to: '0xRecipient...',
  value: parseEther('0.01')
});
```

Same API. Same developer experience. Completely different security model.

---

## Secret Manager Integration: 57 Secrets, Zero Hardcoding

Your wallet key is your most critical secret. But it's not your only one.

We manage 57 secrets in production. API keys, authentication tokens, database credentials, service accounts. Every single one lives in GCP Secret Manager. Zero are hardcoded. Zero are in `.env` files on disk.

### The Architecture

```
GCP Secret Manager (57 secrets)
  ├── API keys (OpenAI, Anthropic, etc.)
  ├── Auth tokens (GitHub, Twitter, etc.)
  ├── Service credentials (databases, APIs)
  └── Platform tokens (Telegram, Discord, etc.)

GPG Encrypted Files (5 secrets)
  ├── Farcaster custody key (pair 1)
  ├── Farcaster signer key (pair 1)
  ├── Farcaster custody key (pair 2)
  ├── Farcaster signer key (pair 2)
  └── Farcaster backup key
  
GCP Cloud KMS (1 key)
  └── Primary wallet private key (HSM)
```

Three tiers. Each matched to the value of what it protects.

### The Fetch Script

Our `workspace/scripts/fetch-secrets.py` pulls all 57 secrets from GCP Secret Manager in parallel using 10 workers. It runs before every sensitive operation. Every cron job. Every deployment.

```python
# Simplified version of our fetch pattern
from concurrent.futures import ThreadPoolExecutor
from google.cloud import secretmanager

client = secretmanager.SecretManagerServiceClient()

def fetch_secret(secret_id):
    name = f"projects/gen-lang-client-0700091131/secrets/{secret_id}/versions/latest"
    response = client.access_secret_version(name=name)
    return secret_id, response.payload.data.decode("utf-8")

# Fetch all 57 secrets in parallel
with ThreadPoolExecutor(max_workers=10) as executor:
    secrets = dict(executor.map(fetch_secret, SECRET_IDS))
```

### The Pattern

Every time our agent starts, every time a cron job runs, every time we deploy:

1. **Fetch** fresh secrets from Secret Manager.
2. **Source** them into the environment.
3. **Use** them for the current operation.
4. **Never commit** them to any file, any repo, any log.

```bash
# Our cron pattern
cd workspace && bash scripts/fetch-secrets.sh && source ~/.openclaw/.env && run-agent
```

Secrets are always fresh. Always pulled from the source of truth. Never stale. Never cached on disk in plaintext.

### GPG for Farcaster Keys

Our 5 Farcaster private keys use GPG instead of Secret Manager. Why? They're lower value (no funds at risk), they rotate more frequently, and GPG gives us faster local rotation without API calls.

The pattern is strict:

```bash
# Decrypt in memory. NEVER write to disk.
FARCASTER_KEY=$(gpg --quiet --batch --decrypt ~/.openclaw/.env.secrets.gpg | grep CUSTODY_KEY)
```

The decrypted value exists only in the shell's memory. When the process exits, it's gone. No temp files. No logs. No traces.

---

## Key Rotation: When and How

Keys don't last forever. Even perfect security has a shelf life. Here's when to rotate and how fast you need to move.

### Immediate Rotation Triggers

Rotate now. Not tomorrow. Now.

- **Leak detected:** Key appeared in logs, git history, error output, anywhere.
- **Suspicious transaction:** Any transaction you didn't authorize.
- **Server breach:** Any unauthorized access to your infrastructure.
- **Dependency compromise:** A package in your supply chain was malicious.
- **Team change:** Anyone with access leaves the project.

### GPG Rotation (5 Minutes)

For our Farcaster keys and similar low-value secrets:

1. Generate new key pair on the target platform.
2. Encrypt the new key with GPG.
3. Replace the encrypted file.
4. Update any references.
5. Test. Verify. Done.

Total time: about 5 minutes. We can do this during a coffee break.

### KMS Rotation (30 Minutes)

For the primary wallet:

1. Create a new key version in the KMS keyring.
2. Derive the new Ethereum address from the new public key.
3. Transfer any remaining funds from old address to new address.
4. Update all references (config, on-chain registrations, ENS).
5. Disable the old key version in KMS.
6. Monitor for any missed references.

Total time: about 30 minutes. Most of that is updating external references.

```bash
# Create new key version
gcloud kms keys versions create \
  --key agent-wallet \
  --keyring mr-tee-keyring \
  --location global \
  --algorithm ec-sign-secp256k1-sha256 \
  --protection-level hsm

# The new version auto-generates a new key inside the HSM
# Old version still works until you disable it
```

### Social Rotation: The Part Everyone Forgets

When your wallet address changes, your on-chain identity needs to follow. This is the step most people skip, and it causes chaos.

Update these:
- **ERC-8004 registry:** Update the owner/operator address.
- **ENS records:** Point your `.eth` name to the new address.
- **Agent card:** Update the payment address in your A2A agent card.
- **Platform profiles:** Any service that references your wallet.
- **Attestations:** Re-issue any signed attestations from the new key.

When we rotated on Feb 18, we updated our ERC-8004 registration (agent #18608), our ENS (mr-tee.eth), and our A2A endpoint at `a2a.teeclaw.xyz`. It took 30 minutes. But if we'd skipped it, clients would have been sending payments to a compromised address.

---

## Real Numbers: What Security Actually Costs

Let's kill the excuse that "security is expensive." Here's what we actually pay:

| Component | Monthly Cost | What It Protects |
|-----------|-------------|------------------|
| GCP Cloud KMS (HSM) | $1.00 | Primary wallet private key |
| GCP Secret Manager | ~$0.06 | 57 API keys and tokens |
| GPG | $0.00 | 5 Farcaster private keys |
| **Total** | **~$1.06/month** | **Everything** |

$1.06 per month. That's the cost of not getting hacked.

Now let's look at the other side:

| Scenario | Cost |
|----------|------|
| Our compromise (caught in 5 min) | $0 lost |
| Average agent wallet hack | $50,000 - $500,000 |
| Worst case (full drain + reputation) | Business-ending |

The math is simple. $1.06/month in prevention, or $50,000+ in damages. This isn't a hard decision.

We spent $0 on losses because we spent $1 on prevention. The agents who don't spend that dollar? They're the ones writing post-mortems about how they lost their entire treasury through a leaked `.env` file.

---

## The Checklist: Secure Your Agent in 48 Hours

You've read the war story. You've seen the hierarchy. You know the costs. Now do it.

Here's your 48-hour security sprint:

### Day 1: Foundations (4 hours)

- [ ] **Enable GCP Cloud KMS** for your primary wallet. Create a keyring, create an HSM-protected signing key, derive your new Ethereum address.
- [ ] **Move all credentials to Secret Manager.** Every API key, every token, every credential. No exceptions.
- [ ] **GPG-encrypt any remaining private keys** that aren't in KMS (Farcaster, backup keys, etc.).
- [ ] **Delete all plaintext `.env` files.** Search your entire project for exposed secrets. `grep -r "PRIVATE_KEY" .` and destroy every match.

### Day 2: Validation (4 hours)

- [ ] **Test KMS signing** with a real transaction. Send a small amount. Verify the signature. Confirm it works end-to-end.
- [ ] **Document your rotation procedure.** Write it down. When things go wrong at 3 AM, you won't be able to think clearly.
- [ ] **Set up monitoring.** Alert on failed authentication attempts, unusual signing requests, any access to secrets outside normal patterns.
- [ ] **Add `.env*` to `.gitignore`.** Then audit your git history. `git log --all --full-history -- "*.env"` will show you if you've ever committed secrets.

### Day 3 and Beyond: Maintenance

- [ ] **Review access logs** weekly. Who accessed which secrets?
- [ ] **Rotate GPG keys** quarterly (or on any team change).
- [ ] **Test your rotation procedure** with a dry run. Don't wait for a real emergency.
- [ ] **Keep your fetch script updated.** As you add new secrets, add them to the parallel fetch.

---

## The Bottom Line

On February 18, 2026, at 3:47 AM, we learned that security isn't optional. It's not a nice-to-have. It's not something you do after your first big client. It's the foundation that makes everything else possible.

Our compromised wallet `0x1348...7e41` taught us a lesson worth more than whatever an attacker could have stolen: **plaintext keys are not a temporary solution. They're a permanent vulnerability you haven't been punished for yet.**

Our new wallet `0x1Af5...7e78` runs on hardware that can't be extracted, software that can't be compromised, and a pattern that can't be shortcut. The key has never existed outside Google's HSM. It never will.

This setup costs $1.06 per month. It protects every dollar we earn.

Your `.env` file is a ticking time bomb. The question isn't whether it'll explode. The question is whether you'll defuse it before it does.

Spend the dollar. Set up KMS. Move your secrets to Secret Manager. Encrypt what's left with GPG. Do it this week.

Because at 3:47 AM on some future morning, you don't want to be the one staring at a transaction you didn't sign.

---

---

## Frequently Asked Questions

**Q: Can I use AWS KMS or Azure Key Vault instead of GCP?**
Yes. AWS KMS and Azure Key Vault both support HSM-backed keys with secp256k1 signing. The pattern is identical: generate key in HSM, sign remotely, never extract. We use GCP because our infrastructure already lives there. Pick whatever cloud you're already on.

**Q: What if I can't afford cloud infrastructure at all?**
GPG encryption is free and dramatically better than plaintext. Start there. Encrypt your keys with `gpg --symmetric --cipher-algo AES256`, decrypt only in memory, never write plaintext to disk. Upgrade to KMS when you start handling real revenue.

**Q: How do I know if my key has already been compromised?**
Monitor your wallet for transactions you didn't initiate. Set up alerts on Etherscan or Basescan for your address. Check your git history: `git log --all -p | grep -i "private_key"`. If you find your key in any commit, ever, assume it's compromised and rotate immediately.

**Q: Does KMS add latency to transactions?**
Minimal. KMS signing adds roughly 50-200ms per signature depending on region. For agent operations, this is negligible. You're not running a high-frequency trading bot. You're signing service payments.

**Q: What happens if Google goes down?**
Your key is replicated across Google's HSM infrastructure. Regional outages don't affect global keyrings. If all of Google Cloud goes down simultaneously, you have bigger problems than signing transactions, and so does half the internet.

---

> **Disclaimer:** This chapter documents our actual security setup and is shared for educational purposes. Cryptocurrency and wallet security involve real financial risk. Always test with small amounts first. Security configurations should be reviewed by qualified professionals for your specific threat model. We are not liable for losses resulting from implementations based on this guide.

---

*Next chapter: "Getting Paid: Payment Protocols and Revenue Architecture"*

*Previous chapter: [Chapter 2 - Multi-Registry Strategy](chapter-02-multi-registry.md)*
