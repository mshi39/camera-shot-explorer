import { expect, test } from "vitest";
import { classifyShot, projectSubject, classifyFraming } from "./classifier";
import { DEFAULT_CAMERA_STATE } from "../camera/cameraTypes";
import { lookAtEyesPreservingRoll } from "../camera/cameraMath";

test("full-height but sideways clipped subjects are not full shots", () => {
  expect(
    classifyShot({
      ...DEFAULT_CAMERA_STATE,
      aspect: "9:16",
      vertical: 0,
      distance: 3,
      yaw: 10,
      pitch: 0,
    }).size,
  ).toBe("Unclassified");
});
test("low-angle facial detail remains classifiable when torso is behind camera", () => {
  const state = {
    ...DEFAULT_CAMERA_STATE,
    vertical: 48.8140748343,
    distance: 0.5315072906,
  };
  expect(
    classifyShot({ ...state, ...lookAtEyesPreservingRoll(state) }).size,
  ).toBe("Extreme Close-Up");
});
test("initial composition is Medium Shot, Eye Level, Front and centered", () => {
  expect(classifyShot(DEFAULT_CAMERA_STATE)).toMatchObject({
    size: "Medium Shot",
    angle: "Eye Level",
    viewpoint: "Front",
    composition: "Centered",
    dutch: false,
  });
});
test.each([
  [0.1, "Long Shot"],
  [0.69, "Long Shot"],
  [0.71, "Full Shot"],
  [0.95, "Full Shot"],
])("fully visible occupancy %s yields %s", (occupancy, size) => {
  expect(
    classifyFraming({
      fullBody: true,
      occupancy: Number(occupancy),
      cropHeight: 0,
      visible: 1,
      headVisible: true,
      faceVisible: true,
    }),
  ).toBe(size);
});
test.each([
  [0.49, "Medium Full Shot"],
  [0.73, "Cowboy Shot"],
  [0.96, "Medium Shot"],
  [1.28, "Medium Close-Up"],
  [1.45, "Close-Up"],
  [1.6, "Extreme Close-Up"],
])("crop at %s yields %s", (cropHeight, size) => {
  expect(
    classifyFraming({
      fullBody: false,
      occupancy: 2,
      cropHeight: Number(cropHeight),
      visible: 0.8,
      headVisible: true,
      faceVisible: true,
    }),
  ).toBe(size);
});
test("visibility does not reject deliberate tight facial detail crops", () => {
  expect(
    classifyFraming({
      fullBody: false,
      occupancy: 8,
      cropHeight: 1.6,
      visible: 0.12,
      headVisible: false,
      faceVisible: true,
    }),
  ).toBe("Extreme Close-Up");
});
test("keeps previous size inside boundary band", () => {
  expect(
    classifyFraming(
      {
        fullBody: true,
        occupancy: 0.705,
        cropHeight: 0,
        visible: 1,
        headVisible: true,
        faceVisible: true,
      },
      "Long Shot",
    ),
  ).toBe("Long Shot");
  expect(
    classifyFraming(
      {
        fullBody: true,
        occupancy: 0.74,
        cropHeight: 0,
        visible: 1,
        headVisible: true,
        faceVisible: true,
      },
      "Long Shot",
    ),
  ).toBe("Full Shot");
});
test("looking away returns Unclassified rather than an invented closeup", () => {
  expect(classifyShot({ ...DEFAULT_CAMERA_STATE, yaw: 180 }).size).toBe(
    "Unclassified",
  );
});
test("Dutch threshold is symmetric and independent of shot size", () => {
  expect(classifyShot({ ...DEFAULT_CAMERA_STATE, roll: 4.99 }).dutch).toBe(
    false,
  );
  expect(classifyShot({ ...DEFAULT_CAMERA_STATE, roll: -5 }).dutch).toBe(true);
});
test("side-facing camera aimed at eyes identifies Profile", () => {
  const s = { ...DEFAULT_CAMERA_STATE, horizontal: 90 };
  expect(classifyShot({ ...s, ...lookAtEyesPreservingRoll(s) }).viewpoint).toBe(
    "Profile",
  );
});
test("ratio changes use the actual film gate for landmark projection", () => {
  const a = projectSubject(DEFAULT_CAMERA_STATE),
    b = projectSubject({ ...DEFAULT_CAMERA_STATE, aspect: "9:16" });
  expect(a.occupancy).toBeGreaterThan(b.occupancy);
});
test("clipping the top of a medium-scale subject does not imply extreme close-up", () => {
  expect(
    classifyFraming({
      fullBody: false,
      occupancy: 2,
      cropHeight: 0.96,
      visible: 0.4,
      headVisible: false,
      faceVisible: true,
    }),
  ).toBe("Unclassified");
});
