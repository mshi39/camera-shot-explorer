import { Euler, MathUtils, PerspectiveCamera, Vector3 } from "three";
import { EYES, ORBIT_CENTER, type FilmingCameraState } from "./cameraTypes";
export function positionFromOrbit(
  s: Pick<FilmingCameraState, "horizontal" | "vertical" | "distance">,
): Vector3 {
  const h = MathUtils.degToRad(s.horizontal),
    v = MathUtils.degToRad(s.vertical);
  return new Vector3(
    s.distance * Math.sin(h) * Math.cos(v),
    s.distance * Math.sin(v),
    s.distance * Math.cos(h) * Math.cos(v),
  ).add(new Vector3(...ORBIT_CENTER));
}
export function cameraEuler(
  s: Pick<FilmingCameraState, "yaw" | "pitch" | "roll">,
): Euler {
  return new Euler(
    MathUtils.degToRad(s.pitch),
    MathUtils.degToRad(s.yaw),
    MathUtils.degToRad(s.roll),
    "YXZ",
  );
}
export function applyFilmingCamera(
  camera: PerspectiveCamera,
  s: FilmingCameraState,
): void {
  const landscape = s.aspect === "16:9";
  camera.aspect = landscape ? 16 / 9 : 9 / 16;
  // Rotate a 16:9 crop of a 36x24mm full-frame sensor for portrait framing.
  camera.fov = MathUtils.radToDeg(
    2 * Math.atan((landscape ? 20.25 : 36) / 100),
  );
  camera.filmGauge = 36;
  camera.near = 0.025;
  camera.far = 100;
  camera.position.copy(positionFromOrbit(s));
  camera.rotation.copy(cameraEuler(s));
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);
}
export function createFilmingCamera(s: FilmingCameraState): PerspectiveCamera {
  const camera = new PerspectiveCamera();
  applyFilmingCamera(camera, s);
  return camera;
}
export function lookAtEyesPreservingRoll(
  s: FilmingCameraState,
): Pick<FilmingCameraState, "yaw" | "pitch" | "roll"> {
  const d = new Vector3(...EYES).sub(positionFromOrbit(s)).normalize();
  return {
    yaw: MathUtils.radToDeg(Math.atan2(-d.x, -d.z)),
    pitch: MathUtils.radToDeg(Math.asin(d.y)),
    roll: s.roll,
  };
}
