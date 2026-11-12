import { Download } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "../i18n";

export function ExportImage({ canvas }: { canvas: HTMLCanvasElement | null }) {
  const t = useTranslation();
  const [error, setError] = useState(false);
  function download() {
    if (!canvas || !canvas.width || !canvas.height) return;
    setError(false);
    try {
      canvas.toBlob((blob) => {
        if (!blob) { setError(true); return; }
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `camera-shot-${canvas.width}x${canvas.height}.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }, "image/png");
    } catch { setError(true); }
  }
  return <div className="export-action">
    <button className="export-button" onClick={download} disabled={!canvas}>
      <Download size={13} />{t("Export Image")}
    </button>
    {error && <span className="export-error" role="alert">{t("Export failed. Please try again.")}</span>}
  </div>;
}
