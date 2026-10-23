import { test, expect } from "@playwright/test";
import { PerspectiveCamera, Vector3 } from "three";
async function scenePoint(
  page: import("@playwright/test").Page,
  point: [number, number, number],
  observerX = 5.2,
) {
  const box = (await page.locator("canvas").first().boundingBox())!;
  const c = new PerspectiveCamera(42, box.width / box.height, 0.05, 150);
  c.position.set(observerX, 3.6, 6.2);
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

test("camera level naming, body-height coverage and pastel handles are visible", async ({page}) => {
  await expect(page.getByText("Camera level",{exact:true})).toBeVisible();
  await expect(page.getByText("Camera angle",{exact:true})).toHaveCount(0);
  await page.screenshot({path:"test-results/position-colors.png"});
  await page.keyboard.press("s");
  await page.screenshot({path:"test-results/rotation-colors.png"});
  await page.keyboard.press("s");
  const height=.245, z=2.2;
  await page.getByRole("spinbutton",{name:"Vertical Orbit value"}).fill(String(Math.atan2(height-1,z)*180/Math.PI));
  await page.getByRole("spinbutton",{name:"Distance value"}).fill(String(Math.hypot(height-1,z)));
  await expect(page.getByText("Tatami Level",{exact:true})).toBeVisible();
});

for (const observerX of [5.2, -5.2]) {
  test(`distance drag follows inward and outward mouse motion from observer x=${observerX}`, async ({
    page,
  }) => {
    if (observerX < 0) {
      await page.evaluate(() =>
        localStorage.setItem(
          "camera-shot-explorer.session.v1",
          JSON.stringify({
            version: 1,
            filming: {
              horizontal: 0,
              vertical: (Math.atan2(0.64, 2.2) * 180) / Math.PI,
              distance: Math.hypot(0.64, 2.2),
              yaw: 0,
              pitch: -6,
              roll: 0,
              aspect: "16:9",
            },
            observation: { position: [-5.2, 3.6, 6.2], target: [0, 1.1, 0.6] },
          }),
        ),
      );
      await page.reload();
      await page.waitForTimeout(1000);
    }
    const radius = Math.hypot(0.64, 2.2),
      ay = 0.64 / radius,
      az = 2.2 / radius;
    const location = async (offset: number) =>
      scenePoint(
        page,
        [0, 1 + ay * (radius + 0.55 + offset), az * (radius + 0.55 + offset)],
        observerX,
      );
    const a = await location(0),
      b = await location(0.4);
    await page.mouse.move(a.x, a.y);
    await page.mouse.down();
    await page.mouse.move(b.x, b.y, { steps: 15 });
    await page.mouse.up();
    const field = page.getByRole("spinbutton", { name: "Distance value" });
    expect(Number(await field.inputValue())).toBeCloseTo(radius + 0.4, 1);
    await page.mouse.move(b.x, b.y);
    await page.mouse.down();
    await page.mouse.move(a.x, a.y, { steps: 15 });
    await page.mouse.up();
    expect(Number(await field.inputValue())).toBeCloseTo(radius, 1);
  });
}

test("keyboard selects a rotation axis and camera-body dragging respects it", async ({
  page,
}) => {
  await page.keyboard.press("s");
  await page.keyboard.press("y");
  await expect(
    page.getByRole("button", { name: "Select yaw handle" }),
  ).toHaveAttribute("aria-pressed", "true");
  const a = await scenePoint(page, [0, 1.64, 2.2]);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.mouse.move(a.x + 35, a.y + 20, { steps: 12 });
  await page.mouse.up();
  await expect(
    page.getByRole("spinbutton", { name: "Yaw value" }),
  ).not.toHaveValue("0");
  await expect(
    page.getByRole("spinbutton", { name: "Pitch value" }),
  ).toHaveValue("-6");
  await page.keyboard.press("r");
  await expect(
    page.getByRole("button", { name: "Select roll handle" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Shift+R");
  await expect(page.getByRole("spinbutton", { name: "Yaw value" })).toHaveValue(
    "0",
  );
  await page.keyboard.press("l");
  await expect(
    page.getByRole("spinbutton", { name: "Pitch value" }),
  ).toHaveValue("0");
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Select roll handle" }),
  ).toHaveAttribute("aria-pressed", "false");
});

test("help appears directly beneath the top-right question mark", async ({
  page,
}) => {
  const button = page.getByRole("button", {
    name: "Interaction guide",
    exact: true,
  });
  await button.click();
  const help = page.getByRole("region", { name: "Interaction guide details" });
  await expect(help).toBeVisible();
  const a = (await button.boundingBox())!,
    b = (await help.boundingBox())!;
  expect(b.y).toBeGreaterThan(a.y + a.height);
  expect(b.y - a.y - a.height).toBeLessThan(25);
  expect(Math.abs(b.x + b.width - a.x - a.width)).toBeLessThan(2);
  await page.screenshot({ path: "test-results/help-popover.png" });
  await help.getByRole("button", { name: "Got it" }).click();
  await expect(help).not.toBeVisible();
});

test("camera level stays informative below the face and can reach overhead", async ({
  page,
}) => {
  const level = page
    .locator(".shot-information")
    .getByText("Waist Level", { exact: true });
  await page
    .getByRole("spinbutton", { name: "Vertical Orbit value" })
    .fill("0");
  await expect(level).toBeVisible();
  await page
    .getByRole("spinbutton", { name: "Vertical Orbit value" })
    .fill("90");
  await page.getByRole("button", { name: "Rotation mode" }).click();
  await page.getByRole("spinbutton", { name: "Pitch value" }).fill("-90");
  await expect(
    page
      .locator(".shot-information")
      .getByText("Overhead Level", { exact: true }),
  ).toBeVisible();
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
