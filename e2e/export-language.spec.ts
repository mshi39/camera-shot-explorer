import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("export downloads only the preview canvas in both aspect ratios", async ({ page }) => {
  await page.goto("/");
  const exportButton = page.getByRole("button", { name: "Export Image" });
  await expect(exportButton).toBeEnabled();
  for (const ratio of ["16:9", "9:16"]) {
    await page.getByRole("combobox", { name: "Aspect ratio" }).selectOption(ratio);
    await page.waitForTimeout(500);
    const canvas = page.locator('[data-testid="preview-frame"] canvas');
    const expected = await canvas.evaluate((el: HTMLCanvasElement) => ({ width: el.width, height: el.height, png: el.toDataURL("image/png").split(",")[1] }));
    const downloadPromise = page.waitForEvent("download");
    await exportButton.click();
    const download = await downloadPromise;
    const png = await readFile((await download.path())!);
    expect(png.readUInt32BE(16)).toBe(expected.width);
    expect(png.readUInt32BE(20)).toBe(expected.height);
    expect(expected.width / expected.height).toBeCloseTo(ratio === "16:9" ? 16 / 9 : 9 / 16, 1);
    expect(png.equals(Buffer.from(expected.png, "base64"))).toBe(true);
    await expect(page.locator(".preview-ratio")).toHaveText(ratio);
  }
});

test("Chinese interface and prompt preserve manual refresh and language preference", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Refresh prompt" }).click();
  await page.getByRole("combobox", { name: "Aspect ratio" }).selectOption("9:16");
  await page.getByRole("button", { name: "切换到中文" }).click();
  await expect(page.getByRole("heading", { name: "相机预览" })).toBeVisible();
  await expect(page.getByRole("button", { name: "导出图片" })).toBeEnabled();
  await expect(page.getByTestId("prompt-text")).toContainText("16:9");
  await expect(page.getByText("待刷新")).toBeVisible();
  await page.getByRole("button", { name: "刷新提示词" }).click();
  await expect(page.getByTestId("prompt-text")).toContainText("9:16");
  await expect(page.getByTestId("prompt-text")).toContainText("50mm 镜头");
  await page.getByRole("button", { name: "旋转模式", exact: true }).click();
  await expect(page.getByRole("slider", { name: "偏航", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "操作指南", exact: true }).click();
  await expect(page.getByText("探索你的镜头")).toBeVisible();
  await page.getByRole("button", { name: "知道了" }).click();
  await page.screenshot({ path: "test-results/chinese-interface.png" });
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.getByTestId("prompt-text")).toHaveText("点击刷新生成提示词。");
  for (const [width, height] of [[1366, 768], [1024, 500], [390, 844]]) {
    await page.setViewportSize({ width, height });
    await page.getByRole("button", { name: "刷新提示词" }).click();
    const size = await page.locator(".inspector").evaluate(el => [el.scrollHeight, el.clientHeight]);
    expect(size[0]).toBeLessThanOrEqual(size[1] + 1);
  }
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.getByRole("heading", { name: "Camera Preview" })).toBeVisible();
});
