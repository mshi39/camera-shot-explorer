import { test, expect } from "@playwright/test";
test("rendered preview camera matches authoritative math", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("canvas")).toHaveCount(2);
  const readCameras = () => page.evaluate(async () => {
    // Import the module URL actually loaded by Vite, including its cache version.
    const url = performance.getEntriesByType("resource").map((r) => r.name).find((name) => name.includes("/@react-three_fiber.js"));
    if (!url) return [];
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
  await expect.poll(async () => (await readCameras()).filter((c) => c.manual).length).toBe(1);
  const preview = (await readCameras()).find((c) => c.manual)!;
  expect(preview.fov).toBeCloseTo(22.895, 1);
  expect(preview.aspect).toBeCloseTo(16 / 9, 3);
  expect(preview.rotation[0]).toBeCloseTo((-6 * Math.PI) / 180, 4);
  await page.getByRole("button", { name: "Rotation mode", exact: true }).click();
  for (const roll of [-30, 30]) {
    await page.getByRole("spinbutton", { name: "Roll value" }).fill(String(roll));
    await expect.poll(async () => (await readCameras()).find((c) => c.manual)!.rotation[2]).toBeCloseTo(-roll * Math.PI / 180, 4);
  }
});
