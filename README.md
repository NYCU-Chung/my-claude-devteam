# Claude Code Dev Team

**English · [繁體中文](./README.zh-TW.md)**

> **An entire engineering team for Claude Code**
> — 12 specialized agents, 15 automation hooks, and the P7/P9/P10 methodology that keeps them disciplined.

Most people use Claude Code as a single coder. This config turns it into a full engineering org: **planner, fullstack-engineer, refactor-specialist, migration-engineer, frontend-designer, critic, vuln-verifier, debugger, db-expert, onboarder, tool-expert, web-researcher** — each agent owns a role, each has its own tool permissions, and a strict delegation rulebook decides who touches what.

Backed by **corporate-culture-inspired discipline** (closure, fact-driven, exhaustiveness) and **battle-tested hooks** that catch debugger statements, hardcoded secrets, cost overruns, and MCP outages before they hit main.

---

## The Team

| Role | Agent | What they do | When they ship |
|------|-------|--------------|---------------|
| 📋 **Tech Lead** | `planner` | Breaks down fuzzy requirements into parallelizable Task Prompts with a six-element contract (goal / scope / input / output / acceptance / boundaries). Never writes code. | Task touches 3+ files or 2+ modules |
| 🛠 **Senior Engineer** | `fullstack-engineer` | Ships features using the P7 methodology: read reality → design solution → impact analysis → implement → three-question self-review → `[P7-COMPLETION]` delivery. | Single-feature or cross-module implementation |
| 🔄 **Refactor Lead** | `refactor-specialist` | Large-scale safe refactors. Atomic commits, full callsite verification, single-revert rollback. | Renames, file moves, module extraction across 10+ files |
| 🚀 **Migration Lead** | `migration-engineer` | Framework / library major-version upgrades. Reads upstream changelog, executes incrementally, verifies at every step. | Next.js 13→14, Vue 2→3, Tailwind 3→4, etc. |
| 🎨 **Designer** | `frontend-designer` | Builds landing pages, dashboards, and UI that doesn't look like AI slop. Opinionated aesthetic direction, refuses generic output. | New pages, UI redesigns, visual upgrades |
| 🔍 **Code Reviewer** | `critic` | Finds bugs, security holes, logic errors, edge cases, performance issues. Every finding with file path + line number. No "looks good to me". | Pre-commit, pre-deploy, pre-merge |
| 🧪 **Pentester** | `vuln-verifier` | Takes the critic's findings and writes actual PoC tests to prove the vulnerability is real — no false positives, no hand-waving. | After critic flags a security issue |
| 🐛 **Debug Engineer** | `debugger` | Reads logs, constructs hypotheses, verifies, fixes. Never guesses, always traces root cause. Includes log-analyzer. | Bug reports, service incidents, test failures |
| 🗄 **DB Specialist** | `db-expert` | Reviews schemas, migrations, queries for safety, indexes, locks, race conditions. Paranoid about data loss. | Schema changes, migrations, query optimization |
| 🗺 **Onboarder** | `onboarder` | First-time codebase exploration. Produces a structured mental model — architecture, entry points, suspicious areas. | Joining a new project, evaluating an open-source repo |
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

Fifteen automation hooks wire up at `pre-commit`, `post-tool-use`, and `stop` events. They catch problems before they ship.

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
| 🧪 `test-runner.js` | After file edit | Finds sibling test file, runs vitest/jest, reports failures (non-blocking) |
| 🔒 `branch-protection.js` | Pre-Bash | Hard-blocks force pushes and direct commits to main / master / production / release |
| 📏 `large-file-warner.js` | Pre-Read | Warns at 500 KB, blocks at 2 MB to protect context window |
| 📚 `session-summary.js` | Stop | Appends session summary to `~/.claude/sessions/` for later search |

Each hook is a self-contained script. Enable / disable / customize in `settings.example.json`.

---

## From the Field

Real observations from daily use. Your mileage may vary.

### `critic` is the MVP

On mid-sized modules (500–2000 lines), `critic` routinely finds **20–30 issues** across all severity tiers. On large open-source codebases (tested against OpenClaw 352K⭐, Mermaid 87K⭐, Storybook 85K⭐, React Router 56K⭐), a single focused audit still surfaces **5–10 real bugs** that had not been reported in the issue tracker.

Notable catches from real audits:
- A CWE-208 timing-safe comparison gap in a 352K-star repo that **three prior security-hardening PRs had missed** (diffs store `!==` vs `safeEqualSecret`)
- A non-atomic `writeFileSync` race in an auth-adjacent allowlist file that would corrupt state under concurrent access
- An Ollama reasoning-model heuristic regex (`/r1/`) that misidentified unrelated models as thinking models

The strictness ("assume everything is broken until proven otherwise") is what makes it work.

### `debugger` saves you from face-plants

Twice during one bug-hunting session, the author was about to submit PRs based on seemingly clear reproductions. Both times `debugger` traced the behavior on HEAD and found the bugs had **already been silently fixed** in recent commits — the original reporters were on outdated versions. Submitting would have been embarrassing.

- **Svelte #18083** — infinite-loop reconcile bug. Turned out to be a regression introduced in 5.43.8 that was fixed in 5.44.0+ by #17191 / #17240 / #17550. `debugger` ran the repro on HEAD and the test passed.
- **Mermaid #6953** — sequence diagram alias+type combo. Already shipped in 11.14.0 via PR #7136; the issue just hadn't been closed.

The slow methodology ("reproduce, then hypothesize, then verify") is the whole point.

### `planner` replaces the clarification loop

On tasks touching 3+ files, dispatching to `planner` first turns a 30-message back-and-forth into one structured Task Prompt. The **six-element contract** (goal / scope / input / output / acceptance / boundaries) forces you to state the Definition of Done before anyone writes code.

### `vuln-verifier` is boring in the best way

Most reported "vulnerabilities" are false positives or partially true. The **PoC-or-it-didn't-happen** protocol converts fuzzy "I think this could be exploited" reports into verdicts with actual program output. Every verdict comes with an attack input **and** a baseline control input — so you prove the vulnerable behavior is triggered by the attack and not by any input.

---

## Install (One Command)

```
/plugin marketplace add NYCU-Chung/my-claude-devteam
/plugin install devteam@my-claude-devteam
```

That's it. All 8 agents and 11 hooks are registered automatically. Restart Claude Code and your dev team is online.

### Optional: install the methodology document

The plugin ships with the **P7/P9/P10 methodology + three red lines** baked into each agent, but for the strongest effect, also drop one of the `CLAUDE.md` files into `~/.claude/CLAUDE.md` so the whole session operates under the same discipline:

```bash
# English
curl -sL https://raw.githubusercontent.com/NYCU-Chung/my-claude-devteam/main/CLAUDE.en.md   -o ~/.claude/CLAUDE.md

# Traditional Chinese
curl -sL https://raw.githubusercontent.com/NYCU-Chung/my-claude-devteam/main/CLAUDE.zh-TW.md   -o ~/.claude/CLAUDE.md
```

### Manual install (without plugin)

If you prefer not to use the plugin system:

```bash
git clone https://github.com/NYCU-Chung/my-claude-devteam ~/my-claude-devteam

mv ~/.claude/agents ~/.claude/agents.bak 2>/dev/null
mv ~/.claude/hooks  ~/.claude/hooks.bak  2>/dev/null

cp -r ~/my-claude-devteam/agents ~/.claude/
cp -r ~/my-claude-devteam/hooks  ~/.claude/
cp ~/my-claude-devteam/settings.example.json ~/.claude/settings.json
# (optional) cp ~/my-claude-devteam/CLAUDE.en.md ~/.claude/CLAUDE.md
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
