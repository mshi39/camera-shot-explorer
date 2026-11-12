import { useEffect, useRef, useState } from "react";
import { Copy, RefreshCw, Check } from "lucide-react";
import { useCameraStore } from "../camera/cameraStore";
import { useClassification } from "../classification/useClassification";
import { generateShotPrompt } from "./promptGenerator";
import { useLanguage, useTranslation } from "../i18n";
import type { ShotClassification } from "../classification/classification";
import type { FilmingCameraState } from "../camera/cameraTypes";
export function PromptPanel() {
  const t = useTranslation();
  const language = useLanguage((s) => s.language);
  const [snapshot, setSnapshot] = useState<{
      shot: ShotClassification;
      filming: FilmingCameraState;
      revision: number;
    } | null>(null),
    [status, setStatus] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  const revision = useCameraStore((s) => s.revision),
    shot = useClassification();
  const text = snapshot ? generateShotPrompt(snapshot.shot, snapshot.filming, language) : null;
  function refresh() {
    const s = useCameraStore.getState();
    setSnapshot({
      shot: { ...shot },
      filming: { ...s.filming },
      revision: s.revision,
    });
    setStatus("");
  }
  async function copy() {
    if (!snapshot) return;
    clearTimeout(toastTimer.current);
    try {
      await navigator.clipboard.writeText(text!);
      setStatus("Copied");
      toastTimer.current = setTimeout(() => setStatus(""), 2000);
    } catch {
      setStatus("Select the prompt text and copy it manually.");
    }
  }
  return (
    <section className="prompt-panel" aria-label={t("AI shot prompt")}>
      <div className="section-heading">
        <h2>{t("AI shot prompt")}</h2>
        <div className="prompt-actions">
          {snapshot && snapshot.revision !== revision && (
            <span className="stale">{t("Out of date")}</span>
          )}
          <button
            aria-label={t("Refresh prompt")}
            onClick={refresh}
            title={t("Generate from the current shot")}
          >
            <RefreshCw size={13} />
            <span>{t("Refresh")}</span>
          </button>
          <div className="copy-action">
          <button
            aria-label={t("Copy prompt")}
            title={t("Copy the displayed prompt")}
            disabled={!snapshot}
            onClick={copy}
          >
            {status === "Copied" ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <span className="copy-toast" role="status">
            {status === "Copied" ? t(status) : ""}
          </span>
          </div>
        </div>
      </div>
      <p
        data-testid="prompt-text"
        className={snapshot ? "prompt-text" : "prompt-empty"}
      >
        {text ?? t("Click Refresh to generate a prompt.")}
      </p>
      <span className="copy-status" role="status">
        {status !== "Copied" ? t(status) : ""}
      </span>
    </section>
  );
}
