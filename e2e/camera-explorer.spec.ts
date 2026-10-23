import { test, expect } from "@playwright/test";
import { PerspectiveCamera, Vector3 } from "three";
async function scenePoint(
  page: import("@playwright/test").Page,
  point: [number, number, number],
) {
  const box = (await page.locator("canvas").first().boundingBox())!;
  const c = new PerspectiveCamera(42, box.width / box.height, 0.05, 150);
  c.position.set(5.2, 3.6, 6.2);
  c.lookAt(0, 1.1, 0.6);
  c.updateMatrixWorld();
  const p = new Vector3(...point).project(c);
  return {
    x: box.x + ((p.x + 1) / 2) * box.width,
    y: box.y + ((1 - p.y) / 2) * box.height,
  };
}
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("shot-size")).toHaveText("Medium Shot");
  await expect(page.locator("canvas")).toHaveCount(2);
  await page.waitForTimeout(1000);
});
test("renders both real WebGL views and fits the preview aspect ratio", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const canvas = page.locator("canvas").last();
  const data = await canvas.evaluate((c: HTMLCanvasElement) => c.toDataURL());
  expect(data.length).toBeGreaterThan(5000);
  const frame = await page.getByTestId("preview-frame").boundingBox();
  expect(frame!.width / frame!.height).toBeCloseTo(16 / 9, 1);
  await page.screenshot({ path: "test-results/desktop.png" });
  expect(errors).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("direct camera dragging changes position while preserving rotation and observation", async ({
  page,
}) => {
  const p = await scenePoint(page, [0, 1.64, 2.2]);
  await page.mouse.move(p.x, p.y);
  await page.mouse.down();
  await page.mouse.move(p.x + 70, p.y - 25, { steps: 20 });
  await page.mouse.up();
  await expect(
    page.getByRole("spinbutton", { name: "Horizontal Orbit value" }),
  ).not.toHaveValue("0");
  await page.getByRole("button", { name: "Rotation mode" }).click();
  await expect(
    page.getByRole("spinbutton", { name: "Pitch value" }),
  ).toHaveValue("-6");
  await page.waitForTimeout(350);
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("camera-shot-explorer.session.v1")!),
  );
  expect(saved.observation.position[0]).toBeCloseTo(5.2, 2);
  expect(saved.observation.position[2]).toBeCloseTo(6.2, 2);
});
test("rotation ring drag changes roll without moving camera", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Rotation mode" }).click();
  const pitch = (-6 * Math.PI) / 180;
  const p = await scenePoint(page, [
    -0.389,
    1.64 + 0.389 * Math.cos(pitch),
    2.2 + 0.389 * Math.sin(pitch),
  ]);
  await page.mouse.move(p.x, p.y);
  await page.mouse.down();
  await page.mouse.move(p.x + 40, p.y, { steps: 15 });
  await page.mouse.up();
  await expect(
    page.getByRole("spinbutton", { name: "Roll value" }),
  ).not.toHaveValue("0");
  await page.getByRole("button", { name: "Position mode" }).click();
  await expect(
    page.getByRole("spinbutton", { name: "Distance value" }),
  ).toHaveValue("2.29");
  await expect(
    page.getByRole("spinbutton", { name: "Horizontal Orbit value" }),
  ).toHaveValue("0");
});
test("large desktop layout and preview match their framing", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.waitForTimeout(500);
  const f = (await page.getByTestId("preview-frame").boundingBox())!;
  expect(f.width / f.height).toBeCloseTo(16 / 9, 2);
  await page.screenshot({ path: "test-results/large-desktop.png" });
});
test("workspace drag and wheel leave filming camera and prompt unchanged", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Refresh prompt" }).click();
  const prompt = await page.getByTestId("prompt-text").innerText();
  const horizontal = await page
    .getByRole("spinbutton", { name: "Horizontal Orbit value" })
    .inputValue();
  const distance = await page
    .getByRole("spinbutton", { name: "Distance value" })
    .inputValue();
  const before = await page
    .locator("canvas")
    .first()
    .evaluate((c: HTMLCanvasElement) => c.toDataURL());
  await page.mouse.move(120, 360);
  await page.mouse.down();
  await page.mouse.move(250, 430, { steps: 15 });
  await page.mouse.up();
  await page.mouse.wheel(0, 200);
  await page.waitForTimeout(500);
  const after = await page
    .locator("canvas")
    .first()
    .evaluate((c: HTMLCanvasElement) => c.toDataURL());
  expect(after).not.toBe(before);
  await expect(
    page.getByRole("spinbutton", { name: "Horizontal Orbit value" }),
  ).toHaveValue(horizontal);
  await expect(
    page.getByRole("spinbutton", { name: "Distance value" }),
  ).toHaveValue(distance);
  await expect(page.getByTestId("prompt-text")).toHaveText(prompt);
  await expect(page.getByText("Out of date")).toHaveCount(0);
});
test("mode shortcut, independent reset menu, ratio, and manual prompt work", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Refresh prompt" }).click();
  const prompt = await page.getByTestId("prompt-text").innerText();
  await page
    .getByRole("spinbutton", { name: "Horizontal Orbit value" })
    .fill("40");
  await page
    .getByRole("spinbutton", { name: "Horizontal Orbit value" })
    .press("Tab");
  await page.getByRole("button", { name: "Rotation mode" }).click();
  await page.getByRole("spinbutton", { name: "Roll value" }).fill("20");
  await page.getByRole("spinbutton", { name: "Roll value" }).blur();
  await page.keyboard.press("s");
  await expect(
    page.getByRole("spinbutton", { name: "Distance value" }),
  ).toBeVisible();
  await page.keyboard.press("s");
  await page.getByRole("button", { name: "More camera actions" }).click();
  await page.getByRole("menuitem", { name: "Position Reset" }).click();
  await expect(
    page.getByRole("spinbutton", { name: "Roll value" }),
  ).toHaveValue("20");
  await page
    .getByRole("button", { name: "Rotation Reset", exact: true })
    .click();
  await expect(
    page.getByRole("spinbutton", { name: "Roll value" }),
  ).toHaveValue("0");
  await page
    .getByRole("combobox", { name: "Aspect ratio" })
    .selectOption("9:16");
  await expect(page.getByText("Out of date")).toBeVisible();
  await expect(page.getByTestId("prompt-text")).toHaveText(prompt);
  const frame = await page.getByTestId("preview-frame").boundingBox();
  expect(frame!.width / frame!.height).toBeCloseTo(9 / 16, 1);
  await page.getByRole("button", { name: "Refresh prompt" }).click();
  await expect(page.getByTestId("prompt-text")).toContainText("9:16");
  await page.screenshot({ path: "test-results/portrait.png" });
  await page.waitForTimeout(350);
  await page.reload();
  await expect(
    page.getByRole("combobox", { name: "Aspect ratio" }),
  ).toHaveValue("9:16");
  await expect(page.getByTestId("prompt-text")).toContainText("Click Refresh");
});
