# The Team

**English · [繁體中文](./README.zh-TW.md)**

Twelve specialized agents that replace "one Claude, many prompts" with "one request, a full engineering team".

## Roster

### Build & ship
| Agent | Role | Model | Tools | Primary job |
|-------|------|-------|-------|-------------|
| [`planner`](./planner.md) | Tech Lead | opus | Read-only | Breaks fuzzy requirements into Task Prompts with a six-element contract. Never writes code. |
| [`fullstack-engineer`](./fullstack-engineer.md) | Senior Engineer | sonnet | Read/Write | Ships features using the P7 methodology. Self-reviews before handoff. |
| [`frontend-designer`](./frontend-designer.md) | Designer | sonnet | Read/Write | Builds memorable UI with a committed aesthetic direction. Rejects AI slop. |
| [`refactor-specialist`](./refactor-specialist.md) | Refactor Lead | opus | Read/Write | Large-scale safe refactors. Atomic commits, full callsite verification. |
| [`migration-engineer`](./migration-engineer.md) | Migration Lead | opus | Read/Write | Framework / library major-version upgrades. Incremental, verified, reversible. |

### Quality & safety
| Agent | Role | Model | Tools | Primary job |
|-------|------|-------|-------|-------------|
| [`critic`](./critic.md) | Code Reviewer | opus | Read-only | Finds bugs, security holes, edge cases. Every finding with file:line + fix direction. |
| [`vuln-verifier`](./vuln-verifier.md) | Pentester | opus | Read-only | Takes critic findings and writes real PoCs to confirm. No false positives. |
| [`debugger`](./debugger.md) | Debug Engineer | opus | Read-only | Reads logs, builds hypotheses, verifies, fixes. Never guesses. |
| [`db-expert`](./db-expert.md) | DB Specialist | opus | Read-only | Reviews schemas, migrations, queries for safety, indexes, race conditions. |

### Discovery & support
| Agent | Role | Model | Tools | Primary job |
|-------|------|-------|-------|-------------|
| [`onboarder`](./onboarder.md) | Codebase Explorer | opus | Read-only | First-time codebase exploration. Builds a structured mental model in one report. |
| [`tool-expert`](./tool-expert.md) | Platform Engineer | sonnet | All | Picks the right tool, chains workflows, troubleshoots tool failures. |
| [`web-researcher`](./web-researcher.md) | Librarian | sonnet | WebSearch/WebFetch | Turns uncertainty into verified facts with sources. |

> **Note on tools**: agents have the minimum tools they need. Read-only agents (`planner`, `critic`, `vuln-verifier`, `debugger`, `db-expert`, `onboarder`) analyze and produce reports without modifying files. Execution agents (`fullstack-engineer`, `frontend-designer`, `refactor-specialist`, `migration-engineer`, `tool-expert`) have `Edit` / `Write`.

## Delegation Matrix

When the parent Claude gets a request, it uses this matrix to decide who to dispatch:

| The request | Dispatch to |
|-------------|-------------|
| "Add a new feature / endpoint / module" | `fullstack-engineer` (P7 flow) |
| "Refactor this across 10+ files" | `refactor-specialist` |
| "Refactor this across 3–9 files" | `planner` first, then parallel `fullstack-engineer` |
| "Upgrade this framework / library" | `migration-engineer` |
| "Design a new landing page / dashboard" | `frontend-designer` |
| "Fix the bug in X" | `debugger` first, then `fullstack-engineer` for the fix |
| "Review this diff before we merge" | `critic` |
| "Review this schema / migration / query" | `db-expert` |
| "Audit this code for security issues" | `critic` (which may hand off to `vuln-verifier`) |
| "Confirm this vulnerability is real" | `vuln-verifier` |
| "Why is the service crashing?" | `debugger` |
| "What does this codebase do?" | `onboarder` |
| "How does API X work?" | `web-researcher` |
| "Why is this MCP tool failing?" | `tool-expert` |
| "Plan a big refactor that touches 3 services" | `planner` |

## Workflow Patterns

### Pattern 1: Small, clear task
```
You → fullstack-engineer → [P7-COMPLETION]
```

### Pattern 2: Change with review
```
You → fullstack-engineer → [P7-COMPLETION]
     → critic (review the diff)
     → (if findings) fullstack-engineer fixes → critic re-reviews
```

### Pattern 3: Bug fix
```
You → debugger (find root cause)
     → fullstack-engineer (implement fix, following debugger's report)
     → critic (review)
```

### Pattern 4: Complex multi-module change
```
You → planner (decomposes into N Task Prompts)
     → fullstack-engineer × N (parallel, one per subtask)
     → critic × N (parallel review of each)
     → integration check against Definition of Done
```

### Pattern 5: Security audit
```
You → critic (scan for vulnerabilities)
     → vuln-verifier (PoC each finding, produce verdicts)
     → fullstack-engineer (fix confirmed vulnerabilities)
     → critic (verify fixes)
```

### Pattern 6: New design
```
You → frontend-designer
     → [P7-COMPLETION] with aesthetic direction stated
     → (optional) critic for accessibility + performance review
```

### Pattern 7: Research before implementation
```
You → web-researcher (look up the official API spec)
     → fullstack-engineer (implement against the verified spec)
     → critic (review)
```

### Pattern 8: Joining a new codebase
```
You → onboarder (produce codebase map)
     → planner (use the map to plan your first contribution)
```

### Pattern 9: Schema / migration change
```
You → fullstack-engineer (drafts the migration)
     → db-expert (reviews for safety, locks, rollback path)
     → (if findings) fullstack-engineer revises → db-expert re-reviews
     → critic (final pre-merge review)
```

### Pattern 10: Large refactor
```
You → refactor-specialist
     → reconnaissance: list every callsite
     → atomic commits, verifying at each step
     → [REFACTOR-COMPLETE]
     → critic (final diff review)
```

### Pattern 11: Framework upgrade
```
You → migration-engineer
     → reads upstream changelog
     → produces migration plan with breaking-change checklist
     → executes incrementally, verifying at each step
     → [MIGRATION-COMPLETE]
```

## Parallel Dispatch

Independent tasks should dispatch **in the same message** — Claude Code executes them in parallel:

```
# Example: reviewing a frontend + backend PR
Agent(subagent_type="critic", prompt="Review frontend changes in app/")
Agent(subagent_type="critic", prompt="Review backend changes in api/")
```

Do NOT serialize them (one Agent call, wait for result, another Agent call) unless the second genuinely depends on the first's output.

## The Three Red Lines

Every agent enforces these. They are the team's shared discipline:

1. **Closure discipline** — Every task has a clear Definition of Done. No "close enough" endings.
2. **Fact-driven** — Every judgment cites actual code with paths and line numbers. "I guess" / "probably" / "should be" are violations.
3. **Exhaustiveness** — Checklists cannot be skipped. Clean items are explicitly marked "checked, no issues" — never silently ignored.

## Customization

### Adding your own agent

Create `agents/<your-agent>.md` with the frontmatter format used by the existing agents:

```markdown
---
name: your-agent
description: "One-line description with trigger words. This is what Claude uses to decide when to dispatch."
tools: Read, Grep, Glob, Bash   # minimum necessary
model: sonnet                    # opus for critical thinking, sonnet for execution
---

You are the **Your Agent**...

## Core Principles
...

## Workflow
...

## Output Format
...

## When to Use
...

## When NOT to Use
...

## Red Lines
...
```

### Replacing an agent

If one of our agents doesn't fit your style, delete the file and write your own. The delegation matrix in `CLAUDE.md` will keep working as long as the agent names match.

### Project-specific agents

For private tooling (deployment scripts, VPS ops, custom integrations), put those agents in a **separate** private folder (`agents-private/` gitignored) and add them to your local `~/.claude/agents/`. Keep this repo clean.

## Model Selection Rationale

| Use case | Model | Why |
|----------|-------|-----|
| Critical thinking, code review, debugging, planning, schema review | `opus` | High-stakes reasoning; a wrong answer costs more than the extra inference tokens. |
| Feature implementation, design, tool orchestration | `sonnet` | Execution tasks benefit from speed and cost-efficiency; patterns are well-defined. |
| Pure lookup / research | `sonnet` | No synthesis needed beyond source evaluation. |

Adjust for your budget and latency needs — the methodology works at any tier.
