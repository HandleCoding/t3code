import contextualCatalogJson from "./contextualCatalog.json";

export interface TranslationContext {
  /** Source file basename or relative path, e.g. "runtimeModeConfig.ts" */
  readonly file?: string;
  /** AST property key or JSX attribute name, e.g. "label", "description", "children", "resetLabel" */
  readonly prop?: string;
  /** Enclosing variable/object key when known, e.g. "approval-required" or "RESPONSE_STREAMING_MODE_LABELS" */
  readonly scope?: string;
}

const CONTEXTUAL_CATALOG: Readonly<Record<string, string>> = contextualCatalogJson;

/**
 * Core brand & product names that must never be split-translated (e.g. "Code" inside "T3 Code").
 */
export const PROTECTED_EXACT_TOKENS: ReadonlySet<string> = new Set([
  "T3",
  "T3 Code",
  "T3 Code ",
  "T3 Code Web",
  "T3 Code Desktop",
  "T3 Connect",
  "T3 Chat",
  "ChatGPT",
  "OpenAI",
  "Codex",
  "Claude",
  "Claude Code",
  "Antigravity",
  "DeepSeek Harness",
  "Cursor",
  "Cursor Origin",
  "OpenCode",
  "Muse Code",
  "Kiro",
  "Grok",
  "Grok Build",
  "Pi",
  "Trae",
  "VS Code",
  "VS Code Insiders",
  "VSCodium",
  "Zed",
  "OpenRouter",
  "Anthropic",
  "Simlock",
  "Tailscale",
  "MagicDNS",
  "1Password",
  "Open VSX",
  "ACP Registry",
  "SnapShots",
]);

/**
 * Paired Permission Modes: labels and descriptions must always be translated as exact pairs.
 * - Supervised = Ask before commands and file changes.
 * - Auto-accept edits = Auto-approve edits, ask before other actions.
 * - Auto = Supported providers approve routine actions; others still ask.
 * - Full access = Allow commands and edits without prompts.
 * - Read only = Read projects and threads. Cannot start, message or change anything.
 */
export const PERMISSION_MODE_LABEL_MAP: Readonly<Record<string, string>> = {
  Supervised: "监督模式",
  "Auto-accept edits": "自动接受编辑",
  Auto: "自动",
  "Full access": "完全访问权限",
  "Read only": "只读",
  "Read-only": "只读",
};

export const PERMISSION_MODE_DESCRIPTION_MAP: Readonly<Record<string, string>> = {
  "Ask before commands and file changes.": "在执行命令和修改文件前先询问。",
  "Auto-approve edits, ask before other actions.": "自动批准文件编辑，执行其他操作前仍需询问。",
  "Supported providers approve routine actions; others still ask.":
    "受支持的模型服务会自动批准常规操作，其余情况仍需询问。",
  "Allow commands and edits without prompts.": "允许直接执行命令和编辑文件，无需确认提示。",
  "Read projects and threads. Cannot start, message or change anything.":
    "仅可查看项目和会话，无法启动会话、发送消息或修改任何内容。",
};

/**
 * Disambiguates contextual strings (`decision === "contextual"`) using AST property & file context.
 * Returns `undefined` when no contextual override applies.
 */
export function resolveContextualTranslation(
  text: string,
  ctx?: TranslationContext,
): string | undefined {
  if (PROTECTED_EXACT_TOKENS.has(text)) {
    return text;
  }

  // 1. Paired Permission Mode descriptions (unambiguous full sentences)
  const permDesc = PERMISSION_MODE_DESCRIPTION_MAP[text];
  if (permDesc !== undefined) {
    return permDesc;
  }

  const file = ctx?.file ?? "";
  const prop = ctx?.prop ?? "";

  // 2. Never translate product branding files when they resolve "T3 Code" or stage names
  if (file.includes("branding")) {
    return text;
  }

  // 3. Disambiguate "Code" (id: 28):
  //    Translate as "代码" only when used as a standalone UI tab/section label or heading,
  //    never inside product names or enum values.
  if (text === "Code") {
    if (prop === "label" || prop === "title" || prop === "children" || prop === "heading") {
      return "代码";
    }
    return text;
  }

  // 4. Disambiguate "Auto" (id: 116):
  //    Capitalized "Auto" in UI labels/children translates to "自动" (paired with id: 4332 in permission modes).
  //    Lowercase "auto" is a wire/config enum value and is never translated.
  if (text === "Auto") {
    return "自动";
  }
  if (text === "auto") {
    return text;
  }

  // 5. Disambiguate "Click" (id: 3770):
  //    In SnapShots sound settings -> "快门声"; in interaction prompts -> "点击".
  if (text === "Click") {
    if (file.includes("snap-shot") || file.includes("SnapShot")) {
      return "快门声";
    }
    return "点击";
  }

  // 6. Disambiguate "Supervised", "Read only", "Read-only" in UI contexts
  if (text in PERMISSION_MODE_LABEL_MAP) {
    return PERMISSION_MODE_LABEL_MAP[text];
  }

  // 7. Lowercase setting reset nouns (e.g. "branch naming", "glass opacity", "chat width")
  //    Used with `SettingResetButton` (`Reset ${label}`) or `resetLabel` / `label` props in settings.
  const contextualHit = CONTEXTUAL_CATALOG[text];
  if (contextualHit !== undefined) {
    if (
      prop === "label" ||
      prop === "resetLabel" ||
      prop === "title" ||
      prop === "description" ||
      prop === "placeholder" ||
      prop === "tooltip" ||
      prop === "children" ||
      prop === "aria-label" ||
      file.includes("Settings") ||
      file.includes("settings")
    ) {
      return contextualHit;
    }
  }

  return contextualHit;
}
