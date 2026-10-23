import type {
  CameraParameter,
  FilmingCameraState,
} from "../camera/cameraTypes";
export type DragKind = CameraParameter | "position" | "rotation";
export function dragCamera(
  kind: DragKind,
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
  if (kind === "distance") return { distance: start.distance + dx * 0.012 };
  if (kind === "vertical" || kind === "pitch")
    return { [kind]: start[kind] - dy * 0.35 };
  return { [kind]: start[kind] + dx * 0.4 };
}
