import catalogJson from "./catalog.json";
import {
  PROTECTED_EXACT_TOKENS,
  resolveContextualTranslation,
  type TranslationContext,
} from "./contextualRules";

const STATIC_CATALOG: Readonly<Record<string, string>> = catalogJson;

let localeResolver: (() => boolean) | undefined;

export function setZhLocaleResolver(resolver: () => boolean): void {
  localeResolver = resolver;
}

/**
 * In the Chinese localized fork, `"system"` defaults to Chinese (`zh`) unless the user
 * explicitly picks another language (e.g. `"en"`) in Settings -> General -> Language.
 */
function isZhLocaleActive(): boolean {
  try {
    // UI modules translate constants during evaluation, before settings are initialized.
    return localeResolver?.() ?? true;
  } catch {
    return true;
  }
}

function parseContextKey(ctxKey?: string): TranslationContext | undefined {
  if (!ctxKey) return undefined;
  const sep = ctxKey.indexOf(":");
  if (sep < 0) return { prop: ctxKey };
  return {
    file: ctxKey.slice(0, sep),
    prop: ctxKey.slice(sep + 1),
  };
}

/**
 * Runtime translation entry point injected by `t3codeZhLocalizationPlugin` on static UI literals.
 * Never called on user/agent chat messages, code blocks, or terminal output.
 */
export function __t3zh(text: string, ctxKey?: string): string {
  if (!text || !isZhLocaleActive()) {
    return text;
  }
  if (PROTECTED_EXACT_TOKENS.has(text)) {
    return text;
  }

  const ctx = parseContextKey(ctxKey);

  // 1. Check context-disambiguated rules first (permissions, "Code" vs "T3 Code", "Auto", reset labels)
  const contextual = resolveContextualTranslation(text, ctx);
  if (contextual !== undefined) {
    return contextual;
  }

  // 2. Check static safe catalog
  const direct = STATIC_CATALOG[text];
  if (direct !== undefined) {
    return direct;
  }

  // 3. Preserve leading/trailing whitespace around a known static phrase
  const trimmed = text.trim();
  if (trimmed && trimmed !== text) {
    const trimmedHit = STATIC_CATALOG[trimmed] ?? resolveContextualTranslation(trimmed, ctx);
    if (trimmedHit !== undefined && trimmedHit !== trimmed) {
      const leading = text.slice(0, text.indexOf(trimmed));
      const trailing = text.slice(text.indexOf(trimmed) + trimmed.length);
      return `${leading}${trimmedHit}${trailing}`;
    }
  }

  return text;
}
