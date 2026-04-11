# 團隊成員

**[English](./README.md) · 繁體中文**

十二位專職 agents，把「一個 Claude 配無數 prompt」變成「一句話請求，整支工程團隊就上工」。

## 名單

### 建造與交付
| Agent | 角色 | Model | 工具 | 主要任務 |
|-------|------|-------|------|----------|
| [`planner`](./planner.md) | Tech Lead | opus | 唯讀 | 把模糊需求拆成 Task Prompts，每個都有六要素契約。絕不寫程式。 |
| [`fullstack-engineer`](./fullstack-engineer.md) | Senior Engineer | sonnet | 讀寫 | 用 P7 方法論交付功能。交付前自審。 |
| [`frontend-designer`](./frontend-designer.md) | Designer | sonnet | 讀寫 | 打造有美學主張的介面，拒絕 AI slop。 |
| [`refactor-specialist`](./refactor-specialist.md) | Refactor Lead | opus | 讀寫 | 大規模安全重構，原子 commit、完整 callsite 驗證。 |
| [`migration-engineer`](./migration-engineer.md) | Migration Lead | opus | 讀寫 | Framework / 函式庫主版本升級，分階段執行、可回滾。 |

### 品質與安全
| Agent | 角色 | Model | 工具 | 主要任務 |
|-------|------|-------|------|----------|
| [`critic`](./critic.md) | Code Reviewer | opus | 唯讀 | 找 bug、安全漏洞、邊界條件。每個發現都附 file:line + 修復方向。 |
| [`vuln-verifier`](./vuln-verifier.md) | Pentester | opus | 唯讀 | 接 critic 發現，實際寫 PoC 證明漏洞真假。零誤報。 |
| [`debugger`](./debugger.md) | Debug Engineer | opus | 唯讀 | 讀 log、建假設、驗證、修復。不猜測。 |
| [`db-expert`](./db-expert.md) | DB Specialist | opus | 唯讀 | 審查 schema、migration、query 的安全性、索引、race condition。 |

### 探索與支援
| Agent | 角色 | Model | 工具 | 主要任務 |
|-------|------|-------|------|----------|
| [`onboarder`](./onboarder.md) | Codebase Explorer | opus | 唯讀 | 第一次接觸 codebase 時，用一份報告產出結構化 mental model。 |
| [`tool-expert`](./tool-expert.md) | Platform Engineer | sonnet | 全部 | 選對工具、串接複雜流程、排查工具失敗。 |
| [`web-researcher`](./web-researcher.md) | Librarian | sonnet | WebSearch/WebFetch | 把不確定變成有出處的事實。 |

> **工具權限說明**：每個 agent 只給最少需要的工具。唯讀型 agents（`planner`、`critic`、`vuln-verifier`、`debugger`、`db-expert`、`onboarder`）只分析、產報告，不修改檔案。執行型 agents（`fullstack-engineer`、`frontend-designer`、`refactor-specialist`、`migration-engineer`、`tool-expert`）有 `Edit` / `Write`。

## 委派矩陣

當主 Claude 收到請求，按這個矩陣決定派誰：

| 請求 | 派 |
|------|---|
| 「加一個新功能 / endpoint / 模組」 | `fullstack-engineer`（P7 流程） |
| 「重構這個，影響 10+ 檔案」 | `refactor-specialist` |
| 「重構這個，影響 3–9 檔案」 | 先 `planner`，再並行 `fullstack-engineer` |
| 「升級這個 framework / 函式庫」 | `migration-engineer` |
| 「設計一個新的 landing page / dashboard」 | `frontend-designer` |
| 「修 X 的 bug」 | 先 `debugger`，再 `fullstack-engineer` 修 |
| 「審查這個 diff 再 merge」 | `critic` |
| 「審查這個 schema / migration / query」 | `db-expert` |
| 「審查這段 code 有沒有安全問題」 | `critic`（可能轉派 `vuln-verifier`） |
| 「確認這個漏洞是真的」 | `vuln-verifier` |
| 「為什麼服務一直 crash」 | `debugger` |
| 「這個 codebase 在幹嘛」 | `onboarder` |
| 「API X 怎麼用」 | `web-researcher` |
| 「為什麼這個 MCP 工具壞了」 | `tool-expert` |
| 「規劃一個跨 3 個服務的大重構」 | `planner` |

## 工作流程模式

### 模式 1：小而明確的任務
```
你 → fullstack-engineer → [P7-COMPLETION]
```

### 模式 2：改動 + 審查
```
你 → fullstack-engineer → [P7-COMPLETION]
     → critic（審查 diff）
     → （有問題）fullstack-engineer 修 → critic 再審
```

### 模式 3：Bug 修復
```
你 → debugger（找 root cause）
     → fullstack-engineer（依 debugger 報告實作修復）
     → critic（審查）
```

### 模式 4：複雜跨模組改動
```
你 → planner（拆成 N 個 Task Prompts）
     → fullstack-engineer × N（並行，一個一個子任務）
     → critic × N（並行審查每一個）
     → 對齊 Definition of Done 做整合驗收
```

### 模式 5：安全審查
```
你 → critic（掃漏洞）
     → vuln-verifier（每個發現寫 PoC 出判定）
     → fullstack-engineer（修被確認的漏洞）
     → critic（驗證修復）
```

### 模式 6：新設計
```
你 → frontend-designer
     → [P7-COMPLETION] 含美學方向說明
     → （可選）critic 做 accessibility + 效能審查
```

### 模式 7：研究後實作
```
你 → web-researcher（查官方 API spec）
     → fullstack-engineer（依驗證過的 spec 實作）
     → critic（審查）
```

### 模式 8：接手新 codebase
```
你 → onboarder（產 codebase map）
     → planner（用 map 規劃第一個貢獻）
```

### 模式 9：Schema / migration 改動
```
你 → fullstack-engineer（草擬 migration）
     → db-expert（審查安全性、鎖、回滾路徑）
     → （有問題）fullstack-engineer 改 → db-expert 再審
     → critic（最終 pre-merge 審查）
```

### 模式 10：大規模重構
```
你 → refactor-specialist
     → 偵察階段：列出每個 callsite
     → 原子 commit，每步驗證
     → [REFACTOR-COMPLETE]
     → critic（最終 diff 審查）
```

### 模式 11：Framework 升級
```
你 → migration-engineer
     → 讀上游 changelog
     → 產出含 breaking-change checklist 的 migration plan
     → 分階段執行，每步驗證
     → [MIGRATION-COMPLETE]
```

## 並行派遣

獨立任務應該**在同一則訊息**裡派出 — Claude Code 會平行執行：

```
# 範例：同時審前端和後端 PR
Agent(subagent_type="critic", prompt="審查 app/ 的前端改動")
Agent(subagent_type="critic", prompt="審查 api/ 的後端改動")
```

**不要**串行（一個 Agent call、等結果、再發另一個 Agent call），除非第二個真的依賴第一個的輸出。

## 三條紅線

每個 agent 都遵守。是團隊共同的紀律：

1. **閉環意識** — 每個任務有明確 Definition of Done。「差不多就好」不算結束。
2. **事實驅動** — 每個判斷都附實際程式碼的 path + line number。「我猜」「應該是」「probably」是違規。
3. **窮盡一切** — 清單不能跳過。乾淨的項目要明確標「已檢查，無問題」 — 不能靜默忽略。

## 客製化

### 加入你自己的 agent

在 `agents/<your-agent>.md` 用既有 agents 的 frontmatter 格式：

```markdown
---
name: your-agent
description: "一句話描述加觸發詞。Claude 用這個決定何時派遣。"
tools: Read, Grep, Glob, Bash   # 只給最少必要工具
model: sonnet                    # opus 用於關鍵思考，sonnet 用於執行
---

你是 **Your Agent**...

## 三條紅線
...

## 工作流程
...

## 輸出格式
...

## 何時使用
...

## 何時不使用
...

## 紅線
...
```

### 替換既有 agent

如果某個 agent 不符合你的風格，刪掉檔案自己寫。委派矩陣（在 `CLAUDE.md`）只要 agent 名稱對得上就會繼續運作。

### 專案專屬 agents

私人工具（部署腳本、VPS 操作、客製整合）放在**獨立**的私人資料夾（`agents-private/` 加進 .gitignore），加進你本機的 `~/.claude/agents/`。保持這個 repo 乾淨。

## Model 選擇邏輯

| 用途 | Model | 為什麼 |
|------|-------|--------|
| 關鍵思考、code review、debug、規劃、schema 審查 | `opus` | 高風險推理；錯一個答案的代價比多花的 token 還貴。 |
| 功能實作、設計、工具串接 | `sonnet` | 執行型任務從速度和成本受惠；模式已經明確。 |
| 純查詢 / 研究 | `sonnet` | 不需要綜合，只需要評估來源。 |

依你的預算和延遲需求調整 — 方法論在任何 tier 都能用。
