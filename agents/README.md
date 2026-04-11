# The Team

Eight specialized agents that replace "one Claude, many prompts" with "one request, a full engineering team".

## Roster

| Agent | Role | Model | Tools | Primary job |
|-------|------|-------|-------|-------------|
| [`planner`](./planner.md) | Tech Lead | opus | Read-only | Breaks fuzzy requirements into Task Prompts with a six-element contract. Never writes code. |
| [`fullstack-engineer`](./fullstack-engineer.md) | Senior Engineer | sonnet | Read/Write | Ships features using the P7 methodology. Self-reviews before handoff. |
| [`frontend-designer`](./frontend-designer.md) | Designer | sonnet | Read/Write | Builds memorable UI with a committed aesthetic direction. Rejects AI slop. |
| [`critic`](./critic.md) | Code Reviewer | opus | Read-only | Finds bugs, security holes, edge cases. Every finding with file:line + fix direction. |
| [`vuln-verifier`](./vuln-verifier.md) | Pentester | opus | Read-only | Takes critic findings and writes real PoCs to confirm. No false positives. |
| [`debugger`](./debugger.md) | Debug Engineer | opus | Read-only | Reads logs, builds hypotheses, verifies, fixes. Never guesses. |
| [`tool-expert`](./tool-expert.md) | Platform Engineer | sonnet | All | Picks the right tool, chains workflows, troubleshoots tool failures. |
| [`web-researcher`](./web-researcher.md) | Librarian | sonnet | WebSearch/WebFetch | Turns uncertainty into verified facts with sources. |

> **Note on tools**: agents have the minimum tools they need. `planner`, `critic`, `vuln-verifier`, and `debugger` are read-only — they analyze and produce reports, they don't modify files. Execution agents (`fullstack-engineer`, `frontend-designer`, `tool-expert`) have `Edit`/`Write`.

## Delegation Matrix

When the parent Claude gets a request, it uses this matrix to decide who to dispatch:

| The request | Dispatch to |
|-------------|-------------|
| "Add a new feature / endpoint / module" | `fullstack-engineer` (P7 flow) |
| "Refactor this across 3+ files" | `planner` first, then parallel `fullstack-engineer` |
| "Design a new landing page / dashboard" | `frontend-designer` |
| "Fix the bug in X" | `debugger` first, then `fullstack-engineer` for the fix |
| "Review this diff before we merge" | `critic` |
| "Audit this code for security issues" | `critic` (which may hand off to `vuln-verifier`) |
| "Confirm this vulnerability is real" | `vuln-verifier` |
| "Why is the service crashing?" | `debugger` |
| "How does API X work?" | `web-researcher` |
| "Why is this MCP tool failing?" | `tool-expert` |
| "Plan a big refactor that touches 3 services" | `planner` |

## Workflow Patterns

### Pattern 1: Small, clear task (single agent)
```
You → fullstack-engineer → [P7-COMPLETION]
```

### Pattern 2: Change with review (two agents)
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
     → fullstack-engineer × N (parallel execution, one per subtask)
     → critic × N (parallel review of each subtask)
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
| Critical thinking, code review, debugging, planning | `opus` | These tasks require deep reasoning; a wrong answer costs more than the extra inference tokens. |
| Feature implementation, design, tool orchestration | `sonnet` | Execution tasks benefit from speed and cost-efficiency; patterns are well-defined, reasoning overhead is lower. |
| Pure lookup / research | `sonnet` | No synthesis needed beyond source evaluation. |

Adjust for your budget and latency needs — the methodology works at any tier.
