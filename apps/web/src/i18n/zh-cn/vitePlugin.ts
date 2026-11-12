// @effect-diagnostics-next-line nodeBuiltinImport:off -- Vite resolves this plugin before an Effect runtime exists.
import * as NodePath from "node:path";
import type { Plugin } from "vite-plus";

import catalogJson from "./catalog.json" with { type: "json" };
import contextualCatalogJson from "./contextualCatalog.json" with { type: "json" };
import { PROTECTED_EXACT_TOKENS } from "./contextualRules";

const STATIC_CATALOG: Readonly<Record<string, string>> = catalogJson;
const CONTEXTUAL_CATALOG: Readonly<Record<string, string>> = contextualCatalogJson;

const UI_PROPERTY_KEYS: ReadonlySet<string> = new Set([
  "children",
  "label",
  "title",
  "description",
  "placeholder",
  "tooltip",
  "hint",
  "heading",
  "message",
  "emptyMessage",
  "aria-label",
  "aria-description",
  "resetLabel",
  "confirmLabel",
  "cancelLabel",
  "detail",
]);

const UI_MAP_DECLARATOR_PATTERN =
  /(?:_LABELS|_DESCRIPTIONS|_TITLES|_MESSAGES|_OPTIONS|runtimeModeConfig)$/u;

interface EstreeNode {
  readonly type: string;
  readonly start?: number;
  readonly end?: number;
  readonly value?: unknown;
  readonly key?: EstreeNode;
  readonly id?: EstreeNode;
  readonly name?: string;
  readonly test?: EstreeNode;
  readonly expressions?: ReadonlyArray<EstreeNode>;
  readonly quasis?: ReadonlyArray<{
    readonly value?: { readonly cooked?: string | null };
  }>;
  readonly [key: string]: unknown;
}

function getPropertyKeyName(propNode: EstreeNode): string | null {
  const key = propNode.key;
  if (!key) return null;
  if (typeof key.name === "string") return key.name;
  if (typeof key.value === "string") return key.value;
  return null;
}

/**
 * Determines whether `node` sits in a translatable UI value position, returning
 * the resolved property/context name (or `null` if it should not be translated).
 */
function resolveUiPropertyContext(
  node: EstreeNode,
  ancestors: ReadonlyArray<EstreeNode>,
): string | null {
  let i = ancestors.length - 2;
  let current: EstreeNode = node;

  while (i >= 0) {
    const parent = ancestors[i];
    if (!parent) return null;

    // Never translate import/export paths, switch cases, or binary comparisons
    if (
      parent.type === "ImportDeclaration" ||
      parent.type === "ExportNamedDeclaration" ||
      parent.type === "ExportAllDeclaration" ||
      parent.type === "ImportExpression" ||
      parent.type === "BinaryExpression" ||
      parent.type === "SwitchCase"
    ) {
      return null;
    }

    if (parent.type === "Property") {
      // Only translate property values, never object keys
      if (parent.value !== current) return null;
      const keyName = getPropertyKeyName(parent);
      if (
        keyName &&
        [
          "value",
          "id",
          "command",
          "path",
          "url",
          "href",
          "mode",
          "type",
          "model",
          "provider",
        ].includes(keyName)
      ) {
        return null;
      }
      if (keyName && (UI_PROPERTY_KEYS.has(keyName) || keyName.startsWith("/settings/"))) {
        return keyName;
      }
      // Check if this Property belongs to a `*_LABELS` / `*_DESCRIPTIONS` / `runtimeModeConfig` map
      for (let j = i - 1; j >= Math.max(0, i - 4); j--) {
        const outer = ancestors[j];
        if (
          outer?.type === "VariableDeclarator" &&
          typeof outer.id?.name === "string" &&
          UI_MAP_DECLARATOR_PATTERN.test(outer.id.name)
        ) {
          return keyName ?? outer.id.name;
        }
      }
      return null;
    }

    if (
      parent.type === "ArrayExpression" ||
      (parent.type === "ConditionalExpression" && parent.test !== current) ||
      parent.type === "LogicalExpression" ||
      parent.type === "SequenceExpression" ||
      parent.type === "ParenthesizedExpression"
    ) {
      current = parent;
      i--;
      continue;
    }

    return null;
  }

  return null;
}

function isEligibleUiSentenceFallback(
  value: string,
  ancestors: ReadonlyArray<EstreeNode>,
): boolean {
  if (value.length < 42 || !value.includes(" ") || !(value in STATIC_CATALOG)) {
    return false;
  }
  const parent = ancestors[ancestors.length - 2];
  if (!parent) return false;
  if (
    parent.type === "BinaryExpression" ||
    parent.type === "SwitchCase" ||
    parent.type === "ImportDeclaration" ||
    parent.type === "ExportNamedDeclaration" ||
    (parent.type === "Property" && parent.key === ancestors[ancestors.length - 1])
  ) {
    return false;
  }
  return true;
}

function hasCatalogEntry(text: string): boolean {
  if (PROTECTED_EXACT_TOKENS.has(text)) return false;
  if (text in STATIC_CATALOG || text in CONTEXTUAL_CATALOG) return true;
  const trimmed = text.trim();
  return Boolean(
    trimmed &&
    trimmed !== text &&
    !PROTECTED_EXACT_TOKENS.has(trimmed) &&
    (trimmed in STATIC_CATALOG || trimmed in CONTEXTUAL_CATALOG),
  );
}

function walkEstree(
  node: EstreeNode,
  ancestors: EstreeNode[],
  onNode: (n: EstreeNode, a: ReadonlyArray<EstreeNode>) => void,
): void {
  ancestors.push(node);
  onNode(node, ancestors);

  for (const key of Object.keys(node)) {
    if (key === "type" || key === "start" || key === "end" || key === "loc" || key === "range") {
      continue;
    }
    const child = node[key];
    if (Array.isArray(child)) {
      for (const item of child) {
        if (item && typeof item === "object" && typeof (item as EstreeNode).type === "string") {
          walkEstree(item as EstreeNode, ancestors, onNode);
        }
      }
    } else if (
      child &&
      typeof child === "object" &&
      typeof (child as EstreeNode).type === "string"
    ) {
      walkEstree(child as EstreeNode, ancestors, onNode);
    }
  }

  ancestors.pop();
}

/**
 * Zero-intrusion Vite plugin that injects `__t3zh(literal, ctx)` into compiled UI modules.
 *
 * - Runs at `enforce: "post"` (after `@vitejs/plugin-react` turns JSX into `_jsx` object properties).
 * - Automatically disabled in Vitest unit/browser runs unless `T3CODE_I18N_TEST === "1"`,
 *   so 100% of upstream English assertions continue to pass without modification.
 */
export function t3codeZhLocalizationPlugin(): Plugin {
  const runtimeImportPath = NodePath.resolve(import.meta.dirname, "runtime").replaceAll("\\", "/");
  let enabled = true;

  return {
    name: "t3code:zh-localization",
    enforce: "post",
    configResolved(config) {
      const isVitest =
        Boolean(process.env.VITEST) ||
        config.mode === "test" ||
        process.env.T3CODE_DISABLE_ZH === "1";
      enabled = !isVitest || process.env.T3CODE_I18N_TEST === "1";
    },
    transform(code, id) {
      if (!enabled) return null;

      const cleanId = id.split("?")[0]?.replaceAll("\\", "/") ?? "";
      if (!cleanId.includes("/apps/web/src/")) return null;
      if (!/\.(?:tsx|ts|jsx|js)$/u.test(cleanId)) return null;
      if (
        cleanId.includes("/src/i18n/") ||
        /\.(?:test|spec|renders)\.(?:tsx|ts|jsx|js)$/u.test(cleanId) ||
        cleanId.endsWith("/branding.ts") ||
        cleanId.endsWith("/branding.logic.ts")
      ) {
        return null;
      }

      let ast: EstreeNode;
      try {
        ast = this.parse(code) as unknown as EstreeNode;
      } catch {
        return null;
      }

      const fileBase = NodePath.basename(cleanId);
      const edits: Array<{ start: number; end: number; replacement: string }> = [];

      walkEstree(ast, [], (node, ancestors) => {
        let value: string | null = null;
        if (node.type === "Literal" && typeof node.value === "string") {
          value = node.value;
        } else if (
          node.type === "TemplateLiteral" &&
          Array.isArray(node.expressions) &&
          node.expressions.length === 0 &&
          Array.isArray(node.quasis) &&
          node.quasis.length === 1
        ) {
          value = node.quasis[0]?.value?.cooked ?? null;
        }

        if (
          !value ||
          typeof node.start !== "number" ||
          typeof node.end !== "number" ||
          !hasCatalogEntry(value)
        ) {
          return;
        }

        const propCtx =
          resolveUiPropertyContext(node, ancestors) ??
          (isEligibleUiSentenceFallback(value, ancestors) ? "sentence" : null);

        if (!propCtx) return;

        const ctxKey = `${fileBase}:${propCtx}`;
        edits.push({
          start: node.start,
          end: node.end,
          replacement: `__t3zh(${JSON.stringify(value)}, ${JSON.stringify(ctxKey)})`,
        });
      });

      if (edits.length === 0) return null;

      // Apply replacements from back to front so character offsets remain exact
      edits.sort((a, b) => b.start - a.start);
      let transformed = code;
      for (const edit of edits) {
        transformed =
          transformed.slice(0, edit.start) + edit.replacement + transformed.slice(edit.end);
      }

      const header = `import { __t3zh } from ${JSON.stringify(runtimeImportPath)};\n`;
      return {
        code: header + transformed,
        map: null,
      };
    },
  };
}
