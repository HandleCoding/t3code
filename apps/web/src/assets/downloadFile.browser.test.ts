import { describe, expect, it, vi } from "vite-plus/test";

import { downloadAssetFile } from "./downloadFile";

describe("file downloads", () => {
  it("preserves binary bytes and Unicode filenames in the browser download", async () => {
    let received: Promise<ArrayBuffer> | undefined;
    let fileName: string | undefined;
    using click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      fileName = this.download;
      received = fetch(this.href).then((response) => response.arrayBuffer());
    });
    await downloadAssetFile("data:application/octet-stream;base64,AP8BgA==", "报告 #1.zip");
    expect(click).toHaveBeenCalledOnce();
    expect(fileName).toBe("报告 #1.zip");
    expect(new Uint8Array(await received!)).toEqual(new Uint8Array([0, 255, 1, 128]));
  });

  it("reports an HTTP failure without downloading its error body", async () => {
    using _fetch = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("denied", { status: 403 }));
    using click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    await expect(downloadAssetFile("/denied", "report.md")).rejects.toThrow("could not be loaded");
    expect(click).not.toHaveBeenCalled();
  });
});
