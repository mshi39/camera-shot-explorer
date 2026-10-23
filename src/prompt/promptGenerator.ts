import type { FilmingCameraState } from "../camera/cameraTypes";
import type { ShotClassification } from "../classification/classification";
export function generateShotPrompt(
  shot: ShotClassification,
  s: FilmingCameraState,
): string {
  if (shot.size === "Unclassified")
    return `Unclassified framing, ${shot.viewpoint.toLowerCase()} viewpoint, 50mm lens, ${s.aspect} aspect ratio; adjust the framing to include the subject.`;
  const size = shot.size.charAt(0) + shot.size.slice(1).toLowerCase();
  return `${size}, ${shot.angle === "Unclassified" ? "unclassified camera angle" : shot.angle.toLowerCase()}, ${shot.viewpoint.toLowerCase()} viewpoint${shot.dutch ? `, ${Math.abs(s.roll).toFixed(0)}° Dutch tilt` : ""}, 50mm lens, ${s.aspect} aspect ratio, ${shot.composition.toLowerCase()} composition.`;
}
