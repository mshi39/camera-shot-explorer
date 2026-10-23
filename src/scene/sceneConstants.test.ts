import { expect, test } from "vitest";
import { SUBJECT_LANDMARKS } from "./sceneConstants";
import { createFilmingCamera } from "../camera/cameraMath";
import { DEFAULT_CAMERA_STATE } from "../camera/cameraTypes";
import { Vector3 } from "three";
test("subject landmarks project top to bottom in the opening shot", () => {
  const camera = createFilmingCamera(DEFAULT_CAMERA_STATE);
  const names = [
    "head",
    "eyes",
    "shoulders",
    "chest",
    "waist",
    "thigh",
    "knees",
    "feet",
  ] as const;
  const ys = names.map(
    (n) => new Vector3(...SUBJECT_LANDMARKS[n]).project(camera).y,
  );
  expect(ys.every((y, i) => i === 0 || y < ys[i - 1])).toBe(true);
  expect(ys[0]).toBeLessThan(1);
  expect(ys[4]).toBeGreaterThan(-1.15);
});
