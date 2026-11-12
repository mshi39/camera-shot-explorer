import { useEffect } from "react";
import { useTranslation } from "../i18n";
import { Move, Rotate3D } from "lucide-react";
import { useCameraStore } from "../camera/cameraStore";
import type { CameraParameter } from "../camera/cameraTypes";
export function ModeSwitcher() {
  const t = useTranslation();
  const mode = useCameraStore((s) => s.mode),
    setMode = useCameraStore((s) => s.setMode);
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        e.repeat ||
        e.isComposing ||
        target?.closest?.('input,textarea,select,[contenteditable="true"]')
      )
        return;
      const s = useCameraStore.getState();
      if (s.dragging) return;
      const key = e.key.toLowerCase();
      const handles: Record<string, CameraParameter> =
        s.mode === "position"
          ? { h: "horizontal", v: "vertical", d: "distance" }
          : { y: "yaw", p: "pitch", r: "roll" };
      if (key === "s")
        s.setMode(s.mode === "position" ? "rotation" : "position");
      else if (key === "l") s.lookAtSubject();
      else if (key === "r" && e.shiftKey) {
        if (s.mode === "position") s.resetPosition();
        else s.resetRotation();
      } else if (key === "escape") s.setActiveHandle(null);
      else if (handles[key])
        s.setActiveHandle(
          s.activeHandle === handles[key] ? null : handles[key],
        );
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);
  return (
    <div className="mode-switch" role="group" aria-label={t("Camera mode")}>
      <button
        title={t("Move the camera (S)")}
        aria-label={t("Position mode")}
        aria-pressed={mode === "position"}
        onClick={() => setMode("position")}
      >
        <Move size={14} />
        <span>{t("Position")}</span>
      </button>
      <button
        title={t("Rotate the camera (S)")}
        aria-label={t("Rotation mode")}
        aria-pressed={mode === "rotation"}
        onClick={() => setMode("rotation")}
      >
        <Rotate3D size={14} />
        <span>{t("Rotation")}</span>
      </button>
      <kbd>S</kbd>
    </div>
  );
}
