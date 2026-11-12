# T3 Code 界面本地化审校与术语指南 (Terminology & Localization Guide)

> **审校完成度说明（100% 全部完成）**：本文档及同目录下的四个交付文件由 `gemini-4-argon` 基于 `/home/handlecoding/T3Work/t3-localization-review/translation-only/strings.json`（共 5,410 条候选字符串）逐条审校生成，现已 **100% 完成全部 5,410 条**（含原 1,020 条已有译文的逐条审校校正，以及 4,390 条新增候选的 UI 翻译、专有名词保留、同词异义消歧与非 UI 技术标识排除，待审条目为 `0`）。

---

## 一、 核心权限模式与说明配对规范（必须成对翻译）

在 T3 Code 的会话运行模式（Runtime Mode）、共享访问（Sharing & Access）及跨环境关联（Peer Links）中，**权限名称**与**权限说明**成对出现。严禁将 `Auto` 误译为“所有操作免审批”或与 `Full access` 混同。

| 权限级别 | 标签 ID | 英文标签 | 推荐中文标签 | 说明 ID | 英文说明原文 | 推荐中文说明（严格成对） | 核心边界说明 |
| :--- | :---: | :--- | :--- | :---: | :--- | :--- | :--- |
| **1. 监督模式** | `341` | `Supervised` | **监督模式** | `4330` | `Ask before commands and file changes.` | **在执行命令和修改文件前先询问。** | 所有命令执行与文件修改均需人工审批确认。 |
| **2. 自动接受编辑** | `342` | `Auto-accept edits` | **自动接受编辑** | `4331` | `Auto-approve edits, ask before other actions.` | **自动批准文件编辑，执行其他操作前仍需询问。** | 仅自动放行文件编辑，终端命令等其他操作仍需询问。 |
| **3. 自动模式** | `116` | `Auto` | **自动**（权限上下文可注：**自动（常规操作免审）**） | `4332` | `Supported providers approve routine actions; others still ask.` | **受支持的模型服务会自动批准常规操作，其余情况仍需询问。** | **严禁误译为“所有操作免审批”**！仅受支持的 Provider 对常规操作自动放行，非常规操作或不支持的 Provider 仍会询问。 |
| **4. 完全访问权限** | `343` | `Full access` | **完全访问权限** | `4333` | `Allow commands and edits without prompts.` | **允许直接执行命令和编辑文件，无需确认提示。** | 最高执行权限，命令与文件修改均不弹窗询问（另有状态描述 `4357`: `Runs commands and edits files without asking` → **直接运行命令和编辑文件，无需询问**）。 |
| **附：只读权限** | `259` / `614` | `Read only` / `read only` | **只读** | `4334` | `Read projects and threads. Cannot start, message or change anything.` | **仅可查看项目和会话，无法启动会话、发送消息或修改任何内容。** | 用于配对连接或共享权限的下限级别（参考 `4350`）。 |

---

## 二、 品牌、产品名与开发者专有名词保护规则 (`keep`)

以下产品品牌、模型服务商、协议与工具名称在任何界面文案中均**保留英文原样**，严禁生硬汉化或拆分翻译：

1. **T3 官方产品矩阵**：
   - `T3 Code`（`id: 4246`）、`T3 Code Web`（`id: 4806`）、`T3 Code Desktop`（`id: 4807`）、`T3 Connect`（`id: 1438`）、`T3 Chat`（`id: 2711`）、`T3`（`id: 4255`）、`SnapShots`（`id: 3777`）。
   - **关键红线**：普通界面标签中的 `Code`（`id: 28`）可译为“代码”，但 **`T3 Code`、`Claude Code`、`Muse Code`、`VS Code` 等产品名称中的 `Code` 绝不能单独拆出翻译为“代码”**（例如严禁出现 `T3 代码` 或 `Claude 代码`）。
2. **AI 模型与智能体工具品牌**：
   - `ChatGPT`、`OpenAI`、`Codex`、`Claude`、`Claude Code`、`Antigravity`、`DeepSeek Harness`、`Cursor`、`Cursor Origin`、`OpenCode`、`Muse Code`、`Kiro`、`Grok`、`Grok Build`、`Pi`、`Trae`、`OpenRouter`、`Anthropic`、`Gemini Enterprise`、`Vertex AI`、`Silero`、`Handy`。
3. **基础设施、代码托管与生态工具**：
   - `GitHub`、`GitLab`、`Bitbucket`、`Azure DevOps`、`Forgejo`、`GitCafe`、`Tailscale`、`MagicDNS`、`1Password`、`Simlock`、`Expo`、`EAS Simulator`、`Open VSX`、`Lucide`、`ACP Registry`、`CLIProxyAPI`、`OpenTelemetry`、`Mermaid`。
4. **高频开发者核心术语（保留英文更自然直观）**：
   - `Worktree` / `Worktrees`（`id: 676`, `923`）：Git 核心概念，在 T3 Code 中作为一级工作区模式出现，保留英文 `Worktree` 比“工作树”更准确。
   - `Pull request` / `Pull requests` / `PR`（`id: 38`, `2151`, `4923`）：保留英文 `Pull request`（或 `PR`），不采用生硬的“拉取请求”。
   - `Diff` / `Diffs`（`id: 130`, `2587`）：保留 `Diff`。
   - `Fetch`（`id: 665`）：保留 `Fetch`，避免与 `Pull`（拉取并合并）混淆。
   - `API key`（`id: 542`）、`API token`（`id: 839`）、`Base URL`（`id: 543`）、`Hub URL`（`id: 414`）、`Webhook`、`SSH`、`WSL`、`MCP`、`ACP`、`GPU`、`CPU`、`PID`、`Temperature`（`id: 643`，采样温度）。
5. **变量、命令、路径与快捷键原样保留**：
   - 模板变量：`{{body.path}}`、`{{headers.name}}`、`{{query.name}}`、`{{body}}`、`{{request}}`、`{{headers.delivery-id}}`、`{{body.id}}`、`%s`、`$x^2$`、`\[x^2\]`。
   - 命令与配置项：`git clone`、`bun test`、`t3 connect`、`t3 connect link`、`t3 auth pairing create`、`t3 pair`、`codex app-server`、`kiro-cli login`、`muse login`、`pi --mode rpc`、`CODEX_HOME`、`CLAUDE_CONFIG_DIR`、`CURSOR_API_KEY`、`EXPO_TOKEN`、`CAFE_TOKEN`、`t3.json`、`auth.json`、`~/`。

---

## 三、 同词异义与上下文消歧规范 (`contextual`)

针对单个英文词在不同界面位置含义不同的情况，在 `reviewed-translations.json` 中标记为 `"decision": "contextual"`，且**不纳入 `catalog-proposed.txt` 无上下文全局替换词表**，防止污染：

| 英文词 | ID | 不同上下文的推荐译法与消歧规则 |
| :--- | :---: | :--- |
| **`Code`** | `28` | 1. **普通名词标签**（PR 详情页 `Code` 标签页、设置项 `Code font`）：译为 **“代码”**（如 `id: 2101` `Open in Code` → “在‘代码’标签页中打开”）；<br>2. **动词**（`id: 1066` `Code with your ChatGPT subscription.`）：译为 **“编写代码”**；<br>3. **验证码/配对码**（`id: 4374` `Get code`、`id: 1376` `Show code`）：译为 **“配对码”** 或 **“验证码”**；<br>4. **产品名一部分**（`T3 Code`、`Claude Code`、`Muse Code`、`VS Code`）：**严禁翻译**。 |
| **`Auto`** | `116` | 1. **权限模式**（对应说明 `id: 4332`）：译为 **“自动”**（或 **“自动（常规操作免审）”**），指受支持的模型服务自动批准常规操作，其余仍询问；<br>2. **普通设置选项**（主题外观、GPU 硬件选择 `id: 3906`、路由选择、分支命名）：译为 **“自动”**。 |
| **`Open`** | `19` | 1. **动作按钮**（打开文件/链接/应用）：译为 **“打开”**；<br>2. **PR / Issue 状态徽标或筛选器**（与 `Closed`、`Merged` 并列）：译为 **“开启”** 或 **“进行中”**。 |
| **`Dismiss`** | `20` | 1. **通知横幅/提示框关闭按钮**（`Dismiss notification`、`Dismiss error`）：译为 **“关闭”**（原译“忽略”在关闭 UI 提示条时不够贴切）；<br>2. **PR 审查状态**（`id: 2068` `Review dismissed`）：译为 **“审查已驳回”**。 |
| **`Reasoning` vs `Reasoning effort`** | `37` / `640` | `Reasoning`（`id: 37`）作为消息流中思考过程折叠块标题时译为 **“推理”**（配合 `id: 858/859` “显示/隐藏推理过程”）；`Reasoning effort`（`id: 640`）作为模型推理消耗档位时译为 **“推理强度”**。 |
| **`Environment` / `Runtime` / `Run on`** | `92` / `147` / `169` | 原译将三者全部译为“运行环境”，造成界面重名冲突：<br>- `Environment`（`id: 92`）→ **“环境”**（或“执行环境”）；<br>- `Runtime`（`id: 147`）→ **“运行时”**（如 `Codex runtime` → “Codex 运行时”）；<br>- `Run on`（`id: 169`）→ **“运行于”**（定时任务的目标机器字段）。 |
| **`Setup` vs `Settings`** | `304` / `334` | `Settings`（`id: 334`）统一译为 **“设置”**；`Setup`（`id: 304`、`id: 262` `Setup Required`、`id: 381` `Finishing setup`）统一译为 **“配置”**（或“初始化配置”），避免同屏出现两个“设置”。 |
| **`Plan` vs `Schedule`** | `95` / `562` | `Plan`（`id: 95`）在智能体规划模式中译为 **“计划”**（在 `ChatGPT plan` 中译为 **“订阅方案”**）；`Schedule`（`id: 562`）在定时任务中译为 **“定时调度”**，避免与 `Plan` 撞名。 |
| **`Voice` vs `Speech`** | `330` / `331` | `Voice`（`id: 330`）为一级设置菜单 **“语音”**；其子分组 `Speech`（`id: 331`）特指语音识别（STT）模型设置，译为 **“语音识别”**。 |
| **`When`** | `93` | 在快捷键编辑器（`id: 3535` `When expression`）中指快捷键生效的上下文条件，译为 **“触发条件”**；在通知或定时任务中指 **“触发时机”**。原译“时间”在快捷键页会导致误解。 |
| **`Word`** | `482` | 在外观设置 `Effort display`（`Word` vs `Bars`，`id: 3368/3369`）中指以 **“文字”**（如 High/Max）而非柱状格显示推理强度。原译“按单词”系脱离上下文误译。 |
| **`Stop`** | `687` / `2108` | `Stop`（`id: 687`）作动作按钮时译为 **“停止”**；`Stop `（`id: 2108`，配合 `Previous stop` / `Next stop`）在 PR 审查导览（Review tour）中指导览的 **“第 X 站”**。 |
| **`Unified` / `Stacked` / `Split`** | `595` / `2353` / `2354` | 在 Diff 视图布局中：`Unified`（`id: 595`）译为 **“单栏视图”**（修正原译“合并视图”，避免与 Git Merge 混淆）；`Stacked`（`id: 2353`）在 Diff 布局中译为 **“单栏堆叠”**，在 PR 中（`Stacked pull request`）译为 **“堆叠 PR / PR 栈”**；`Split`（`id: 2354`）译为 **“分栏视图”**。 |
| **`Settle` / `Settled` / `Un-settle`** | `4265` / `4266` | 以逐条审校 JSON 为准：`Settle` → **“归入就绪”**，`Un-settle` → **“移出就绪”**。本指南原先写作“归置 / 已归置”，与交付词表不一致，已对齐 Gemini 的逐条结果。该状态的中文命名仍建议在实际界面中确认。 |

---

## 四、 原 1,020 条旧译重点勘误汇总

在对 `id: 1` 至 `id: 1020` 的逐条审校中，共修正或精细化标注 **47 处**问题（其余经核实准确的条目保留采用并附分类审校说明）：

1. **严重误译修正**：
   - `id: 128` `Capture is ready`：原译“录制已就绪”有误，该条属于 `T3 Code SnapShots` 窗口截图捕获引导（紧接 `id: 129` `Next, choose your shortcut.`），修正为 **“窗口捕获已就绪”**。
   - `id: 482` `Word`：原译“按单词”有误，实际为推理强度显示样式（`Word` 文字 vs `Bars` 柱状格），修正为 **“文字”**。
   - `id: 175` `Retry stack refresh`：原译“重新刷新堆栈”将堆叠 PR（Stacked PR）误作内存堆栈，修正为 **“重试刷新 PR 栈”**。
   - `id: 595` `Unified`：原译“合并视图”易与分支合并混淆，修正为 **“单栏视图”**。
   - `id: 189` `Checked unavailable`：原译“检查不可用”有歧义，修正为 **“已检测：不可用”**。
   - `id: 399` `Applying settings for`：原译“正在应用设置：”误作进行时提示，实际为设置作用域选择器标题，修正为 **“当前设置生效范围”**。
   - `id: 457` `Duplicate theme`：原译“复制主题”易与复制文本混淆，修正为 **“创建主题副本”**。
2. **漏译补全与字面量恢复**：
   - `id: 476` `Set the prompt, code, and terminal fonts separately instead of one monospace font.`：补全原译漏掉的后半句，译为 **“分别设置输入框、代码和终端字体，而非共用同一种等宽字体。”**
   - `id: 963` `Typeset LaTeX math in messages and Markdown previews, such as $x^2$ and \[x^2\]. The composer keeps raw TeX editable.`：恢复原译删去的公式示例，译为 **“在消息和 Markdown 预览中排版 LaTeX 数学公式（如 $x^2$ 或 \[x^2\]）。输入框中仍保留可编辑的 TeX 源码。”**
   - `id: 985` `When empty, the Add Project file browser starts in "~/".`：恢复被意译掉的 `"~/"` 路径字面量，译为 **“留空时，“添加项目”文件浏览器默认从 "~/" 开始。”**
3. **非 UI 字符串剔除**：
   - `id: 146` `Default true.`：系混入候选池的 MCP 工具参数 Schema 内部描述，修正为 `"decision": "exclude"`，不作 UI 翻译。

---

## 五、 新增候选（ID 1021–5410）的非 UI 技术标识排除准则 (`exclude`)

在 4,390 条未翻译候选中，以下类别属于代码内部标识符、协议底层异常或工具 Schema，严禁作为用户界面文案翻译（标记为 `"decision": "exclude"`，且 `recommended` 保持原英文不变）：

1. **IPC / RPC / 事件总线通道名（约 280 条）**：所有以 `environment-data:`、`environment-command:`、`environment-catalog:`、`web:`、`relay-environment-discovery:` 开头的通道标识，以及 `web-queued-run-edits`、`docx-parse`、`docx-edit`、`atom query`、`server settings update`、`cloud account cleanup` 等内部事件名。
2. **颜色值、CSS 类名与主题变量（约 52 条）**：`#...` 十六进制色值、`oklch(...)` 色值、`--app-theme-placeholder`、`text-sidebar-*`、`text-primary`、`bg-[color-mix(...)]` 等。
3. **路径、URL、命令、环境变量与占位符字面量**：`/settings/...`、`https://...`、`http://...`、`~/.codex`、`~/.claude`、`t3.json`、`bun test`、`git clone`、`t3 auth pairing create`、`simlock --gateway token create --role agent`、`AGENT_DEVICE_DAEMON_*`、`optionId`、`model-slug`、`VARIABLE_NAME`、`PAIRCODE`、`{{headers.delivery-id}}`、`{{body.id}}`、`/model`、`/side`、`/btw`、`/clear`、`/skill:` 等。
4. **第三方 SDK / 底层运行库内部异常与文档字符串**：
   - 第三方 Ethereum / Coinbase Wallet / JSON-RPC 标准错误码描述（`id: 1687–1720`）；
   - Effect 运行时与 Bash 语法解析器底层异常（`id: 4064–4066`, `4071–4085`）；
   - KaTeX 内部配置项 API 文档字符串（`id: 4113–4124`）；
   - WebCrypto / ASN.1 / Fetch / Stream / RPC 序列化底层异常（`id: 5104–5120`, `5302–5320`）；
   - Cloud Relay OpenAPI 字段说明与 MCP 工具参数 Schema 说明（`id: 5122–5145`, `5195–5279`, `5282–5301`）。
