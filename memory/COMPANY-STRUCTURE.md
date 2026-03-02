# Multi-Agent Company Structure

**Implemented:** 2026-02-28

## File Strategy

| File | Shared or Separate? | Why? |
|------|-------------------|------|
| **IDENTITY.md** | ✅ Separate | Each agent has distinct name/role for messaging platforms |
| **SOUL.md** | ✅ Separate | Distinct personalities and execution styles per department |
| **AGENTS.md** | 📋 Shared | Company directory - everyone knows who the others are |
| **USER.md** | 📋 Shared | All agents know 0xd is the owner and their preferences |

## Agent Locations

Each agent has their own `agentDir` with identity files:

```
~/.openclaw/agents/
├── teeclaw/agent/
│   ├── IDENTITY.md (Mr. Tee, CEO)
│   └── SOUL.md     (CEO orchestrator personality)
├── teecode/agent/
│   ├── IDENTITY.md (TeeCode, CTO)
│   └── SOUL.md     (Engineering precision)
├── teesocial/agent/
│   ├── IDENTITY.md (TeeSocial, CCO)
│   └── SOUL.md     (Brand voice guardian)
├── teemarketing/agent/
│   ├── IDENTITY.md (TeeMarketing, Director)
│   └── SOUL.md     (Strategic measurement)
└── teedesign/agent/
    ├── IDENTITY.md (TeeDesign, Lead)
    └── SOUL.md     (Design systems discipline)
```

## Shared Workspace

All agents collaborate in: `/home/phan_harry/.openclaw/workspace`

**Shared files:**
- AGENTS.md (company directory)
- USER.md (owner info)
- TOOLS.md (infrastructure notes)
- WORKFLOW.md (execution playbook)
- DESIGN-SYSTEM.md (frontend standards)
- All skills and scripts

**Department memory files:**
- `memory/YYYY-MM-DD-teeclaw.md`
- `memory/YYYY-MM-DD-teecode.md`
- `memory/YYYY-MM-DD-teesocial.md`
- `memory/YYYY-MM-DD-teemarketing.md`
- `memory/YYYY-MM-DD-teedesign.md`

## Delegation Flow

**TeeClaw (CEO) → Departments:**

```javascript
sessions_send({
  sessionKey: "agent:teecode:main",
  message: "Clear task with deliverables"
})
```

Then monitor, integrate results, report to 0xd.

## Nightly Consolidation

**Time:** 03:00 UTC+7 (20:00 UTC)  
**Agent:** TeeClaw  
**Process:** Read all 5 department logs → extract insights → update MEMORY.md

## Benefits

✅ Distinct personalities per department  
✅ Clear name/role in messaging platforms  
✅ Shared company knowledge (AGENTS.md)  
✅ Parallel memory writes (no conflicts)  
✅ Strategic synthesis (CEO consolidates)
