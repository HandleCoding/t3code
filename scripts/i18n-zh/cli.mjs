#!/usr/bin/env node
// Compile reviewed translations, validate the catalogs, or audit new upstream UI strings.
// Usage: node scripts/i18n-zh/cli.mjs <sync|status|test|audit-upstream>

import * as NodeAssert from "node:assert/strict";
import * as NodeFS from "node:fs";
import * as NodePath from "node:path";
import * as NodeURL from "node:url";

const __dirname = NodePath.dirname(NodeURL.fileURLToPath(import.meta.url));
const REPO_ROOT = NodePath.resolve(__dirname, "../..");
const DATA_DIR = NodePath.join(__dirname, "data");
const ZH_MODULE_DIR = NodePath.join(REPO_ROOT, "apps/web/src/i18n/zh-cn");
const GT_EN_PATH = NodePath.join(REPO_ROOT, "apps/web/src/i18n/translations/en.json");
const GT_ZH_PATH = NodePath.join(REPO_ROOT, "apps/web/src/i18n/translations/zh.json");

const PROTECTED_BRANDS = [
  "T3 Code",
  "T3 Connect",
  "T3 Chat",
  "ChatGPT",
  "OpenAI",
  "Codex",
  "Claude Code",
  "Antigravity",
  "DeepSeek Harness",
  "Simlock",
  "OpenRouter",
  "Anthropic",
  "1Password",
  "Tailscale",
  "Open VSX",
  "ACP Registry",
];

const PERMISSION_PAIRS = [
  {
    labelId: 341,
    labelEn: "Supervised",
    labelZh: "监督模式",
    descId: 4330,
    descEn: "Ask before commands and file changes.",
    descZh: "在执行命令和修改文件前先询问。",
  },
  {
    labelId: 342,
    labelEn: "Auto-accept edits",
    labelZh: "自动接受编辑",
    descId: 4331,
    descEn: "Auto-approve edits, ask before other actions.",
    descZh: "自动批准文件编辑，执行其他操作前仍需询问。",
  },
  {
    labelId: 116,
    labelEn: "Auto",
    labelZh: "自动",
    descId: 4332,
    descEn: "Supported providers approve routine actions; others still ask.",
    descZh: "受支持的模型服务会自动批准常规操作，其余情况仍需询问。",
  },
  {
    labelId: 343,
    labelEn: "Full access",
    labelZh: "完全访问权限",
    descId: 4333,
    descEn: "Allow commands and edits without prompts.",
    descZh: "允许直接执行命令和编辑文件，无需确认提示。",
  },
  {
    labelId: 259,
    labelEn: "Read only",
    labelZh: "只读",
    descId: 4334,
    descEn: "Read projects and threads. Cannot start, message or change anything.",
    descZh: "仅可查看项目和会话，无法启动会话、发送消息或修改任何内容。",
  },
];

function loadReviewed() {
  const file = NodePath.join(DATA_DIR, "reviewed-translations.json");
  return JSON.parse(NodeFS.readFileSync(file, "utf8"));
}

function cmdSync() {
  const reviewed = loadReviewed();
  NodeFS.mkdirSync(ZH_MODULE_DIR, { recursive: true });

  const catalog = {};
  const contextualCatalog = {};

  for (const item of reviewed) {
    if (item.decision === "translate") {
      if (item.english && item.recommended && item.english !== item.recommended) {
        catalog[item.english] = item.recommended;
      }
    } else if (item.decision === "contextual") {
      if (item.english && item.recommended) {
        contextualCatalog[item.english] = item.recommended;
      }
    }
  }

  const catalogPath = NodePath.join(ZH_MODULE_DIR, "catalog.json");
  const contextualPath = NodePath.join(ZH_MODULE_DIR, "contextualCatalog.json");

  NodeFS.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + "\n", "utf8");
  NodeFS.writeFileSync(contextualPath, JSON.stringify(contextualCatalog, null, 2) + "\n", "utf8");

  let gtUpdated = 0;
  if (NodeFS.existsSync(GT_EN_PATH) && NodeFS.existsSync(GT_ZH_PATH)) {
    const gtEn = JSON.parse(NodeFS.readFileSync(GT_EN_PATH, "utf8"));
    const gtZh = JSON.parse(NodeFS.readFileSync(GT_ZH_PATH, "utf8"));
    for (const [hash, enText] of Object.entries(gtEn)) {
      const preferred = catalog[enText] ?? contextualCatalog[enText];
      if (preferred && gtZh[hash] !== preferred) {
        gtZh[hash] = preferred;
        gtUpdated++;
      }
    }
    NodeFS.writeFileSync(GT_ZH_PATH, JSON.stringify(gtZh, null, 2) + "\n", "utf8");
  }

  console.log(
    JSON.stringify(
      {
        status: "ok",
        totalReviewed: reviewed.length,
        staticCatalogEntries: Object.keys(catalog).length,
        contextualEntries: Object.keys(contextualCatalog).length,
        gtZhAlignedEntries: gtUpdated,
      },
      null,
      2,
    ),
  );
}

function cmdStatus() {
  const reviewed = loadReviewed();
  const byId = new Map(reviewed.map((r) => [r.id, r]));
  const stats = { translate: 0, keep: 0, contextual: 0, exclude: 0 };
  const brandViolations = [];

  for (const r of reviewed) {
    stats[r.decision] = (stats[r.decision] ?? 0) + 1;
    if (r.decision !== "exclude") {
      for (const brand of PROTECTED_BRANDS) {
        if (r.english.includes(brand) && !r.recommended.includes(brand)) {
          brandViolations.push({ id: r.id, brand, english: r.english, recommended: r.recommended });
        }
      }
    }
  }

  const pairChecks = PERMISSION_PAIRS.map((p) => {
    const lbl = byId.get(p.labelId);
    const dsc = byId.get(p.descId);
    return {
      mode: p.labelEn,
      labelOk: lbl?.recommended === p.labelZh,
      descOk: dsc?.recommended === p.descZh,
      label: `${lbl?.english} -> ${lbl?.recommended}`,
      description: `${dsc?.english} -> ${dsc?.recommended}`,
    };
  });

  console.log(
    JSON.stringify(
      {
        totalEntries: reviewed.length,
        stats,
        brandViolations: brandViolations.length,
        permissionPairsVerified: pairChecks.every((p) => p.labelOk && p.descOk),
        permissionPairs: pairChecks,
      },
      null,
      2,
    ),
  );

  if (brandViolations.length > 0 || !pairChecks.every((p) => p.labelOk && p.descOk)) {
    process.exitCode = 1;
  }
}

function cmdTest() {
  const catalog = JSON.parse(
    NodeFS.readFileSync(NodePath.join(ZH_MODULE_DIR, "catalog.json"), "utf8"),
  );
  const contextual = JSON.parse(
    NodeFS.readFileSync(NodePath.join(ZH_MODULE_DIR, "contextualCatalog.json"), "utf8"),
  );
  const gtEn = JSON.parse(NodeFS.readFileSync(GT_EN_PATH, "utf8"));
  const gtZh = JSON.parse(NodeFS.readFileSync(GT_ZH_PATH, "utf8"));

  // 1. Verify all 5 permission pairs in compiled catalogs
  for (const pair of PERMISSION_PAIRS) {
    const actualLabel = catalog[pair.labelEn] ?? contextual[pair.labelEn];
    const actualDesc = catalog[pair.descEn] ?? contextual[pair.descEn];
    NodeAssert.equal(actualLabel, pair.labelZh, `Permission label mismatch for ${pair.labelEn}`);
    NodeAssert.equal(actualDesc, pair.descZh, `Permission description mismatch for ${pair.descEn}`);
  }

  // 2. Verify "T3 Code" and other brands are never in static catalog with altered brand text
  NodeAssert.equal(catalog["T3 Code"], undefined, "T3 Code must be protected and never in catalog");
  NodeAssert.equal(catalog["Claude Code"], undefined, "Claude Code must be protected");
  NodeAssert.equal(
    catalog["Code"],
    undefined,
    "Ambiguous 'Code' must not be in global static catalog",
  );
  NodeAssert.equal(contextual["Code"], "代码", "'Code' must be in contextual catalog as '代码'");
  NodeAssert.equal(contextual["Auto"], "自动", "'Auto' must be in contextual catalog as '自动'");

  // 3. Verify gt-react zh.json alignment
  for (const [hash, enText] of Object.entries(gtEn)) {
    if (enText === "Threads") NodeAssert.equal(gtZh[hash], "会话");
    if (enText === "Agents") NodeAssert.equal(gtZh[hash], "Agent");
    if (enText === "Providers") NodeAssert.equal(gtZh[hash], "模型服务");
    if (enText === "Source control") NodeAssert.equal(gtZh[hash], "版本控制");
  }

  console.log("✓ All localization engine & catalog assertions passed!");
}

function walkFiles(dir, out = []) {
  for (const entry of NodeFS.readdirSync(dir, { withFileTypes: true })) {
    const full = NodePath.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist" || entry.name === "zh-cn")
        continue;
      walkFiles(full, out);
    } else if (
      /\.(tsx|ts)$/.test(entry.name) &&
      !/\.(test|spec|renders)\.(tsx|ts)$/.test(entry.name)
    ) {
      out.push(full);
    }
  }
  return out;
}

function cmdAuditUpstream() {
  const reviewed = loadReviewed();
  const known = new Map(reviewed.map((r) => [r.english, r]));
  const srcRoot = NodePath.join(REPO_ROOT, "apps/web/src");
  const files = walkFiles(srcRoot);

  const propRegex =
    /\b(?:label|title|description|placeholder|tooltip|hint|heading|message|emptyMessage|aria-label|aria-description)\s*[:=]\s*(?:"([^"\\\n]{2,200})"|'([^'\\\n]{2,200})')/g;

  const foundInSource = new Set();
  const untranslated = [];

  for (const file of files) {
    const content = NodeFS.readFileSync(file, "utf8");
    let match;
    while ((match = propRegex.exec(content)) !== null) {
      const value = match[1] ?? match[2];
      if (!value || !/[A-Za-z]/.test(value)) continue;
      if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/")) {
        continue;
      }
      foundInSource.add(value);
      if (!known.has(value)) {
        untranslated.push({
          english: value,
          file: NodePath.relative(REPO_ROOT, file),
        });
      }
    }
  }

  const uniqueUntranslated = Array.from(
    new Map(untranslated.map((item) => [item.english, item])).values(),
  );
  const deltaPath = NodePath.join(DATA_DIR, "untranslated-delta.json");
  NodeFS.writeFileSync(deltaPath, JSON.stringify(uniqueUntranslated, null, 2) + "\n", "utf8");

  const coveredCount = foundInSource.size - uniqueUntranslated.length;
  console.log(
    JSON.stringify(
      {
        scannedFiles: files.length,
        distinctUiPropertyLiterals: foundInSource.size,
        coveredByReviewedCatalog: coveredCount,
        coveragePercent:
          foundInSource.size > 0
            ? Number(((coveredCount / foundInSource.size) * 100).toFixed(2))
            : 100,
        newUntranslatedDeltaCount: uniqueUntranslated.length,
        deltaFile: NodePath.relative(REPO_ROOT, deltaPath),
      },
      null,
      2,
    ),
  );
}

const command = process.argv[2] ?? "status";
if (command === "sync") {
  cmdSync();
} else if (command === "status") {
  cmdStatus();
} else if (command === "test") {
  cmdTest();
} else if (command === "audit-upstream") {
  cmdAuditUpstream();
} else {
  console.error(`Unknown command: ${command}. Expected: sync | status | test | audit-upstream`);
  process.exitCode = 1;
}
