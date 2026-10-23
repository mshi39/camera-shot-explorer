import { expect, test } from "vitest";
import { classifyShot, projectSubject, classifyFraming } from "./classifier";
import { DEFAULT_CAMERA_STATE } from "../camera/cameraTypes";
import { lookAtEyesPreservingRoll } from "../camera/cameraMath";

test.each([
  [1.64, "Eye Level"],
  [1.44, "Shoulder Level"],
  [1.28, "Chest Level"],
  [0.96, "Waist Level"],
  [0.89, "Hip Level"],
  [0.73, "Thigh Level"],
  [0.49, "Knee Level"],
  [0.35, "Shin Level"],
  [0.245, "Tatami Level"],
  [0.1, "Ankle Level"],
  [0.01, "Ground Level"],
  [1.2, "Chest Level"],
  [2.2, "Unclassified"],
  [-0.2, "Unclassified"],
])(
  "camera height %s identifies %s independently of shot size",
  (height, level) => {
    const y = Number(height) - 1;
    const s = {
      ...DEFAULT_CAMERA_STATE,
      vertical: (Math.atan2(y, 3) * 180) / Math.PI,
      distance: Math.hypot(y, 3),
      pitch: 0,
    };
    expect(classifyShot(s).angle).toBe(level);
  },
);

test("camera levels have no gaps from eye height to the floor and ignore lens tilt", () => {
  for (let i=0;i<=164;i++) {
    const y=i/100-1;
    const s={...DEFAULT_CAMERA_STATE,vertical:Math.atan2(y,3)*180/Math.PI,distance:Math.hypot(y,3)};
    const level=classifyShot(s).angle;
    expect(level).not.toBe("Unclassified");
    expect(classifyShot({...s,pitch:75}).angle).toBe(level);
  }
});
test("Overhead Level requires placement directly above the head and a downward lens", () => {
  const s = { ...DEFAULT_CAMERA_STATE, vertical: 90, distance: 2, pitch: -90 };
  expect(classifyShot(s).angle).toBe("Overhead Level");
  expect(classifyShot({ ...s, vertical: 80 }).angle).toBe("Unclassified");
  expect(classifyShot({ ...s, pitch: 0 }).angle).toBe("Unclassified");
});

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
