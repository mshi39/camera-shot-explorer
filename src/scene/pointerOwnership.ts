import type {
  CameraParameter,
  FilmingCameraState,
} from "../camera/cameraTypes";
import { ORBIT_CENTER } from "../camera/cameraTypes";
import { positionFromOrbit } from "../camera/cameraMath";
import { Camera, Plane, Raycaster, Vector2, Vector3 } from "three";

export function distanceDragDelta(
  start: FilmingCameraState,
  observer: Camera,
  from: Vector2,
  to: Vector2,
): number {
  const position = positionFromOrbit(start);
  const axis = position
    .clone()
    .sub(new Vector3(...ORBIT_CENTER))
    .normalize();
  const normal = observer.getWorldDirection(new Vector3());
  normal.addScaledVector(axis, -normal.dot(axis));
  // End-on radial motion has no usable screen direction; keep the current distance.
  if (normal.lengthSq() < 0.0001) return 0;
  const plane = new Plane().setFromNormalAndCoplanarPoint(
    normal.normalize(),
    position,
  );
  const ray = new Raycaster();
  ray.setFromCamera(from, observer);
  const a = ray.ray.intersectPlane(plane, new Vector3());
  ray.setFromCamera(to, observer);
  const b = ray.ray.intersectPlane(plane, new Vector3());
  return a && b ? b.sub(a).dot(axis) : 0;
}
export type DragKind = CameraParameter | "position" | "rotation";
export function dragCamera(
  kind: Exclude<DragKind, "distance">,
  start: FilmingCameraState,
  dx: number,
  dy: number,
): Partial<FilmingCameraState> {
  if (kind === "position")
    return {
      horizontal: start.horizontal + dx * 0.35,
      vertical: start.vertical - dy * 0.25,
    };
  if (kind === "rotation")
    return { yaw: start.yaw - dx * 0.3, pitch: start.pitch - dy * 0.3 };
  if (kind === "vertical" || kind === "pitch")
    return { [kind]: start[kind] - dy * 0.35 };
  if (kind === "roll") return { roll: start.roll - dx * 0.4 };
  return { [kind]: start[kind] + dx * 0.4 };
}
