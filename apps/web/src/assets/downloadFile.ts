export async function downloadAssetFile(url: string, fileName: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("The file could not be loaded. Try again.");
  const downloadUrl = URL.createObjectURL(await response.blob());
  // Keep the blob alive until the browser has consumed the download click.
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 30_000);
  const anchor = document.createElement("a");
  anchor.href = downloadUrl;
  anchor.download = fileName;
  anchor.click();
}
