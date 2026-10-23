import { test, expect } from "@playwright/test";
test("rendered preview camera matches authoritative math", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("canvas")).toHaveCount(2);
  await page.waitForTimeout(1000);
  const values = await page.evaluate(async () => {
    const url = "/node_modules/.vite/deps/@react-three_fiber.js";
    const { _roots } = await import(url);
    return [..._roots.values()].map((r: any) => {
      const c = r.store.getState().camera;
      return {
        fov: c.fov,
        aspect: c.aspect,
        position: c.position.toArray(),
        rotation: c.rotation.toArray(),
        manual: c.manual,
      };
    });
  });
  expect(values[1].fov).toBeCloseTo(22.895, 1);
  expect(values[1].aspect).toBeCloseTo(16 / 9, 3);
  expect(values[1].rotation[0]).toBeCloseTo((-6 * Math.PI) / 180, 4);
});
