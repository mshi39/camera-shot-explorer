import { useEffect, useRef } from "react";
import { useThree, type ThreeEvent } from "@react-three/fiber";
import { useCameraStore } from "../camera/cameraStore";
import { dragCamera, type DragKind } from "./pointerOwnership";
export function useCameraDrag() {
  const controls = useThree((s) => s.controls) as unknown as {
    enabled: boolean;
  } | null;
  const cleanup = useRef<(() => void) | null>(null);
  useEffect(() => () => cleanup.current?.(), []);
  return (kind: DragKind, event: ThreeEvent<PointerEvent>) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    cleanup.current?.();
    const store = useCameraStore.getState();
    store.setSelected(true);
    store.setDragging(true);
    if (controls) controls.enabled = false;
    const start = { ...store.filming },
      x = event.clientX,
      y = event.clientY,
      pointer = event.pointerId;
    const canvas = event.nativeEvent.target as HTMLCanvasElement;
    canvas.setPointerCapture?.(pointer);
    const move = (e: PointerEvent) => {
      if (e.pointerId === pointer)
        useCameraStore
          .getState()
          .updateCamera(dragCamera(kind, start, e.clientX - x, e.clientY - y));
    };
    const finish = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
      window.removeEventListener("blur", finish);
      if (canvas.hasPointerCapture?.(pointer))
        canvas.releasePointerCapture(pointer);
      useCameraStore.getState().setDragging(false);
      if (controls) controls.enabled = true;
      cleanup.current = null;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
    window.addEventListener("blur", finish);
    cleanup.current = finish;
  };
}
