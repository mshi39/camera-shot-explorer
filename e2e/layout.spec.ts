import { test, expect } from "@playwright/test";

test("preview panel fits the viewport with empty and generated prompts", async ({ page }) => {
  for (const [width, height] of [[1920, 1080], [1366, 768], [1280, 600], [1024, 500], [390, 844]]) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await expect(page.getByTestId("prompt-text")).toHaveCSS("display", "block");
    for (const generated of [false, true]) {
      if (generated) await page.getByRole("button", { name: "Refresh prompt" }).click();
      const dimensions = await page.locator(".inspector").evaluate((el) => ({
        scroll: el.scrollHeight, height: el.clientHeight,
        bottom: el.getBoundingClientRect().bottom,
        preview: el.querySelector(".preview-mat")!.getBoundingClientRect().height,
      }));
      expect(dimensions.scroll, `${width}x${height}`).toBeLessThanOrEqual(dimensions.height + 1);
      expect(dimensions.bottom).toBeLessThanOrEqual(height);
      expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(height);
      expect(dimensions.preview).toBeGreaterThan(20);
      if (generated) await expect(page.getByTestId("prompt-text")).toHaveCSS("font-size", "14px");
    }
  }
});
