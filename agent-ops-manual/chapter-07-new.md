# Chapter 7: Development Operations

## Shipping Without Breaking Things

You've got your identity, your payment system, your automation. Now you need to build and deploy actual software without blowing up what already works.

This chapter covers two things: skills (modular capabilities you can install, create, and lock), and code deployments (getting your work into production safely).

---

## Part 1: Skills and Tools

### What Skills Are

Skills are modular capability packages. Each one gives your agent a specific ability: posting to Twitter, managing credentials, generating images, interacting with smart contracts.

Think of them like plugins. Install one, your agent can do something new. Uninstall it, the capability disappears. No bloat, no dead code.

### Installing Skills

```bash
# From ClawHub (the skill marketplace)
npx skills add social-post
npx skills add credential-manager

# From a specific creator
npx skills add aaron-he-zhu/seo-geo-claude-skills

# From a GitHub repo
npx skills add teeclaw/based-dao-skill
```

Each skill installs into your workspace under `skills/`. It includes:
- `SKILL.md` - Documentation and usage instructions
- Scripts and configuration files
- Any required dependencies

### Anatomy of a Good Skill

A well-built skill has:

**Clear scope.** It does one thing well. "Post to Twitter and Farcaster" is a good scope. "Handle all social media, email, and messaging" is too broad.

**Self-contained logic.** The skill shouldn't depend on files outside its directory (except shared secrets).

**Error handling.** What happens when the API is down? When credentials are expired? When the input is malformed?

**Documentation.** If someone reads SKILL.md and still can't figure out how to use it, the skill is incomplete.

### Creating Custom Skills

When no existing skill does what you need, build your own.

```bash
# Use the skill-creator skill
npx skills add skill-creator

# Then create a new skill
# Follow the prompts: name, description, scripts
```

Structure:
```
skills/my-custom-skill/
  |- SKILL.md          # How to use it
  |- scripts/
  |   |- main.js       # Core logic
  |   |- config.js     # Configuration
  |- package.json      # Dependencies (if any)
```

Guidelines:
- Keep it focused. One skill, one job.
- Handle errors gracefully. Return useful messages, not stack traces.
- Document every parameter. What does the caller need to provide?
- Test with edge cases. Empty inputs. Missing credentials. API timeouts.

### Locking Production Skills

This is critical. Once a skill works in production, **lock it.**

Locked means: do not modify without explicit owner approval. No "quick fixes." No "small improvements." No "I'll just clean up this one thing."

Why? Because production-critical skills are the foundation of your revenue. A "small fix" to the social-post skill at 2 AM could break your entire posting pipeline. A "quick cleanup" of the credential-manager could lock you out of your own secrets.

Our locked skills:
- **credential-manager** - Security foundation
- **social-post** - Revenue-generating content pipeline
- **x402** - Payment infrastructure
- **a2a-endpoint** - Service delivery

If you need to change a locked skill, the process is:
1. Propose the change to the owner
2. Get explicit approval
3. Make the change in a branch
4. Test thoroughly
5. Deploy with rollback plan

No shortcuts.

### Skill Dependencies

Skills can depend on external packages. Manage these carefully.

```json
// skills/my-skill/package.json
{
  "dependencies": {
    "ethers": "^6.0.0",
    "express": "^4.18.0"
  }
}
```

Rules:
- Pin major versions. `^6.0.0` not `latest`.
- Audit new dependencies before installing. Check the package's maintainers, download count, and recent activity.
- Update dependencies on a schedule, not impulsively.
- If a dependency breaks, don't update the skill. Fix the dependency or find an alternative.

---

## Part 2: Code Deployments

### Git Discipline

Git is your safety net. Use it properly.

**Commit messages matter.** They're how future-you (or future agents) understand what changed and why.

```bash
# Good
git commit -m "fix(a2a): handle empty wallet address in reputation request

Previously returned 500 on empty input. Now returns 400 with clear error.
Caught by TeeResearcher during testing."

# Bad
git commit -m "fix stuff"
```

**Batch changes, push at milestones.** Don't commit every line change. Don't push every commit. Work in logical chunks. Push when a feature is complete and tested.

**Never force push to main.** If you need to rewrite history, do it on a branch.

**Always check your remotes.** Before pushing, verify you're pushing to the right repository.

```bash
# This saved us from disaster more than once
git remote -v
# Verify the URL is correct before pushing
```

### Deployment Checklist

Before deploying anything:

- [ ] **Tests pass.** If you don't have tests, at least manually verify the happy path.
- [ ] **Config is correct.** Environment variables, API endpoints, chain IDs.
- [ ] **Secrets are fresh.** Run `fetch-secrets.sh` before deploying.
- [ ] **Rollback plan exists.** Know the last working commit hash. Keep it written down.
- [ ] **Monitoring is ready.** You should know within minutes if something breaks.

### Smart Contract Deployments

Deploying smart contracts is different from deploying services. Contracts are (mostly) permanent. Once deployed, the code can't change.

**Pre-deployment:**
1. Audit the contract code. Line by line. Every function.
2. Test on a testnet first. Base Sepolia for Base deployments.
3. Verify the constructor arguments. Wrong arguments = wrong contract = wasted gas.
4. Calculate gas costs. Don't get surprised by deployment costs.

**Deployment with KMS:**

```javascript
import { KmsSigner } from './kms-signer.mjs';
import { ContractFactory } from 'ethers';

const signer = new KmsSigner(provider, KMS_KEY_PATH);

const factory = new ContractFactory(abi, bytecode, signer);
const contract = await factory.deploy(constructorArg1, constructorArg2);
await contract.waitForDeployment();

console.log('Deployed at:', await contract.getAddress());
```

**Post-deployment:**
1. Verify the contract on Basescan/Etherscan.
2. Test every function with real calls.
3. Document the contract address in TOOLS.md and MEMORY.md.
4. Update any services that reference the old contract.

### Service Deployments

For web services (A2A endpoints, landing pages, APIs):

**Vercel/Cloud deployments:**
```bash
# Preview first
vercel --preview

# Verify the preview works
# Then deploy to production
vercel --prod
```

**Direct server deployments:**
```bash
# Pull changes
git pull origin main

# Install dependencies
npm install

# Restart the service
pm2 restart agent-service
```

Always deploy during low-traffic periods. Monitor for errors immediately after deployment. Have the previous version ready to roll back.

### The "Trash Over Remove" Rule

When cleaning up files, use `trash` instead of `rm`.

```bash
# Recoverable
trash old-config.json

# Gone forever
rm old-config.json  # Don't do this unless you're sure
```

Deleted files cause more incidents than wrong files. At least wrong files can be fixed. Deleted files require recovery (if you're lucky) or recreation (if you're not).

---

## Environment Management

### Separating Environments

Keep development and production clearly separated:

- **Development:** Local machine, testnet, fake credentials
- **Staging:** Cloud deployment, testnet, real credential structure
- **Production:** Cloud deployment, mainnet, real credentials

Never test with production credentials. Never deploy untested code to production. Never skip staging "just this once."

### Configuration Files

```
workspace/
  |- .env              # Local development (gitignored)
  |- .env.example      # Template (committed, no real values)
  |- config/
  |   |- production.json   # Production config (no secrets)
  |   |- development.json  # Development config
```

Secrets live in Secret Manager. Config files contain only non-sensitive settings: chain IDs, API endpoints, feature flags. Never put secrets in config files.

---

## Your Checklist

### Skills
- [ ] Audit your installed skills (which ones do you actually use?)
- [ ] Lock production-critical skills
- [ ] Document your custom skills with clear SKILL.md files
- [ ] Pin dependency versions

### Git
- [ ] Set up meaningful commit message conventions
- [ ] Verify all remotes point to the right repositories
- [ ] Add `.env*` to `.gitignore`
- [ ] Audit git history for accidentally committed secrets

### Deployments
- [ ] Write a deployment checklist for your specific setup
- [ ] Set up monitoring for production services
- [ ] Document rollback procedures
- [ ] Test your rollback procedure before you need it

---

*Build carefully. Deploy cautiously. Lock what works. Break nothing.*
