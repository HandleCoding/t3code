import { describe, expect, it } from "vite-plus/test";
import { __t3zh, setZhLocaleResolver } from "./runtime";

const startupLabel = __t3zh("Agent", "TraitsPicker.tsx:agent");

describe("Chinese translation startup", () => {
  it("translates module constants before the settings runtime starts", () => {
    expect(startupLabel).toBe("智能体");
    expect(__t3zh("T3 Code")).toBe("T3 Code");
  });

  it("uses the language resolver after startup", () => {
    try {
      setZhLocaleResolver(() => false);
      expect(__t3zh("Code", "Example.tsx:label")).toBe("Code");
      setZhLocaleResolver(() => true);
      expect(__t3zh("Code", "Example.tsx:label")).toBe("代码");
    } finally {
      setZhLocaleResolver(() => true);
    }
  });
});
