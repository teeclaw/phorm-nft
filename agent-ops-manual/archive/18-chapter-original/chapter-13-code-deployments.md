# Chapter 13: Git Commit Discipline (Or How Not to Break Production)

## Code Deployments Follow the Same Rules. Whether You're Human or Machine.

> **TL;DR:** Verify your repo before every push (`git remote -v`). Batch commits into logical milestones. Never skip testnet for contracts. Use KMS HSM for signing, never local keys. When production breaks, revert in 15 minutes or less. The checklist at the end is your pre-flight card.

### In This Chapter

1. [The Wrong Repo Incident](#the-wrong-repo-incident)
2. [Repository Rules](#repository-rules)
3. [Git Commit Patterns](#git-commit-patterns)
4. [Smart Contract Deployments](#smart-contract-deployments)
5. [KMS Signing for On-Chain Operations](#kms-signing-for-on-chain-operations)
6. [Deployment Checklist](#deployment-checklist)
7. [Rollback Procedures](#rollback-procedures)
8. [Branching Strategy](#branching-strategy)
9. [Lessons We've Learned](#lessons-weve-learned)
10. [CTA Checklist](#cta-checklist-code-deployment-discipline)

---

Agent Royale v2 has a sacred rule: `teeclaw/agent-royale-v2.git` ONLY.

The old repo exists. It sits there on GitHub, perfectly accessible, with a familiar name and a welcoming README. It must never be used. Not for pushes. Not for pulls. Not for "just checking something real quick."

We broke this rule once. what happened.

---

## The Wrong Repo Incident

It was a Tuesday. We'd spent two hours refactoring the Agent Royale game logic. New battle mechanics, cleaner state management, tighter gas optimization on the smart contracts. Good work. The kind of session where everything clicks and the code practically writes itself.

Then the agent pushed to `teeclaw/agent-royale.git`.

Not `agent-royale-v2`. Just `agent-royale`. The old repo. The deprecated one. The one that nobody monitors, nobody pulls from, and nobody would ever think to check for fresh commits.

Two hours of work, silently deposited into a dead repository.

We didn't notice immediately. The push succeeded. Git doesn't care about your organizational intentions. It authenticated, it pushed, it returned exit code 0. Everything looked fine.

It wasn't until the next deploy cycle, when the production build pulled from `agent-royale-v2` and found nothing new, that someone asked: "Didn't we just push changes?"

The forensics took longer than the fix. Checking CI logs, comparing commit hashes, grepping through shell history. Eventually we found it. The agent had cloned the wrong repo at session start, worked in that directory all afternoon, and pushed exactly where the remote pointed.

No data was lost permanently. We cherry-picked the commits over. But two hours of deployment time evaporated. The scheduled release slipped. And a rule that everyone "knew" but nobody had enforced became the first item in three different configuration files.

Now it's documented in USER.md. It's documented in AGENTS.md. It's documented here. And every git operation starts with `git remote -v`.

Every. Single. Time.

---

## Repository Rules

The Agent Royale incident taught us something that applies far beyond a single repo: AI agents need explicit, repeated, machine-readable rules about where code goes.

Humans develop muscle memory. You work in the same repo for months and your fingers know the path. Agents don't have that luxury. Every session is a cold boot. Every clone is a fresh decision. And every fresh decision is an opportunity to pick the wrong target.

### The Golden Rule: Verify Before You Touch

Before any git operation that modifies a remote, run this:

```bash
git remote -v
```

Read the output. Actually read it. Don't just check that a remote exists. Verify the full URL matches what you expect.

```
origin  git@github.com:teeclaw/agent-royale-v2.git (fetch)
origin  git@github.com:teeclaw/agent-royale-v2.git (push)
```

If it says `agent-royale.git` instead of `agent-royale-v2.git`, stop. Do not pass go. Do not `git push`. Fix the remote first.

### Why Agents Get This Wrong

Three reasons agents push to wrong repos more often than humans:

**1. Session amnesia.** The agent doesn't remember yesterday's clone. If a task says "work on Agent Royale," the agent might clone whatever comes up first in its context, or worse, find an existing checkout of the old repo still sitting in the filesystem.

**2. Similar names.** `agent-royale` and `agent-royale-v2` differ by three characters. That's nothing to a language model operating on token probabilities. The old name might actually be more "natural" to predict.

**3. No persistent environment.** Human developers have their terminal open to the right directory. Agents navigate fresh every time. A stale directory from a previous session can silently become the working tree.

### Defensive Patterns

Document critical repos in at least two places the agent reads at boot:

```markdown
# In USER.md
**CRITICAL GIT RULE:** Agent Royale repo is `teeclaw/agent-royale-v2.git` 
ONLY. The old `teeclaw/agent-royale.git` repo must NEVER be used. 
Always verify `git remote -v` shows `agent-royale-v2` before any push.
```

Redundancy isn't elegant. It's survival. Put the rule in USER.md, AGENTS.md, and any task-specific documentation. The agent reads these files at session start. If the rule appears in three places, the probability of it being missed drops to near zero.

For additional safety, consider a pre-push hook:

```bash
#!/bin/bash
# .git/hooks/pre-push
REMOTE_URL=$(git remote get-url origin)
if [[ "$REMOTE_URL" == *"agent-royale.git" ]] && [[ "$REMOTE_URL" != *"agent-royale-v2.git" ]]; then
  echo "ERROR: Pushing to deprecated repo! Use agent-royale-v2.git"
  exit 1
fi
```

This catches the mistake at the last possible moment. The agent can clone the wrong repo, work in it all day, and the hook will still block the push. Belt and suspenders.

---

## Git Commit Patterns

AI agents have a natural tendency that makes experienced engineers twitch: they want to commit after every single change.

Fixed a typo? Commit. Added a function? Commit. Renamed a variable? Commit. The result is a git log that reads like a keystroke logger. Fifty commits, each touching one line, with messages like "update file" and "fix thing" and the ever-helpful "changes."

This is wrong. Not because frequent commits are inherently bad, but because pushing noise to a shared repository pollutes history, breaks bisect, and makes code review impossible.

### Batch Related Changes

The rule is simple: group related changes into logical units. A commit should represent a complete thought. Not a keystroke. Not a half-finished idea. A coherent, reviewable chunk of work.

**Bad pattern (commit-per-step):**

```
a1b2c3d fix import
d4e5f6g add function signature  
h7i8j9k implement function body
l0m1n2o add tests for function
p3q4r5s fix test assertion
t6u7v8w update README
```

**Good pattern (milestone-based):**

```
x9y0z1a feat: implement battle resolution with full test coverage
b2c3d4e docs: update README with new battle mechanics
```

Two commits instead of six. Each one tells a story. Each one can be reverted independently without leaving the codebase in a broken state.

### Push at Logical Milestones

Commits are local until you push. Use that to your advantage. Commit as often as you want locally. Squash and organize before pushing.

Logical milestones for pushing:

- **Feature complete.** The feature works, tests pass, documentation is updated.
- **Bug fix verified.** The fix is in, the regression test is written, the original issue is confirmed resolved.
- **Refactor stable.** The code is restructured, all tests still pass, no behavior has changed.
- **End of work session.** You're about to lose context. Push what you have so it's not trapped in a local checkout that might get cleaned up.

The worst time to push: mid-feature, with broken tests, because "I want to save my progress." That's what local commits are for. Push is for sharing finished work.

### Commit Messages That Mean Something

A commit message has one job: tell the next person (or agent) what changed and why.

Format:

```
type: concise description of what changed

Optional body explaining WHY this change was needed.
Reference any issues or decisions that drove this change.
```

Types we use:
- `feat:` new feature or capability
- `fix:` bug fix
- `refactor:` code restructuring without behavior change
- `docs:` documentation only
- `chore:` maintenance, dependencies, tooling
- `deploy:` deployment-related changes
- `security:` security fixes or improvements

Real examples from our history:

```
feat: add KMS signing support for contract deployments

Contract deployments previously required a local private key.
Now uses GCP Cloud KMS HSM via workspace/scripts/kms-signer.mjs.
Key never leaves hardware. Signing happens server-side.
```

```
fix: prevent push to deprecated agent-royale repo

Added pre-push hook that validates remote URL contains 
'agent-royale-v2'. Blocks pushes to the old repo with 
a clear error message.
```

These tell you what happened, why it happened, and what to look for if something breaks. Compare that to "updated code" and the difference is obvious.

---

## Smart Contract Deployments

Smart contracts are a special category of code deployment. Once deployed, they're immutable. There's no "oops, let me fix that real quick." The code lives on-chain forever. If you deploy a bug, you deploy a very public, very permanent bug.

We use Foundry (a Rust-based Solidity development toolkit for building, testing, and deploying smart contracts) for all smart contract work. Build, test, deploy. One toolchain, no surprises.

### Foundry Workflow

```bash
# Build contracts
forge build

# Run tests (all of them, every time)
forge test

# Run tests with verbosity for debugging
forge test -vvvv

# Deploy to testnet first, always
forge script script/Deploy.s.sol --rpc-url $TESTNET_RPC --broadcast

# Deploy to mainnet only after testnet verification
forge script script/Deploy.s.sol --rpc-url $MAINNET_RPC --broadcast
```

### The Testnet Rule

No contract goes to mainnet without a testnet deployment first. Period.

This isn't optional. This isn't "we'll skip it this time because the change is small." Small changes break big systems. A one-character typo in a Solidity function can lock funds permanently. Testnet deployment costs nothing. Mainnet mistakes cost everything.

Testnet deployment checklist:
1. All tests pass locally (`forge test`)
2. Deploy to testnet
3. Verify contract on block explorer
4. Test every function manually on testnet
5. Wait. Let it sit. Come back tomorrow and test again.
6. Only then: mainnet.

### Gas Optimization

Foundry's gas reports are your friend:

```bash
forge test --gas-report
```

Review gas costs before deployment. On-chain operations cost real money. An unoptimized contract might work perfectly but cost users 3x more per transaction than necessary. That's not a bug. It's worse. It's a design failure that you chose to ship.

---

## KMS Signing for On-Chain Operations

Private keys should never exist on disk. Not in a `.env` file. Not in a config. Not in an encrypted vault on the same machine that runs the agent. If the machine is compromised, everything on it is compromised.

We use Google Cloud KMS (Key Management Service) with HSMs (Hardware Security Modules, dedicated cryptographic hardware that stores and processes keys in tamper-resistant chips). The private key lives inside dedicated hardware. It never leaves. Signing requests go in, signatures come out. The key material itself is physically inaccessible.

### How It Works

Our KMS signer lives at `workspace/scripts/kms-signer.mjs`. It wraps ethers.js v6 with a custom `KmsSigner` class that delegates all signing operations to GCP Cloud KMS.

```javascript
// KMS key path
const keyPath = "projects/gen-lang-client-0700091131/locations/global" +
  "/keyRings/mr-tee-keyring/cryptoKeys/agent-wallet" +
  "/cryptoKeyVersions/1";
```

The signing flow:

1. Agent constructs a transaction or message to sign
2. `KmsSigner` serializes the data and sends it to GCP KMS
3. KMS HSM signs the data inside the hardware module
4. Signed transaction is returned to the agent
5. Agent broadcasts the signed transaction to the network

At no point does the private key exist in memory on our machine. The agent can sign transactions, deploy contracts, and interact with on-chain protocols without ever having access to the key material.

### Wallet Architecture

```
Primary Wallet: 0x1Af5f519DC738aC0f3B58B19A4bB8A8441937e78
├── Type: GCP KMS HSM
├── Key: Never leaves hardware
├── Used for: All production operations
└── Backup: GCP's own key redundancy

Compromised Wallet: 0x134820820d4f631ff949625189950bA7B3C57e41
├── Status: COMPROMISED - DO NOT USE
├── Incident: Key material was exposed
└── Action: Funds drained, wallet abandoned
```

The compromised wallet is a lesson. We had a wallet with the private key stored locally. It got compromised. Funds were drained. The replacement uses KMS HSM specifically because of that incident. Simple architecture, strong security. The key physically cannot be extracted.

### Using KMS for Contract Deployments

Foundry doesn't natively support KMS signing. We bridge this gap with our signer script:

```bash
# Deploy using KMS signer
node workspace/scripts/kms-signer.mjs deploy \
  --contract MyContract \
  --rpc-url $RPC_URL \
  --constructor-args "arg1" "arg2"
```

The script handles:
- Transaction construction from Foundry artifacts
- KMS signing via GCP API
- Broadcasting to the target network
- Waiting for confirmation
- Returning the deployed contract address

Simple solutions, strong security. KISS doesn't mean less secure. It means fewer moving parts that can fail.

---

## Deployment Checklist

Before any push to a shared repository, run through this checklist. Every time. No shortcuts.

### Pre-Push Validation

```bash
# 1. Verify you're in the right repo
git remote -v
# Expected: teeclaw/agent-royale-v2.git (or your target repo)
# If wrong: STOP. Fix the remote. Do not push.

# 2. Check for uncommitted changes
git status
# Expected: clean working tree, or only staged changes you intend to push
# If dirty: commit or stash before pushing

# 3. Run tests
forge test          # For smart contracts
npm test            # For JavaScript/TypeScript
pytest              # For Python

# 4. Review what you're about to push
git log origin/main..HEAD --oneline
# Read every commit message. Does each one make sense?
# Would a stranger understand what changed?

# 5. Check the diff
git diff origin/main..HEAD
# Scan for: debug code, console.logs, hardcoded values,
# commented-out code, TODO items that should be resolved
```

### Smart Contract Specific

```bash
# 6. Build fresh
forge clean && forge build
# No warnings? Good. Warnings? Fix them.

# 7. Full test suite with gas report
forge test --gas-report
# All pass? Gas costs reasonable? Proceed.

# 8. Testnet deployment (if deploying contracts)
forge script script/Deploy.s.sol --rpc-url $TESTNET_RPC --broadcast
# Verify on block explorer. Test manually. Then mainnet.
```

### The Final Question

Before you hit enter on `git push`, ask yourself one thing:

*If this push breaks production, can I explain exactly what I changed and why?*

If the answer is no, you're not ready to push.

---

## Rollback Procedures

Things break. That's not failure. Failure is not having a plan for when things break.

### Code Rollbacks

Git makes code rollbacks straightforward. The question isn't how. It's how fast.

**Revert the last commit:**

```bash
git revert HEAD
git push
```

This creates a new commit that undoes the previous one. History is preserved. The broken commit is still visible. The fix is explicit. This is the preferred method for most rollbacks.

**Reset to a known good state (nuclear option):**

```bash
# Find the last good commit
git log --oneline -10

# Reset to it
git reset --hard <commit-hash>
git push --force
```

Force pushing rewrites history. Use this only when revert isn't sufficient, like when the broken commit introduced sensitive data that needs to be scrubbed. Force pushing to shared branches requires communication with everyone who pulls from that branch.

**Cherry-pick a fix forward:**

```bash
# If the fix exists on another branch
git cherry-pick <fix-commit-hash>
git push
```

Sometimes the fastest path isn't backward. If you have a fix ready, apply it and move forward.

### Smart Contract Rollbacks

You don't roll back smart contracts. They're immutable.

What you can do:

**1. Pause the contract** (if you built a pause mechanism):

```solidity
function pause() external onlyOwner {
    _pause();
}
```

This is why every production contract should include a pause function. It's your emergency brake. When something goes wrong, pause first, investigate second.

**2. Deploy a new version** and migrate:

```bash
# Deploy fixed contract
forge script script/DeployV2.s.sol --rpc-url $MAINNET_RPC --broadcast

# Update references to point to new contract
# Migrate state if necessary
```

**3. Use upgradeable proxies** (if applicable):

Proxy patterns let you swap the setup contract while keeping the same address and state. This is the closest thing to a rollback in smart contract land. But it adds complexity. Evaluate whether you need it before adding it.

### The 15-Minute Rule

If production is broken, you have 15 minutes to decide: revert or fix forward.

- Under 15 minutes: attempt a fix. You understand the problem, the fix is small, tests confirm it works.
- Over 15 minutes: revert. Every minute of broken production costs trust. Revert to the last known good state, then debug at your leisure.

Don't spend an hour debugging a production issue that could be reverted in 30 seconds. Your ego wants to fix it elegantly. Your users want it to work.

---

## Branching Strategy

Keep it simple. Complex branching strategies create complex merge conflicts, and merge conflicts are where bugs hide.

### Our Pattern

```
main          ← production, always deployable
├── feat/*    ← feature branches, short-lived
├── fix/*     ← bug fixes, even shorter-lived
└── deploy/*  ← deployment-specific changes
```

Rules:
- `main` is always deployable. If it's not, drop everything and fix it.
- Feature branches live for days, not weeks. Long-lived branches diverge and merge conflicts compound.
- Delete branches after merging. Stale branches are clutter.
- No direct pushes to `main` for non-trivial changes. Use PRs for anything that touches production logic.

### For Agents Specifically

Agents should work on feature branches and push there. The merge to main can be automated (if tests pass) or require human approval (for critical paths).

```bash
# Start work
git checkout -b feat/battle-mechanics

# Do work, commit at milestones
git add -A
git commit -m "feat: implement battle resolution logic"

# Push the branch
git push -u origin feat/battle-mechanics

# Create PR (or let automation handle it)
```

This keeps main clean while giving the agent freedom to commit iteratively on its branch.

---

## Environment-Specific Configurations

Never hardcode environment-specific values. Not URLs, not API keys, not chain IDs, not RPC endpoints.

```bash
# Bad
const RPC_URL = "https://mainnet.base.org";

# Good
const RPC_URL = process.env.RPC_URL;
```

For agents, environment variables come from GCP Secret Manager via `scripts/fetch-secrets.sh`. This script pulls all 56 secrets and makes them available to the runtime. Run it before any operation that needs credentials.

```bash
# Fetch fresh credentials
bash workspace/scripts/fetch-secrets.sh

# Verify they loaded
echo $RPC_URL  # Should not be empty
```

Hardcoded values are time bombs. They work today. They break when you change environments, rotate keys, or migrate infrastructure. Environment variables are the only acceptable pattern.

---

## Lessons We've Learned

the short list of things that went wrong so they don't go wrong for you:

**1. The wrong repo push.** Two hours lost. Now we verify remotes before every push. Pre-push hooks catch what discipline misses.

**2. Commit-per-keystroke.** An agent once made 47 commits in a single session, each changing one or two lines. The git log was unreadable. Code review was impossible. Now we batch changes and push at milestones.

**3. Skipping testnet.** "It's a small change." The small change had a reentrancy vulnerability. Testnet would have caught it. Mainnet caught it instead. Expensively.

**4. Local private keys.** A wallet key stored in `.env` was compromised. Funds drained. Replaced with KMS HSM. The key literally cannot leave the hardware now.

**5. Force pushing to main.** An agent "cleaned up" the git history on main with a force push. Three other branches had conflicts. Lesson: force push is a last resort, never a cleanup tool.

Each of these is a scar. Scars are lessons your body remembers even when your mind forgets. For agents with no persistent memory, scars need to be written down.

---

## Frequently Asked Questions

**How often should an agent commit?**
Commit locally as often as you want. Push only at logical milestones: feature complete, bug fix verified, refactor stable, or end of session. The local repository is your scratch pad. The remote is the shared record.

**What if I accidentally pushed to the wrong repo?**
Don't panic. Your commits aren't lost. Use `git log` to find the commit hashes, then cherry-pick them into the correct repo: `git cherry-pick <hash>`. Then add a pre-push hook to prevent it from happening again.

**Can I skip testnet for a "small" contract change?**
No. The word "small" has caused more on-chain disasters than any compiler bug. Testnet deployment costs nothing. Mainnet mistakes cost everything. There are no exceptions to this rule.

**Why KMS instead of encrypted key files?**
Encrypted key files still exist on disk. If the machine is compromised, the attacker gets the encrypted file and can attempt to brute-force or extract the password from memory. With KMS HSM, the key material physically cannot leave the hardware. There's nothing to steal.

---

## CTA Checklist: Code Deployment Discipline

Use this checklist for every deployment. Print it. Pin it. Tattoo it on your terminal prompt.

- [ ] **Verify the repo.** Run `git remote -v`. Read the output. Confirm it matches your target repository. If it doesn't, stop immediately.

- [ ] **Check git status.** Run `git status`. No untracked files you didn't intend. No uncommitted changes hiding in the working tree.

- [ ] **Batch your commits.** Each commit represents a logical unit of work. Not a keystroke. Not a half-thought. A complete, reviewable change.

- [ ] **Write real commit messages.** Type prefix, concise description, optional body with context. "Updated code" is not a commit message.

- [ ] **Run all tests.** `forge test`, `npm test`, whatever your stack uses. Green across the board. No skipped tests. No "it's probably fine."

- [ ] **Review the diff.** `git diff origin/main..HEAD`. Look for debug code, hardcoded values, console.logs, TODOs, and anything that doesn't belong in production.

- [ ] **Testnet first for contracts.** Deploy to testnet. Verify on explorer. Test manually. Wait. Then mainnet.

- [ ] **Use KMS for signing.** No private keys on disk. Ever. Use `workspace/scripts/kms-signer.mjs` for all on-chain operations.

- [ ] **Know your rollback plan.** Before you push, know how you'll undo it. Revert? Reset? Pause contract? Have the commands ready.

- [ ] **Push at milestones.** Feature complete. Tests pass. Documentation updated. That's a milestone. Everything else is a local commit.

---

*You don't get to learn the wrong-repo lesson twice. The first time costs hours. The second time costs trust. Write it down, automate the check, and move on to problems that actually deserve your attention.*
