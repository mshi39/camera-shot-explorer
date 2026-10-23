import { describe, expect, test } from "vitest";
import { Vector3 } from "three";
import { DEFAULT_CAMERA_STATE } from "./cameraTypes";
import {
  createFilmingCamera,
  positionFromOrbit,
  lookAtEyesPreservingRoll,
} from "./cameraMath";
describe("camera projection and transforms", () => {
  test("starts at eye height and projects a waist-up composition", () => {
    const camera = createFilmingCamera(DEFAULT_CAMERA_STATE);
    expect(camera.position.y).toBeCloseTo(1.64, 2);
    const top = new Vector3(0, 1.8, 0).project(camera);
    const waist = new Vector3(0, 0.96, 0).project(camera);
    expect(top.y).toBeGreaterThan(0.65);
    expect(top.y).toBeLessThan(0.93);
    expect(waist.y).toBeGreaterThan(-1.15);
    expect(waist.y).toBeLessThan(-0.7);
  });
  test("a quarter orbit reaches the subject side without depending on rotation", () => {
    const a = positionFromOrbit({
      ...DEFAULT_CAMERA_STATE,
      horizontal: 90,
      vertical: 0,
      distance: 3,
    });
    expect(a.x).toBeCloseTo(3);
    expect(a.z).toBeCloseTo(0);
  });
  test("look at eyes points forward at eyes and preserves roll from elevated locations", () => {
    const s = {
      ...DEFAULT_CAMERA_STATE,
      horizontal: 45,
      vertical: 35,
      roll: 23,
    };
    const rotation = lookAtEyesPreservingRoll(s);
    const camera = createFilmingCamera({ ...s, ...rotation });
    const direction = new Vector3(0, 1.64, 0.08)
      .sub(camera.position)
      .normalize();
    expect(camera.getWorldDirection(new Vector3()).dot(direction)).toBeCloseTo(
      1,
      6,
    );
    expect(rotation.roll).toBe(23);
  });
  test("ratio changes rotate the gate without moving or rotating the camera", () => {
    const a = createFilmingCamera(DEFAULT_CAMERA_STATE);
    const b = createFilmingCamera({ ...DEFAULT_CAMERA_STATE, aspect: "9:16" });
    expect(a.position.toArray()).toEqual(b.position.toArray());
    expect(a.quaternion.toArray()).toEqual(b.quaternion.toArray());
    expect(a.aspect).toBeCloseTo(16 / 9);
    expect(b.aspect).toBeCloseTo(9 / 16);
    expect(b.fov).toBeGreaterThan(a.fov);
  });
});
