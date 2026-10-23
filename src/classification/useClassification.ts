import { useMemo, useRef } from "react";
import { useCameraStore } from "../camera/cameraStore";
import { classifyShot } from "./classifier";
import type { ShotClassification } from "./classification";
export function useClassification() {
  const state = useCameraStore((s) => s.filming),
    previous = useRef<ShotClassification | undefined>(undefined);
  return useMemo(() => {
    const result = classifyShot(state, previous.current);
    previous.current = result;
    return result;
  }, [state]);
}
