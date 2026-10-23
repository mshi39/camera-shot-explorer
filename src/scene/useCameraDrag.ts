import { useEffect, useRef } from "react";
import { useThree, type ThreeEvent } from "@react-three/fiber";
import { useCameraStore } from "../camera/cameraStore";
import {
  dragCamera,
  distanceDragDelta,
  type DragKind,
} from "./pointerOwnership";
import { Vector2 } from "three";
export function useCameraDrag() {
  const observer = useThree((s) => s.camera);
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
    const rect = canvas.getBoundingClientRect();
    const pointerNdc = (x: number, y: number) =>
      new Vector2(
        ((x - rect.left) / rect.width) * 2 - 1,
        1 - ((y - rect.top) / rect.height) * 2,
      );
    const from = pointerNdc(x, y);
    canvas.setPointerCapture?.(pointer);
    const move = (e: PointerEvent) => {
      if (e.pointerId === pointer)
        useCameraStore
          .getState()
          .updateCamera(
            kind === "distance"
              ? {
                  distance:
                    start.distance +
                    distanceDragDelta(
                      start,
                      observer,
                      from,
                      pointerNdc(e.clientX, e.clientY),
                    ),
                }
              : dragCamera(kind, start, e.clientX - x, e.clientY - y),
          );
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
