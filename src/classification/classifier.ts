import { Vector3 } from "three";
import { createFilmingCamera } from "../camera/cameraMath";
import type { FilmingCameraState } from "../camera/cameraTypes";
import { SUBJECT_LANDMARKS } from "../scene/sceneConstants";
import type { Framing, ShotClassification, ShotSize } from "./classification";
export function projectSubject(s: FilmingCameraState): Framing {
  const camera = createFilmingCamera(s);
  const project = (x: number, y: number, z = 0) =>
    new Vector3(x, y, z).project(camera);
  const inFrame = (p: Vector3) =>
    p.z >= -1 && p.z <= 1 && Math.abs(p.x) <= 1 && Math.abs(p.y) <= 1;
  const head = project(0, 1.8),
    feet = project(0, 0.025),
    eye = project(...SUBJECT_LANDMARKS.eyes);
  const samples = Array.from({ length: 181 }, (_, i) => ({
    height: i / 100,
    p: project(0, i / 100),
  }));
  const visible = samples.filter(({ p }) => inFrame(p));
  const behind = visible.length === 0 && !inFrame(eye);
  const corners = [-0.32, 0.32].flatMap((x) =>
    [0.025, 1.8].flatMap((y) => [-0.11, 0.11].map((z) => project(x, y, z))),
  );
  const xmin = Math.min(...corners.map((p) => p.x)),
    xmax = Math.max(...corners.map((p) => p.x));
  const ymin = Math.min(...corners.map((p) => p.y)),
    ymax = Math.max(...corners.map((p) => p.y));
  const area = Math.max(0.0001, (xmax - xmin) * (ymax - ymin));
  const overlap =
    Math.max(0, Math.min(1, xmax) - Math.max(-1, xmin)) *
    Math.max(0, Math.min(1, ymax) - Math.max(-1, ymin));
  return {
    fullBody: inFrame(head) && inFrame(feet) && xmin >= -1 && xmax <= 1,
    clippedFullHeight:
      inFrame(head) && inFrame(feet) && (xmin < -1 || xmax > 1),
    occupancy: Math.hypot(head.x - feet.x, head.y - feet.y) / 2,
    cropHeight: visible[0]?.height ?? 2,
    visible: behind ? 0 : overlap / area,
    headVisible: inFrame(head),
    faceVisible: inFrame(eye),
    centerX: (xmin + xmax) / 4 + 0.5,
    behind,
  };
}
const crops: { height: number; size: ShotSize }[] = [
  { height: 0.49, size: "Medium Full Shot" },
  { height: 0.73, size: "Cowboy Shot" },
  { height: 0.96, size: "Medium Shot" },
  { height: 1.28, size: "Medium Close-Up" },
  { height: 1.45, size: "Close-Up" },
  { height: 1.65, size: "Extreme Close-Up" },
];
export function classifyFraming(f: Framing, previous?: ShotSize): ShotSize {
  if (
    f.behind ||
    f.clippedFullHeight ||
    (!f.headVisible && !f.faceVisible) ||
    f.visible === 0
  )
    return "Unclassified";
  // A tight face crop can occupy <25% of whole-body bounds; visible facial detail is still valid.
  if (f.visible < 0.25 && !f.faceVisible) return "Unclassified";
  if (f.fullBody) {
    if (previous === "Long Shot" && f.occupancy < 0.72) return previous;
    if (previous === "Full Shot" && f.occupancy > 0.68) return previous;
    return f.occupancy < 0.7 ? "Long Shot" : "Full Shot";
  }
  if (!f.headVisible && f.faceVisible)
    return f.occupancy >= 3.5 ? "Extreme Close-Up" : "Unclassified";
  let index = 0;
  for (let i = 0; i < crops.length - 1; i++) {
    const boundary = (crops[i].height + crops[i + 1].height) / 2;
    const tolerance = (0.02 * 1.8) / Math.max(1, f.occupancy);
    if (
      Math.abs(f.cropHeight - boundary) < tolerance &&
      (previous === crops[i].size || previous === crops[i + 1].size)
    )
      return previous;
    if (f.cropHeight >= boundary) index = i + 1;
  }
  return crops[index].size;
}
export function classifyShot(
  s: FilmingCameraState,
  previous?: ShotClassification,
): ShotClassification {
  const f = projectSubject(s),
    camera = createFilmingCamera(s),
    height = camera.position.y - 1.64;
  const forward = camera.getWorldDirection(new Vector3());
  let angle = "Eye Level";
  if (forward.y < -0.9 && height > 0.35) angle = "Overhead";
  else if (height > 0.2 && forward.y < -0.04) angle = "High Angle";
  else if (height < -0.2 && forward.y > 0.04) angle = "Low Angle";
  else if (Math.abs(height) > 0.2) angle = "Unclassified";
  const bearing = Math.abs(s.horizontal);
  const viewpoint =
    bearing < 22.5
      ? "Front"
      : bearing < 67.5
        ? "Three-Quarter Front"
        : bearing < 112.5
          ? "Profile"
          : bearing < 157.5
            ? "Rear Three-Quarter"
            : "Back";
  const size = classifyFraming(f, previous?.size);
  return {
    size,
    angle: size === "Unclassified" ? "Unclassified" : angle,
    viewpoint,
    composition:
      size === "Unclassified"
        ? "Unclassified"
        : (f.centerX ?? 0.5) < 0.42
          ? "Left-weighted"
          : (f.centerX ?? 0.5) > 0.58
            ? "Right-weighted"
            : "Centered",
    dutch: Math.abs(s.roll) >= 5,
  };
}
