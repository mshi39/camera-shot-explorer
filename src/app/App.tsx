import { Aperture, Mouse, Move, Rotate3D, CircleHelp, Languages } from "lucide-react";
import { useEffect, useState } from "react";
import { translate, useLanguage, useTranslation } from "../i18n";
import { ExportImage } from "../scene/ExportImage";
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
  const t = useTranslation();
  const { language, toggle } = useLanguage();
  const [previewCanvas, setPreviewCanvas] = useState<HTMLCanvasElement | null>(null);
  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    document.title = translate("Camera Shot Explorer", language);
  }, [language]);
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
        <strong>{t("Camera Shot Explorer")}</strong>
        <span>{t("A study in perspective")}</span>
        <div
          className="help-anchor"
          onKeyDown={(e) => {
            if (e.key === "Escape") setHelp(false);
          }}
        >
          <button className="help-toggle" aria-label={language === "en" ? "切换到中文" : "Switch to English"} title={language === "en" ? "切换到中文" : "Switch to English"} onClick={toggle}><Languages size={17} /></button>
          <button
            className="help-toggle"
            aria-label={t("Interaction guide")}
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
              aria-label={t("Interaction guide details")}
            >
              <strong>{t("Explore your shot")}</strong>
              <p>
                {t("Drag the background to orbit your view. Scroll to zoom the workspace.")}
              </p>
              <p>
                {t("Select and drag the camera. Use H / V / D in Position mode or Y / P / R in Rotation mode to restrict dragging to one axis. Press the same key again or Esc to release it.")}
              </p>
              <p>
                {t("S switches modes. Shift+R resets position or rotation in the active mode. L aims at the subject.")}
              </p>
              <button onClick={() => setHelp(false)}>{t("Got it")}</button>
            </div>
          )}
        </div>
      </header>
      <div className="studio">
        <section
          className="workspace"
          aria-label={t("Interactive 3D scene")}
          data-testid="workspace"
        >
          <WorkspaceScene />
          <div className="workspace-toolbar">
            <select
              title={t("Output framing")}
              aria-label={t("Aspect ratio")}
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
              <span>{t("Camera selected")}</span>
              <div
                className="axis-shortcuts"
                role="group"
                aria-label={t("Restrict camera drag")}
              >
                {axes.map(({ key, label }) => (
                  <button
                    key={key}
                    title={language === "zh" ? `限制为${t(key)}拖动（${label}）` : `Restrict drag to ${key} (${label})`}
                    aria-label={language === "zh" ? `选择${t(key)}控制柄` : `Select ${key} handle`}
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
                  ? language === "zh" ? `仅${t(activeHandle)} · Esc 取消` : `${activeHandle} only · Esc to release`
                  : t("Drag camera or handles")}
              </span>
            </div>
            <div className="navigation-hint">
              <Mouse size={13} />
              <span>{t("Drag background to orbit")}</span>
              <span className="hint-divider" />
              <span>{t("Scroll to zoom")}</span>
            </div>
          </div>
        </section>
        <aside className="inspector">
          <div className="preview-heading">
            <h1>{t("Camera Preview")}</h1>
            <div className="preview-actions">
            <span className="live-label">
              <i />
              {t("LIVE")}
            </span>
            <ExportImage canvas={previewCanvas} />
            </div>
          </div>
          <CameraPreview onCanvasReady={setPreviewCanvas} />
          <ShotInformation shot={shot} />
          <CameraControls />
          <PromptPanel />
        </aside>
      </div>
      <footer className="app-footer">
        <span>{t("Explore the frame.")}</span>
        <span>
          {t("50mm fixed lens")}<span className="footer-dot">·</span>{t("Changes saved on this device")}
        </span>
      </footer>
    </main>
  );
}
