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
export default function App() {
  const shot = useClassification(),
    aspect = useCameraStore((s) => s.filming.aspect),
    mode = useCameraStore((s) => s.mode),
    [help, setHelp] = useState(false);
  return (
    <main className="app">
      <header className="app-header">
        <Aperture size={22} strokeWidth={1.3} />
        <strong>Camera Shot Explorer</strong>
        <span>A study in perspective</span>
        <button
          className="help-toggle"
          aria-label="Interaction guide"
          aria-expanded={help}
          onClick={() => setHelp(!help)}
        >
          <CircleHelp size={16} />
        </button>
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
              <span className="muted">
                {mode === "position"
                  ? "H / V / D handles"
                  : "Yaw / Pitch / Roll rings"}
              </span>
            </div>
            <div className="navigation-hint">
              <Mouse size={13} />
              <span>Drag background to orbit</span>
              <span className="hint-divider" />
              <span>Scroll to zoom</span>
            </div>
          </div>
          {help && (
            <div className="help-panel">
              <strong>Explore your shot</strong>
              <p>
                Drag the background to orbit your view. Scroll to zoom the
                workspace.
              </p>
              <p>
                Select and drag the camera to{" "}
                {mode === "position" ? "move it" : "rotate it"}. Use the handles
                for a single axis, or the sliders for precision.
              </p>
              <p>
                <kbd>S</kbd> switches Position and Rotation. Use the reset menu
                to aim at the subject.
              </p>
              <button onClick={() => setHelp(false)}>Got it</button>
            </div>
          )}
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
