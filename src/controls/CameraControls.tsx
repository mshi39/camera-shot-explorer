import { useCameraStore } from "../camera/cameraStore";
import { useState } from "react";
import { CAMERA_LIMITS, type CameraParameter } from "../camera/cameraTypes";
const labels: Record<CameraParameter, string> = {
  horizontal: "Horizontal Orbit",
  vertical: "Vertical Orbit",
  distance: "Distance",
  yaw: "Yaw",
  pitch: "Pitch",
  roll: "Roll",
};
const tips: Record<CameraParameter, string> = {
  horizontal: "Move around the subject. Camera orientation stays unchanged.",
  vertical:
    "Move above or below the subject. Camera orientation stays unchanged.",
  distance: "Move the filming camera closer to or farther from the subject.",
  yaw: "Turn left or right without moving the camera.",
  pitch: "Tilt up or down without moving the camera.",
  roll: "Rotate around the lens axis. At 5° or more, the shot has a Dutch angle.",
};
export function CameraControls() {
  const [draft, setDraft] = useState<{
    key: CameraParameter;
    value: string;
  } | null>(null);
  const mode = useCameraStore((s) => s.mode),
    filming = useCameraStore((s) => s.filming),
    update = useCameraStore((s) => s.updateCamera);
  const parameters: CameraParameter[] =
    mode === "position"
      ? ["horizontal", "vertical", "distance"]
      : ["yaw", "pitch", "roll"];
  return (
    <section className="camera-controls" aria-label="Camera controls">
      <div className="section-heading">
        <h2>{mode === "position" ? "Camera position" : "Camera rotation"}</h2>
        <span>Drag in scene or adjust below</span>
      </div>
      {parameters.map((key) => (
        <div className="control-row" key={key}>
          <label htmlFor={`slider-${key}`} title={tips[key]}>
            {labels[key]}
          </label>
          <div className="number-field">
            <input
              aria-label={`${labels[key]} value`}
              type="number"
              min={CAMERA_LIMITS[key][0]}
              max={CAMERA_LIMITS[key][1]}
              step={key === "distance" ? 0.01 : 0.1}
              value={
                draft?.key === key
                  ? draft.value
                  : Number(filming[key].toFixed(2))
              }
              onFocus={(e) => setDraft({ key, value: e.target.value })}
              onBlur={() => setDraft(null)}
              onChange={(e) => {
                setDraft({ key, value: e.target.value });
                if (e.target.value !== "")
                  update({ [key]: e.target.valueAsNumber });
              }}
            />
            <span>{key === "distance" ? "m" : "°"}</span>
          </div>
          <input
            id={`slider-${key}`}
            aria-label={labels[key]}
            type="range"
            min={CAMERA_LIMITS[key][0]}
            max={CAMERA_LIMITS[key][1]}
            step={key === "distance" ? 0.01 : 0.1}
            value={filming[key]}
            onChange={(e) => update({ [key]: Number(e.target.value) })}
          />
        </div>
      ))}
    </section>
  );
}
