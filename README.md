# Claude Code Dev Team

**English · [繁體中文](./README.zh-TW.md)**

> **An entire engineering team for Claude Code**
> — 8 specialized agents, 11 automation hooks, and the P7/P9/P10 methodology that keeps them disciplined.

Most people use Claude Code as a single coder. This config turns it into a full engineering org: **planner, fullstack, debugger, critic, vuln-verifier, frontend-designer, tool-expert, web-researcher** — each agent owns a role, each has its own tool permissions, and a strict delegation rulebook decides who touches what.

Backed by **corporate-culture-inspired discipline** (closure, fact-driven, exhaustiveness) and **battle-tested hooks** that catch debugger statements, hardcoded secrets, cost overruns, and MCP outages before they hit main.

---

## The Team

| Role | Agent | What they do | When they ship |
|------|-------|--------------|---------------|
| 📋 **Tech Lead** | `planner` | Breaks down fuzzy requirements into parallelizable Task Prompts with a six-element contract (goal / scope / input / output / acceptance / boundaries). Never writes code. | Task touches 3+ files or 2+ modules |
| 🛠 **Senior Engineer** | `fullstack-engineer` | Ships features using the P7 methodology: read reality → design solution → impact analysis → implement → three-question self-review → `[P7-COMPLETION]` delivery. | Single-feature or cross-module implementation |
| 🎨 **Designer** | `frontend-designer` | Builds landing pages, dashboards, and UI that doesn't look like AI slop. Opinionated aesthetic direction, refuses generic output. | New pages, UI redesigns, visual upgrades |
| 🔍 **Code Reviewer** | `critic` | Finds bugs, security holes, logic errors, edge cases, performance issues. Every finding with file path + line number. No "looks good to me". | Pre-commit, pre-deploy, pre-merge |
| 🧪 **Pentester** | `vuln-verifier` | Takes the critic's findings and writes actual PoC tests to prove the vulnerability is real — no false positives, no hand-waving. | After critic flags a security issue |
| 🐛 **Debug Engineer** | `debugger` | Reads logs, constructs hypotheses, verifies, fixes. Never guesses, always traces root cause. Includes log-analyzer. | Bug reports, service incidents, test failures |
| ⚙️ **Tool Expert** | `tool-expert` | Picks the right MCP tools, chains complex workflows, troubleshoots tool failures. Knows every integration in your stack. | MCP tool failures, complex tool chaining |
| 📚 **Researcher** | `web-researcher` | Fetches and synthesizes official docs, API specs, error code meanings. The antidote to hallucination. | Uncertain API usage, error code lookups |

Each agent is a markdown file under `agents/` with its own system prompt, tool permissions, and model selection. **Customize them. Fork them. Replace the ones you don't need.**

---

## The Workflow

```
           ┌─────────────┐
           │  Your Task  │
           └──────┬──────┘
                  │
         ┌────────▼────────┐
         │   📋 planner    │  ← Breaks into parallel subtasks
         │    (Tech Lead)   │    if touches 3+ files
         └────────┬────────┘
                  │
        ┌─────────┼─────────┐
        ▼         ▼         ▼
  ┌─────────┐ ┌─────────┐ ┌─────────┐
  │ fullstk │ │ fullstk │ │ fullstk │  ← Parallel execution
  │   × N   │ │   × N   │ │   × N   │    P7 methodology
  └────┬────┘ └────┬────┘ └────┬────┘
       └───────────┼───────────┘
                   ▼
           ┌──────────────┐
           │  🔍 critic   │  ← Mandatory pre-deploy review
           │   (reviewer)  │
           └───────┬──────┘
                   │
          ┌────────┴────────┐
          │                 │
          ▼                 ▼
   ┌──────────────┐  ┌─────────────┐
   │ 🐛 debugger  │  │   Deploy    │
   │ (if issues)  │  │             │
   └──────────────┘  └─────────────┘
```

**Security-sensitive work** takes a detour: `critic` flags → `vuln-verifier` writes PoC → fix or file PR.

---

## The Methodology

### Three Red Lines

Every agent enforces these. No exceptions. No "close enough".

- **🔒 Closure Discipline** — Every task has a clear Definition of Done. "This is probably enough" is not an ending.
- **📎 Fact-Driven** — Every judgment must cite actual code with paths and line numbers. "I guess" / "probably" / "should be" are violations.
- **✅ Exhaustiveness** — Checklists cannot be skipped. Clean items must be explicitly marked "checked, no problems" — never silently ignored.

### P7/P9/P10 Mode Switching

Not role-play. **Operating modes** that Claude switches between based on task scope:

| Scope | Mode | Behavior |
|-------|------|----------|
| Single feature | **P7** (Senior Engineer) | Design → Impact analysis → Implement → Three-question self-review → `[P7-COMPLETION]` |
| Multi-module, 3+ files | **P9** (Tech Lead) | Decompose into Task Prompts with six elements. Coding is forbidden — your output is prompts, not code. |
| Cross-team, 5+ sprints | **P10** (CTO) | Output strategy docs. Goals, success metrics, risks, timeline, resource allocation. |

### PUA Mode (High-Pressure Triggers)

The team shifts into exhaustive mode when:

- Same task failed 2+ times → write three new hypotheses, no retrying the old one
- About to say "I can't solve this" → forbidden, check docs and source
- Being passive, waiting for instructions → find the next step yourself
- User says "try harder" / "why did it fail again" → enter reflection mode
- User says "don't get slapped again" → cross-verify every assumption 3 different ways

> We don't keep idle agents. No half-finished work. No excuses.

---

## The Automation (Hooks)

Eleven automation hooks wire up at `pre-commit`, `post-tool-use`, and `stop` events. They catch problems before they ship.

| Hook | Trigger | What it catches |
|------|---------|-----------------|
| 💰 `cost-tracker.js` | After every response | Token usage + estimated cost per model (Opus / Sonnet / Haiku). Running tally in `~/.claude/stats-cache.json` |
| ✋ `commit-quality.js` | Pre-commit | Blocks commits with `debugger` statements or hardcoded secrets in JS/TS/Python files |
| 🔧 `mcp-health.js` | MCP tool failures | Detects MCP server outages and suggests restart paths |
| 🛡 `config-protection.js` | Edit/Write to critical files | Guards important config files from accidental overwrites |
| 🎨 `design-quality.js` | Frontend changes | Checks for AI-slop indicators in UI code |
| 📝 `check-console.js` | Pre-commit | Flags stray `console.log` in production paths |
| 📊 `audit-log.js` | All tool calls | Keeps an audit trail of significant tool operations |
| 🎯 `batch-format.js` | Multi-file edits | Runs formatter on modified files in batch |
| 💡 `suggest-compact.js` | Context pressure | Suggests `/compact` when context window fills up |
| 📈 `accumulator.js` | Session tracking | Accumulates session metrics |
| 🚨 `log-error.sh` | Any error | Unified error logging to `~/.claude/error-log.md` |

Each hook is a self-contained script. Enable / disable / customize in `settings.example.json`.

---

## Quick Start

```bash
git clone https://github.com/NYCU-Chung/my-claude-devteam ~/my-claude-devteam

# Backup existing config (if any)
mv ~/.claude/CLAUDE.md ~/.claude/CLAUDE.md.bak 2>/dev/null
mv ~/.claude/agents ~/.claude/agents.bak 2>/dev/null
mv ~/.claude/hooks ~/.claude/hooks.bak 2>/dev/null

# Install the team
cp ~/my-claude-devteam/CLAUDE.zh-TW.md ~/.claude/CLAUDE.md   # or CLAUDE.en.md
cp -r ~/my-claude-devteam/agents ~/.claude/
cp -r ~/my-claude-devteam/hooks ~/.claude/

# Wire up hooks
cp ~/my-claude-devteam/settings.example.json ~/.claude/settings.json
# (edit the paths to match your $HOME)

# Restart Claude Code — the team is ready
```

**Verify the install:**

```
You: "I need to add a POST endpoint for broadcast messages"
Claude: [spawns fullstack-engineer with P7 methodology]
        [designs → implements → three-question self-review]
        [spawns critic for pre-deploy review]
```

---

## What's NOT Included

This repo is **opinionated methodology + tools**, not a kitchen sink. You still need to bring:

- **Your own subagents** for project-specific roles (VPS ops, deployment automation, custom integrations)
- **Your own hook configuration** for paths and thresholds
- **Your own CLAUDE.md project sections** — infrastructure, repo lists, deployment commands (keep these out of the public repo for security)
- **Third-party skill packs** — this repo doesn't redistribute other people's work

---

## Credits

- **P7/P9/P10 methodology and PUA mode** are adapted from [**tanweai/pua**](https://github.com/tanweai/pua) (MIT License) by 探微安全实验室 (Tanwei Security Lab). The original is a full Claude Code plugin with KPI reports, leaderboards, self-evolution tracking, and a Loop mode. If you want the full feature set, install it directly from [openpua.ai](https://openpua.ai).
- **The 7-agent team structure and hooks** are the result of months of real-world iteration — shipping to production, getting burned, iterating again.
- **Core philosophy** is inspired by Chinese big-tech engineering culture: P-level role ladders, closure-oriented task management, the "three red lines" discipline, and the corporate pressure culture that turns "good enough" into "exhaust every option".

---

## License

MIT. Take it, fork it, ship it. Attribution appreciated but not required.

---

> Built by [@NYCU-Chung](https://github.com/NYCU-Chung).
