import { expect, test } from "vitest";
import { dragCamera } from "./pointerOwnership";
import { DEFAULT_CAMERA_STATE } from "../camera/cameraTypes";
test("position handle changes only its selected degree of freedom", () => {
  const patch = dragCamera("horizontal", DEFAULT_CAMERA_STATE, 40, 10);
  expect(patch.horizontal).toBeGreaterThan(0);
  expect(patch).not.toHaveProperty("yaw");
  expect(patch).not.toHaveProperty("pitch");
});
test("rotation drag leaves position untouched", () => {
  const patch = dragCamera("roll", DEFAULT_CAMERA_STATE, 40, 10);
  expect(patch.roll).not.toBe(0);
  expect(patch).not.toHaveProperty("distance");
  expect(patch).not.toHaveProperty("horizontal");
});
test("distance handle supports moving in both directions", () => {
  expect(
    dragCamera("distance", DEFAULT_CAMERA_STATE, 30, 0).distance,
  ).toBeGreaterThan(DEFAULT_CAMERA_STATE.distance);
  expect(
    dragCamera("distance", DEFAULT_CAMERA_STATE, -30, 0).distance,
  ).toBeLessThan(DEFAULT_CAMERA_STATE.distance);
});
