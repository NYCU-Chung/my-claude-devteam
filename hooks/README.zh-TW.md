# Hooks

**[English](./README.md) · 繁體中文**

15 個自動化 hooks，接在 Claude Code 的 lifecycle events 上（`PreToolUse`、`PostToolUse`、`Stop`、`SessionStart`），在常見問題上 production 之前就攔下來：硬編密碼、debugger 語句、MCP 斷線、成本失控、AI slop UI、漏網的 `console.log` 等。

每個 hook 都是不到 75 行的獨立腳本。除了 Node.js 和標準 Unix 工具（`jq`、`git`、`grep`）之外沒有依賴。

## Hooks 清單

### 💰 `cost-tracker.js`
**觸發：** `Stop`（每次回覆後）
**做什麼：** 從 response payload 讀 token 用量，乘上每個 model 的費率（Opus / Sonnet / Haiku），append 一筆 JSONL 紀錄到 `~/.claude/metrics/costs.jsonl`。用來看每個 session 實際花了多少。

**輸出格式：**
```json
{"ts":"2026-04-10T13:14:22Z","model":"claude-opus-4-6","in":42153,"out":5421,"cost_usd":1.0389}
```

### ✋ `commit-quality.js`
**觸發：** `PreToolUse` on `Bash`（指令含 `git commit` 時）
**做什麼：** 在每次 commit 前，跑 `git diff --cached` 拿 staged 檔案，掃描以下：
- JS/TS/Python 中的 `debugger` 語句
- 已知 pattern 的硬編密碼：`sk-*`、`ghp_*`、`gho_*`、`AKIA*`（AWS）、`AIza*`（Google）

如果找到，commit 被 `exit 2` 阻擋，問題檔案 log 到 stderr。

**例外：** `git commit --amend`（故意的 — amend 通常是改 doc）。

### 🔧 `mcp-health.js`
**觸發：** `PreToolUse` on `mcp__*`（檢查），`PostToolUseFailure` on `mcp__*`（追蹤）
**做什麼：** 用指數退避追蹤 MCP server 健康狀態。如果 server 因為 `ECONNREFUSED`、`ENOTFOUND`、`timed out`、`401`、`403`、`429`、`503` 等失敗，標為不健康並跳過呼叫 `30s → 1min → 2min → ... → 10min` 直到重試。

狀態存到 `~/.claude/mcp-health-cache.json`。重試成功後，server 會被標回健康。

**為什麼重要：** 沒有這個，Claude 會持續轟炸壞掉的 MCP server，把 context 燒在錯誤訊息上。有它，呼叫會被跳過直到 server 應該回來。

### 🛡 `config-protection.js`
**觸發：** `PreToolUse` on `Write | Edit`
**做什麼：** 阻擋對 `.eslintrc*`、`eslint.config.*`、`.prettierrc*`、`prettier.config.*`、`biome.json`、`.ruff.toml`、`.stylelintrc*` 的直接編輯。強迫 Claude 修原始碼，而不是放寬 linter。

**自訂：** 編輯 `protectedFiles` 集合加你自己的 config 檔案。

### 🎨 `design-quality.js`
**觸發：** `PostToolUse` on `Write | Edit`
**做什麼：** 在前端檔案編輯時（`.tsx`、`.jsx`、`.vue`、`.css`、`.scss`、`.svelte`、`.astro`），掃描通用 AI slop 訊號：
- 預設 CTA：「Get Started」、「Learn More」
- 千篇一律的 card grid（`grid-cols-3` 或 `grid-cols-4`）
- 通用漸層（`bg-gradient-to-*`）
- 通用字體（Inter、Roboto）

如果找到，印出警告（不阻擋），讓 Claude 知道要用更有意圖的設計。

### 📝 `check-console.js`
**觸發：** `Stop`（每次回覆後）
**做什麼：** 跑 `git diff HEAD --name-only` 找這個 session 改過的檔案，掃描非 test、非 config 檔案中的 `console.log`。找到的話印警告（不阻擋）。

**排除：** `*.test.*`、`*.spec.*`、`*.config.*`、`scripts/`、`__tests__/`

### 📊 `audit-log.js`
**觸發：** `PostToolUse` on `Bash`
**做什麼：** 把每個 Bash 指令 append 到 `~/.claude/bash-commands.log`，含 timestamp。**自動遮罩** 常見密碼 pattern：`--token=`、`password=`、GitHub token、Google API key、`sshpass -p 'XXX'`。

**用途：** 事後稽核 Claude 在 session 中跑了什麼。

### 🎯 `batch-format.js`
**觸發：** `Stop`（每次回覆後）
**做什麼：** 讀這個 session 編輯過的 JS/TS 檔案清單（由 `accumulator.js` 累積），批次跑：
1. `prettier --write` 全部（如果 `./node_modules/.bin/prettier` 存在）
2. `npx tsc --noEmit --pretty false` 抓型別錯誤
3. 把 TS 錯誤逐檔案 print 到 stderr

用 session 範圍的 temp file（`claude-edited-<session-hash>.txt`）追蹤編輯過的檔案。

### 📈 `accumulator.js`
**觸發：** `PostToolUse` on `Write | Edit`
**做什麼：** `batch-format.js` 的搭檔。每次 JS/TS 檔案被編輯，把路徑 append 到 session 的 temp file。在 `Stop` 時，`batch-format.js` 讀清單一次跑完 formatter + typecheck（比逐檔跑快）。

### 💡 `suggest-compact.js`
**觸發：** `PreToolUse` on `Write | Edit`
**做什麼：** 用 temp file 計數每個 session 的 tool call 次數。第 50 次提醒考慮 `/compact`。之後每 25 次（#75、#100、#125...）再提醒一次。

**為什麼：** 長 session 會燒 context。在對的時間提醒能讓回覆保持快。

### 🚨 `log-error.sh`
**觸發：** `PostToolUse` on `.*`（每個工具）
**做什麼：** 如果工具輸出含錯誤關鍵字（`error`、`failed`、`ENOENT`、`EACCES`、`permission denied`、`fatal`、`exception`、`traceback`），append 一筆結構化紀錄到 `~/.claude/error-log.md`：
```markdown
## 2026-04-10 13:42:11 - Bash
**Input:** ...
**Error:** ...
**Solution:** (fill in after fix)
```

當作個人錯誤日記 — 修完之後填上 solution，下次遇到類似錯誤就 grep 找。

### 🧪 `test-runner.js`
**觸發：** `PostToolUse` on `Write | Edit`
**做什麼：** 每次 JS/TS 原始檔被編輯時，找對應的 test file（`foo.test.ts`、`foo.spec.ts`、`__tests__/foo.test.ts`），用 vitest 或 jest 跑（看 `node_modules/.bin` 哪個存在）。失敗 print 到 stderr 但不阻擋。沒裝 test runner 時跳過。

### 🔒 `branch-protection.js`
**觸發：** `PreToolUse` on `Bash`
**做什麼：** 偵測對受保護分支（`main`、`master`、`production`、`release`、`prod`）的 git 操作。

- **硬擋**：force push 到受保護分支
- **硬擋**：在受保護分支上 `git commit`
- **警告**：在受保護分支上 merge / rebase / reset / cherry-pick / revert / checkout

強制使用 feature branch 工作流，永遠不讓你不小心直接 commit 到 main。

### 📏 `large-file-warner.js`
**觸發：** `PreToolUse` on `Read`
**做什麼：** 讀檔前先 check size。

- **500 KB 警告**：建議用 `offset` / `limit`
- **2 MB 硬擋**：強迫用部分讀取或 `Grep`，避免燒掉 context

如果已經設了 `offset` 或 `limit` 就跳過。

### 📚 `session-summary.js`
**觸發：** `Stop`
**做什麼：** Append 一份結構化的 session 摘要到 `~/.claude/sessions/<日期>-<session-id>.md`。包含當下工作目錄、`git status --short`、最近 commit log。

用途：之後搜尋過去 session（`grep -r "TimeoutError" ~/.claude/sessions/`）看當初是怎麼解決問題的。

## 安裝

```bash
# 1. 複製 hooks 到 ~/.claude/hooks/
cp hooks/*.js ~/.claude/hooks/
cp hooks/log-error.sh ~/.claude/hooks/
chmod +x ~/.claude/hooks/log-error.sh

# 2. 複製範例 settings
cp settings.example.json ~/.claude/settings.json

# 3. 重啟 Claude Code
```

## 關閉特定 hook

每個 hook 都在 `settings.json` 獨立接線。要關掉一個，刪掉它在對應 `PreToolUse` / `PostToolUse` / `Stop` 區塊的條目。

範例 — 關掉 `cost-tracker`：
```json
"Stop": [
  {
    "matcher": "*",
    "hooks": [
      { "type": "command", "command": "node ~/.claude/hooks/batch-format.js", "timeout": 300 },
      { "type": "command", "command": "node ~/.claude/hooks/check-console.js" }
      // cost-tracker.js 移掉
    ]
  }
]
```

## 寫你自己的 hook

每個 hook 都遵循同一個模式：

```js
// 從 stdin 讀 JSON 輸入
let d = '';
process.stdin.on('data', c => d += c);
process.stdin.on('end', () => {
  try {
    const i = JSON.parse(d);
    // i.tool_name, i.tool_input, i.tool_output, etc. — 看 event 而定
    // ... 你的邏輯 ...
    // 要 BLOCK：process.exit(2) + 寫訊息到 stderr
    // 要 WARN：process.stderr.write(msg) 然後繼續
  } catch (e) {}
  process.stdout.write(d); // pass through 原始輸入
});
```

完整的 event payload schema 看 [Claude Code hooks docs](https://docs.claude.com/en/docs/claude-code/hooks)。

## 安全哲學

這些 hooks 假設 `"defaultMode": "bypassPermissions"` — 也就是 Claude 不會為每個工具呼叫提示確認。沒有 hooks 的話會失去兩層安全：

1. **人工確認** — 每個破壞性操作前的「你確定嗎？」
2. **人眼審查** — 在 commit 前發現 diff 裡有硬編密碼的機會

Hooks 試著用**確定性規則**取代這兩層。它們會漏掉一些（沒有完美的 heuristic），但會抓到最常見的失敗模式：`rm -rf`、force push 到 main、`--no-verify`、commit 進密碼、commit 進 debugger、編輯 `.env`/`.pem`/credentials、放寬的 linter config。

當作 safety net，不是 review 的替代品。
