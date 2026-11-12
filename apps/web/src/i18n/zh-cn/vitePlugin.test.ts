import { describe, expect, it } from "vite-plus/test";
import { parseAst } from "vite-plus";
import { t3codeZhLocalizationPlugin } from "./vitePlugin";

function transform(source: string): string {
  const plugin = t3codeZhLocalizationPlugin();
  const hook = plugin.transform;
  if (typeof hook !== "function") throw new Error("Missing transform hook");
  const result = hook.call(
    { parse: parseAst } as never,
    source,
    "/fixture/apps/web/src/components/Permissions.tsx",
  );
  if (result && typeof result === "object" && "code" in result) return result.code.toString();
  throw new Error("Expected transformed UI module");
}

describe("Chinese UI translation transform", () => {
  it("translates display text while preserving option values, brands and user expressions", () => {
    const result = transform(
      'const MODE_OPTIONS = [{ value: "Code", label: "Code" }]; const ui = {title: "T3 Code", children: userMessage};',
    );
    expect(result).toContain('value: "Code"');
    expect(result).toContain('label: __t3zh("Code", "Permissions.tsx:label")');
    expect(result).toContain('title: "T3 Code"');
    expect(result).toContain("children: userMessage");
    expect(result).not.toContain("__t3zh(userMessage");
  });

  it("injects both permission labels and descriptions without altering wire mode keys", () => {
    const result = transform(
      'const runtimeModeConfig = {"auto-accept-edits": {label: "Auto-accept edits", description: "Auto-approve edits, ask before other actions."}};',
    );
    expect(result).toContain('"auto-accept-edits":');
    expect(result).toContain('__t3zh("Auto-accept edits",');
    expect(result).toContain('__t3zh("Auto-approve edits, ask before other actions.",');
  });
});
