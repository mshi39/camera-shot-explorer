import { Aperture, Mouse, Move, Rotate3D, CircleHelp } from "lucide-react";
import { useState } from "react";
import { WorkspaceScene } from "../scene/WorkspaceScene";
import { CameraPreview } from "../scene/CameraPreview";
import { ModeSwitcher } from "../controls/ModeSwitcher";
import { CameraActions } from "../controls/CameraActions";
import { CameraControls } from "../controls/CameraControls";
import { PromptPanel } from "../prompt/PromptPanel";
import { ShotInformation } from "../ui/ShotInformation";
import { useClassification } from "../classification/useClassification";
import { useCameraStore } from "../camera/cameraStore";
import type { CameraParameter } from "../camera/cameraTypes";
export default function App() {
  const shot = useClassification(),
    aspect = useCameraStore((s) => s.filming.aspect),
    mode = useCameraStore((s) => s.mode),
    activeHandle = useCameraStore((s) => s.activeHandle),
    [help, setHelp] = useState(false);
  const axes: { key: CameraParameter; label: string }[] =
    mode === "position"
      ? [
          { key: "horizontal", label: "H" },
          { key: "vertical", label: "V" },
          { key: "distance", label: "D" },
        ]
      : [
          { key: "yaw", label: "Y" },
          { key: "pitch", label: "P" },
          { key: "roll", label: "R" },
        ];
  return (
    <main className="app">
      <header className="app-header">
        <Aperture size={22} strokeWidth={1.3} />
        <strong>Camera Shot Explorer</strong>
        <span>A study in perspective</span>
        <div
          className="help-anchor"
          onKeyDown={(e) => {
            if (e.key === "Escape") setHelp(false);
          }}
        >
          <button
            className="help-toggle"
            aria-label="Interaction guide"
            aria-expanded={help}
            aria-controls="interaction-guide"
            onClick={() => setHelp(!help)}
          >
            <CircleHelp size={16} />
          </button>
          {help && (
            <div
              id="interaction-guide"
              className="help-panel"
              role="region"
              aria-label="Interaction guide details"
            >
              <strong>Explore your shot</strong>
              <p>
                Drag the background to orbit your view. Scroll to zoom the
                workspace.
              </p>
              <p>
                Select and drag the camera. Use H / V / D in Position mode or Y
                / P / R in Rotation mode to restrict dragging to one axis. Press
                the same key again or Esc to release it.
              </p>
              <p>
                <kbd>S</kbd> switches modes. <kbd>Shift+R</kbd> resets position or rotation in the active mode.{" "}
                <kbd>L</kbd> aims at the subject.
              </p>
              <button onClick={() => setHelp(false)}>Got it</button>
            </div>
          )}
        </div>
      </header>
      <div className="studio">
        <section
          className="workspace"
          aria-label="Interactive 3D scene"
          data-testid="workspace"
        >
          <WorkspaceScene />
          <div className="workspace-toolbar">
            <select
              title="Output framing"
              aria-label="Aspect ratio"
              value={aspect}
              onChange={(e) =>
                useCameraStore
                  .getState()
                  .updateCamera({ aspect: e.target.value as "16:9" | "9:16" })
              }
            >
              <option>16:9</option>
              <option>9:16</option>
            </select>
            <ModeSwitcher />
            <CameraActions />
          </div>
          <div className="workspace-footer">
            <div className="selection-status">
              {mode === "position" ? (
                <Move size={14} />
              ) : (
                <Rotate3D size={14} />
              )}
              <span>Camera selected</span>
              <div
                className="axis-shortcuts"
                role="group"
                aria-label="Restrict camera drag"
              >
                {axes.map(({ key, label }) => (
                  <button
                    key={key}
                    title={`Restrict drag to ${key} (${label})`}
                    aria-label={`Select ${key} handle`}
                    aria-pressed={activeHandle === key}
                    onClick={() =>
                      useCameraStore
                        .getState()
                        .setActiveHandle(activeHandle === key ? null : key)
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
              <span className="muted" role="status">
                {activeHandle
                  ? `${activeHandle} only · Esc to release`
                  : "Drag camera or handles"}
              </span>
            </div>
            <div className="navigation-hint">
              <Mouse size={13} />
              <span>Drag background to orbit</span>
              <span className="hint-divider" />
              <span>Scroll to zoom</span>
            </div>
          </div>
        </section>
        <aside className="inspector">
          <div className="preview-heading">
            <h1>Camera Preview</h1>
            <span className="live-label">
              <i />
              LIVE
            </span>
          </div>
          <CameraPreview />
          <ShotInformation shot={shot} />
          <CameraControls />
          <PromptPanel />
        </aside>
      </div>
      <footer className="app-footer">
        <span>Explore the frame.</span>
        <span>
          50mm fixed lens<span className="footer-dot">·</span>Changes saved on
          this device
        </span>
      </footer>
    </main>
  );
}
