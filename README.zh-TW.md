# Claude Code Dev Team

**[English](./README.md) · 繁體中文**

> **把 Claude Code 變成一整支工程團隊**
> — 8 位專職 agents、11 個自動化 hooks，還有讓他們保持紀律的 P7/P9/P10 方法論。

大多數人把 Claude Code 當單人工程師用。這個設定把它變成一整個工程組織：**planner、fullstack、debugger、critic、vuln-verifier、frontend-designer、tool-expert、web-researcher** — 每個 agent 負責一個角色、擁有各自的工具權限，並由嚴格的委派規則決定誰該動哪裡。

背後有 **阿里味大廠文化的紀律**（閉環意識、事實驅動、窮盡一切），搭配 **實戰打磨的 hooks**，在 debugger 語句、硬編密碼、成本失控、MCP 斷線等問題進 main 之前就攔下來。

---

## 團隊成員

| 角色 | Agent | 做什麼 | 什麼時候出動 |
|------|-------|--------|-------------|
| 📋 **Tech Lead** | `planner` | 把模糊需求拆成可平行執行的 Task Prompts，每個子任務都有六要素契約（目標 / 範圍 / 輸入 / 輸出 / 驗收 / 邊界）。絕不下場寫程式。 | 任務涉及 3+ 檔案或 2+ 模組 |
| 🛠 **Senior Engineer** | `fullstack-engineer` | 用 P7 方法論交付功能：讀懂現況 → 方案設計 → 影響分析 → 實施 → 三問自審 → `[P7-COMPLETION]`。 | 單一功能或跨模組實作 |
| 🎨 **Designer** | `frontend-designer` | 打造讓人記住的 landing page、dashboard、UI 元件。拒絕 AI slop，堅持鮮明美學方向。 | 新頁面、UI 重設計、視覺升級 |
| 🔍 **Code Reviewer** | `critic` | 找 bug、安全漏洞、邏輯錯誤、邊界條件、效能問題。每個發現都附檔案路徑+行號。不說「看起來沒問題」。 | Commit 前、部署前、Merge 前 |
| 🧪 **Pentester** | `vuln-verifier` | 接 critic 找到的漏洞，實際寫 PoC 測試證明漏洞是真是假。零誤報、零空口白話。 | critic 標出安全問題之後 |
| 🐛 **Debug Engineer** | `debugger` | 讀 log、建立假設、驗證、修復。不猜測，只追根本原因。含 log 分析。 | Bug 回報、服務異常、測試失敗 |
| ⚙️ **Tool Expert** | `tool-expert` | 選最適合的 MCP 工具、串接複雜工作流程、排查工具失敗。對整個工具堆疊瞭若指掌。 | MCP 工具失敗、複雜工具串接 |
| 📚 **Researcher** | `web-researcher` | 抓取並整理官方文件、API spec、錯誤碼含義。幻覺的剋星。 | API 用法不確定、錯誤碼查詢 |

每個 agent 都是 `agents/` 底下的 markdown 檔案，各自有 system prompt、工具權限、模型選擇。**你可以自訂、fork、或替換不需要的。**

---

## 工作流程

```
           ┌─────────────┐
           │  你的任務    │
           └──────┬──────┘
                  │
         ┌────────▼────────┐
         │   📋 planner    │  ← 任務涉及 3+ 檔案時
         │    (Tech Lead)   │    拆成可平行的子任務
         └────────┬────────┘
                  │
        ┌─────────┼─────────┐
        ▼         ▼         ▼
  ┌─────────┐ ┌─────────┐ ┌─────────┐
  │ fullstk │ │ fullstk │ │ fullstk │  ← 平行執行
  │   × N   │ │   × N   │ │   × N   │    P7 方法論
  └────┬────┘ └────┬────┘ └────┬────┘
       └───────────┼───────────┘
                   ▼
           ┌──────────────┐
           │  🔍 critic   │  ← 部署前強制審查
           │   (reviewer)  │
           └───────┬──────┘
                   │
          ┌────────┴────────┐
          │                 │
          ▼                 ▼
   ┌──────────────┐  ┌─────────────┐
   │ 🐛 debugger  │  │   部署       │
   │ (有問題就上)  │  │             │
   └──────────────┘  └─────────────┘
```

**安全相關工作**走另一條路：`critic` 發現 → `vuln-verifier` 寫 PoC → 修復或發 PR。

---

## 方法論

### 三條紅線

每個 agent 都必須遵守。沒有例外、沒有「差不多就好」。

- **🔒 閉環意識** — 每個任務都有明確的 Definition of Done。「做到這裡差不多了」不算結束。
- **📎 事實驅動** — 每個判斷都要附實際程式碼的路徑+行號。「我猜」「應該是」是違規。
- **✅ 窮盡一切** — 清單不能跳過。乾淨的項目也要明確標「已檢查，無問題」，不能靜默忽略。

### P7/P9/P10 模式切換

不是角色扮演。是**依任務規模切換的工作模式**：

| 規模 | 模式 | 行為 |
|------|------|------|
| 單一功能 | **P7**（Senior Engineer） | 設計 → 影響分析 → 實施 → 三問自審 → `[P7-COMPLETION]` |
| 多模組、3+ 檔案 | **P9**（Tech Lead） | 拆成帶六要素的 Task Prompts。禁止寫程式 — 你的輸出是 Prompt，不是 code。 |
| 跨團隊、5+ sprints | **P10**（CTO） | 輸出戰略文件：目標、成功指標、風險、時程、資源分配。 |

### PUA 模式（高壓觸發條件）

以下任一情況發生時，團隊切換到**窮盡一切、不留後路**的工作狀態：

- 同一個任務失敗 2+ 次 → 停止重試原方案，寫三個全新假設
- 即將說「無法解決」「是環境問題」→ 禁止，先查文件讀源碼
- 發現自己在被動等指令 → 主動找下一步
- 用戶說「加油點」「為什麼又失敗」→ 進入檢討模式
- 用戶說「別再被打臉」→ 每個假設交叉驗證 3 種方式才動手

> 我們不養閒 agent。沒有半成品。沒有藉口。

---

## 自動化（Hooks）

11 個自動化 hooks 接在 `pre-commit`、`post-tool-use`、`stop` 等事件上，在問題上 production 前就攔下來。

| Hook | 觸發時機 | 攔截什麼 |
|------|---------|---------|
| 💰 `cost-tracker.js` | 每次回覆後 | Token 用量 + 估算成本（Opus / Sonnet / Haiku）。累積到 `~/.claude/metrics/costs.jsonl` |
| ✋ `commit-quality.js` | Pre-commit | 阻擋 JS/TS/Python 檔案中的 `debugger` 語句和硬編密碼 |
| 🔧 `mcp-health.js` | MCP 失敗時 | 偵測 MCP server 死掉，指數退避追蹤 |
| 🛡 `config-protection.js` | 編輯關鍵設定檔時 | 防止 linter/formatter 設定被意外弱化 |
| 🎨 `design-quality.js` | 前端改動時 | 檢查 AI slop 特徵（Inter 字體、紫色漸層、千篇一律的 card grid） |
| 📝 `check-console.js` | Pre-commit | 標出 production 路徑中的 `console.log` |
| 📊 `audit-log.js` | 所有 Bash 指令 | 稽核紀錄 + 自動遮罩 secret |
| 🎯 `batch-format.js` | 多檔案編輯後 | 批次執行 Prettier + TypeScript 檢查 |
| 💡 `suggest-compact.js` | Context 壓力 | 在對話變長時建議 `/compact` |
| 📈 `accumulator.js` | Session 追蹤 | 累積 session 期間編輯的檔案 |
| 🚨 `log-error.sh` | 任何錯誤 | 統一記錯到 `~/.claude/error-log.md` |

每個 hook 都是獨立腳本。透過 `settings.example.json` 啟用 / 關閉 / 自訂。

---

## 一鍵安裝

```
/plugin marketplace add NYCU-Chung/my-claude-devteam
/plugin install devteam@my-claude-devteam
```

就這樣。8 個 agents 和 11 個 hooks 會自動註冊，重啟 Claude Code 就生效。

### 建議：安裝方法論文件

Plugin 已經把 **P7/P9/P10 方法論 + 三條紅線** 內建進每個 agent，但如果你想要整個 session 都用同一套紀律運作，建議把其中一個 `CLAUDE.md` 丟進 `~/.claude/CLAUDE.md`：

```bash
# 繁體中文
curl -sL https://raw.githubusercontent.com/NYCU-Chung/my-claude-devteam/main/CLAUDE.zh-TW.md   -o ~/.claude/CLAUDE.md

# English
curl -sL https://raw.githubusercontent.com/NYCU-Chung/my-claude-devteam/main/CLAUDE.en.md   -o ~/.claude/CLAUDE.md
```

### 手動安裝（不用 plugin）

如果不想用 plugin 系統：

```bash
git clone https://github.com/NYCU-Chung/my-claude-devteam ~/my-claude-devteam

mv ~/.claude/agents ~/.claude/agents.bak 2>/dev/null
mv ~/.claude/hooks  ~/.claude/hooks.bak  2>/dev/null

cp -r ~/my-claude-devteam/agents ~/.claude/
cp -r ~/my-claude-devteam/hooks  ~/.claude/
cp ~/my-claude-devteam/settings.example.json ~/.claude/settings.json
# （可選）cp ~/my-claude-devteam/CLAUDE.zh-TW.md ~/.claude/CLAUDE.md
```

**驗證安裝：**

```
你：「我要在 broadcast 加一個 POST endpoint」
Claude：[派出 fullstack-engineer 走 P7 方法論]
        [設計 → 實施 → 三問自審]
        [派出 critic 做部署前審查]
```

---

## 不包含的東西

這個 repo 是 **方法論 + 工具**，不是 kitchen sink。你仍然需要自備：

- **專案專屬的 subagents**（VPS ops、部署自動化、客製整合）
- **你自己的 hook 設定**（路徑和閾值）
- **你自己的 CLAUDE.md 專案區塊** — 基礎設施、repo 清單、部署指令（基於安全考量，不要放在公開 repo）
- **第三方 skill packs** — 這個 repo 不轉發別人的作品

---

## Credits

- **P7/P9/P10 方法論與 PUA 模式** 改編自 [**tanweai/pua**](https://github.com/tanweai/pua)（MIT License），作者為探微安全实验室。原版是完整的 Claude Code plugin，包含 KPI 報告、排行榜、自進化追蹤、Loop 模式等進階功能。想要完整功能可以直接從 [openpua.ai](https://openpua.ai) 安裝。
- **7 人團隊結構與 hooks** 是多個月實戰迭代的產物 — 出貨到 production、被燒、再迭代。
- **核心哲學** 受中國大廠工程文化影響：P 職級體系、閉環導向任務管理、「三條紅線」紀律、以及經典的 厚黑 PUA 壓力文化，把「差不多就好」變成「窮盡一切」。

---

## License

MIT 授權。自由使用、fork、修改。想掛名歡迎，不掛也沒關係。

---

> Built by [@NYCU-Chung](https://github.com/NYCU-Chung).
