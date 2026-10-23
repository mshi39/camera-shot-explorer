import { expect, test } from "vitest";
import { dragCamera, distanceDragDelta } from "./pointerOwnership";
import { PerspectiveCamera, Vector2, Vector3 } from "three";
import { DEFAULT_CAMERA_STATE } from "../camera/cameraTypes";
test("position handle changes only its selected degree of freedom", () => {
  const patch = dragCamera("horizontal", DEFAULT_CAMERA_STATE, 40, 10);
  expect(patch.horizontal).toBeGreaterThan(0);
  expect(patch).not.toHaveProperty("yaw");
  expect(patch).not.toHaveProperty("pitch");
});
test("rotation drag leaves position untouched", () => {
  const patch = dragCamera("roll", DEFAULT_CAMERA_STATE, 40, 10);
  expect(patch.roll).toBeLessThan(DEFAULT_CAMERA_STATE.roll);
  expect(dragCamera("roll", DEFAULT_CAMERA_STATE, -40, 0).roll).toBeGreaterThan(DEFAULT_CAMERA_STATE.roll);
  expect(patch).not.toHaveProperty("distance");
  expect(patch).not.toHaveProperty("horizontal");
});
test.each([5, -5])(
  "distance follows the projected radial path from observer x=%s",
  (x) => {
    const observer = new PerspectiveCamera(42, 1.5, 0.05, 100);
    observer.position.set(x, 3, 6);
    observer.lookAt(0, 1, 0);
    observer.updateMatrixWorld();
    const state = { ...DEFAULT_CAMERA_STATE, vertical: 0, distance: 2 };
    const screen = (z: number) => {
      const p = new Vector3(0, 1, z).project(observer);
      return new Vector2(p.x, p.y);
    };
    expect(
      distanceDragDelta(state, observer, screen(2), screen(3)),
    ).toBeCloseTo(1, 5);
    expect(
      distanceDragDelta(state, observer, screen(2), screen(1)),
    ).toBeCloseTo(-1, 5);
  },
);
