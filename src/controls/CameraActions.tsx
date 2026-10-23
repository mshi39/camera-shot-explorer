import { useEffect, useRef, useState } from "react";
import { ChevronDown, RotateCcw, Focus } from "lucide-react";
import { useCameraStore } from "../camera/cameraStore";
export function CameraActions() {
  const mode = useCameraStore((s) => s.mode),
    [open, setOpen] = useState(false),
    root = useRef<HTMLDivElement>(null),
    trigger = useRef<HTMLButtonElement>(null);
  const primary = mode === "position" ? "Position Reset" : "Rotation Reset";
  const options =
    mode === "position"
      ? ["Look at Subject", "Rotation Reset"]
      : ["Position Reset", "Look at Subject"];
  function run(action: string) {
    const s = useCameraStore.getState();
    if (action === "Position Reset") s.resetPosition();
    else if (action === "Rotation Reset") s.resetRotation();
    else s.lookAtSubject();
    setOpen(false);
  }
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  useEffect(() => setOpen(false), [mode]);
  return (
    <div
      ref={root}
      className="camera-actions"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setOpen(false);
          trigger.current?.focus();
        }
        if (open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
          e.preventDefault();
          const items = Array.from(
            root.current!.querySelectorAll<HTMLButtonElement>(
              '[role="menuitem"]',
            ),
          );
          const i = items.indexOf(document.activeElement as HTMLButtonElement);
          items[
            (i +
              (e.key === "ArrowDown" ? 1 : items.length - 1) +
              items.length) %
              items.length
          ]?.focus();
        }
      }}
    >
      <div className="split-button">
        <button
          aria-label={primary}
          title={
            mode === "position"
              ? "Restore position; keep rotation (Shift+R)"
              : "Restore rotation; keep position (Shift+R)"
          }
          onClick={() => run(primary)}
        >
          <RotateCcw size={13} />
          {primary}
          <kbd aria-hidden="true">Shift+R</kbd>
        </button>
        <button
          ref={trigger}
          aria-label="More camera actions"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <ChevronDown size={14} />
        </button>
      </div>
      {open && (
        <div className="action-menu" role="menu">
          {options.map((action) => (
            <button
              key={action}
              role="menuitem"
              onClick={() => {
                run(action);
                trigger.current?.focus();
              }}
            >
              {action === "Look at Subject" ? (
                <Focus size={14} />
              ) : (
                <RotateCcw size={14} />
              )}{" "}
              {action}
              {action === "Look at Subject" && <kbd aria-hidden="true">L</kbd>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
