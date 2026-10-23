import { useEffect } from "react";
import { Move, Rotate3D } from "lucide-react";
import { useCameraStore } from "../camera/cameraStore";
export function ModeSwitcher() {
  const mode = useCameraStore((s) => s.mode),
    setMode = useCameraStore((s) => s.setMode);
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        e.key.toLowerCase() !== "s" ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        e.repeat ||
        target?.closest?.('input,textarea,select,[contenteditable="true"]')
      )
        return;
      e.preventDefault();
      const s = useCameraStore.getState();
      s.setMode(s.mode === "position" ? "rotation" : "position");
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);
  return (
    <div className="mode-switch" role="group" aria-label="Camera mode">
      <button
        title="Move the camera (S)"
        aria-label="Position mode"
        aria-pressed={mode === "position"}
        onClick={() => setMode("position")}
      >
        <Move size={14} />
        <span>Position</span>
      </button>
      <button
        title="Rotate the camera (S)"
        aria-label="Rotation mode"
        aria-pressed={mode === "rotation"}
        onClick={() => setMode("rotation")}
      >
        <Rotate3D size={14} />
        <span>Rotation</span>
      </button>
      <kbd>S</kbd>
    </div>
  );
}
