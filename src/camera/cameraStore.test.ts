import { beforeEach, expect, test } from "vitest";
import { useCameraStore } from "./cameraStore";
import { DEFAULT_CAMERA_STATE } from "./cameraTypes";
beforeEach(() =>
  useCameraStore.setState({
    filming: { ...DEFAULT_CAMERA_STATE },
    revision: 0,
  }),
);
test("position and rotation updates and resets are independent", () => {
  const store = useCameraStore.getState;
  store().updateCamera({ horizontal: 60, pitch: 15, roll: 20 });
  store().resetPosition();
  expect(store().filming.horizontal).toBe(0);
  expect(store().filming.pitch).toBe(15);
  expect(store().filming.roll).toBe(20);
  store().updateCamera({ distance: 5 });
  store().resetRotation();
  expect(store().filming.distance).toBe(5);
  expect(store().filming.pitch).toBe(DEFAULT_CAMERA_STATE.pitch);
});
test("invalid values cannot poison the live camera and limits are enforced", () => {
  const store = useCameraStore.getState;
  store().updateCamera({ distance: -10, vertical: 100, yaw: NaN });
  expect(store().filming.distance).toBe(0.35);
  expect(store().filming.vertical).toBe(90);
  expect(store().filming.yaw).toBe(0);
  store().updateCamera({ distance: 99 });
  expect(store().filming.distance).toBe(20);
});

test("camera can reach directly above the head and aim straight down", () => {
  const store = useCameraStore.getState;
  store().updateCamera({ vertical: 90, distance: 2, pitch: -90 });
  expect(store().filming.vertical).toBe(90);
  expect(store().filming.pitch).toBe(-90);
});
test("workspace and mode changes do not invalidate the shot revision", () => {
  const store = useCameraStore.getState;
  store().setMode("rotation");
  store().setObservation({ position: [5, 4, 5], target: [0, 1, 0] });
  expect(store().revision).toBe(0);
  expect(store().filming).toEqual(DEFAULT_CAMERA_STATE);
});
