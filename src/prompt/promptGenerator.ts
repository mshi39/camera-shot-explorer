import type { FilmingCameraState } from "../camera/cameraTypes";
import type { ShotClassification } from "../classification/classification";
import { translate, type Language } from "../i18n";
export function generateShotPrompt(
  shot: ShotClassification,
  s: FilmingCameraState,
  language: Language = "en",
): string {
  if (language === "zh") {
    const t = (text: string) => translate(text, language);
    if (shot.size === "Unclassified") return `未分类画面，${t(shot.viewpoint)}视角，50mm 镜头，${s.aspect} 画幅；请调整构图，将人物纳入画面。`;
    return `${t(shot.size)}，${shot.angle === "Unclassified" ? "机位高度未分类" : t(shot.angle)}，${t(shot.viewpoint)}视角${shot.dutch ? `，${Math.abs(s.roll).toFixed(0)}° 荷兰角倾斜` : ""}，50mm 镜头，${s.aspect} 画幅，${t(shot.composition)}构图。`;
  }
  if (shot.size === "Unclassified")
    return `Unclassified framing, ${shot.viewpoint.toLowerCase()} viewpoint, 50mm lens, ${s.aspect} aspect ratio; adjust the framing to include the subject.`;
  const size = shot.size.charAt(0) + shot.size.slice(1).toLowerCase();
  return `${size}, ${shot.angle === "Unclassified" ? "unclassified camera level" : shot.angle.toLowerCase()}, ${shot.viewpoint.toLowerCase()} viewpoint${shot.dutch ? `, ${Math.abs(s.roll).toFixed(0)}° Dutch tilt` : ""}, 50mm lens, ${s.aspect} aspect ratio, ${shot.composition.toLowerCase()} composition.`;
}
