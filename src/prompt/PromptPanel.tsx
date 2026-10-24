import { useEffect, useRef, useState } from "react";
import { Copy, RefreshCw, Check } from "lucide-react";
import { useCameraStore } from "../camera/cameraStore";
import { useClassification } from "../classification/useClassification";
import { generateShotPrompt } from "./promptGenerator";
export function PromptPanel() {
  const [snapshot, setSnapshot] = useState<{
      text: string;
      revision: number;
    } | null>(null),
    [status, setStatus] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  const revision = useCameraStore((s) => s.revision),
    shot = useClassification();
  function refresh() {
    const s = useCameraStore.getState();
    setSnapshot({
      text: generateShotPrompt(shot, s.filming),
      revision: s.revision,
    });
    setStatus("");
  }
  async function copy() {
    if (!snapshot) return;
    clearTimeout(toastTimer.current);
    try {
      await navigator.clipboard.writeText(snapshot.text);
      setStatus("Copied");
      toastTimer.current = setTimeout(() => setStatus(""), 2000);
    } catch {
      setStatus("Select the prompt text and copy it manually.");
    }
  }
  return (
    <section className="prompt-panel" aria-label="AI shot prompt">
      <div className="section-heading">
        <h2>AI shot prompt</h2>
        <div className="prompt-actions">
          {snapshot && snapshot.revision !== revision && (
            <span className="stale">Out of date</span>
          )}
          <button
            aria-label="Refresh prompt"
            onClick={refresh}
            title="Generate from the current shot"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
          <div className="copy-action">
          <button
            aria-label="Copy prompt"
            title="Copy the displayed prompt"
            disabled={!snapshot}
            onClick={copy}
          >
            {status === "Copied" ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <span className="copy-toast" role="status">
            {status === "Copied" ? status : ""}
          </span>
          </div>
        </div>
      </div>
      <p
        data-testid="prompt-text"
        className={snapshot ? "prompt-text" : "prompt-empty"}
      >
        {snapshot?.text ?? "Click Refresh to generate a prompt."}
      </p>
      <span className="copy-status" role="status">
        {status !== "Copied" ? status : ""}
      </span>
    </section>
  );
}
