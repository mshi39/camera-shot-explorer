import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera as FiberCamera } from "@react-three/drei";
import { useLayoutEffect, useRef } from "react";
import { PerspectiveCamera } from "three";
import { useCameraStore } from "../camera/cameraStore";
import { applyFilmingCamera } from "../camera/cameraMath";
import { Mannequin, SceneLighting, Ground } from "./Mannequin";
import {
  RenderBoundary,
  supportsWebGL,
  WebGLFallback,
} from "../ui/WebGLFallback";
function Lens() {
  const ref = useRef<PerspectiveCamera>(null);
  const s = useCameraStore((x) => x.filming);
  useLayoutEffect(() => {
    if (ref.current) applyFilmingCamera(ref.current, s);
  }, [s]);
  return <FiberCamera ref={ref} makeDefault manual />;
}
export function CameraPreview() {
  const aspect = useCameraStore((x) => x.filming.aspect);
  return (
    <div className="preview-mat">
      <div
        data-testid="preview-frame"
        className={`preview-frame ${aspect === "9:16" ? "portrait" : ""}`}
      >
        <RenderBoundary>
          {supportsWebGL() ? (
            <Canvas
              shadows
              dpr={[1, 1.5]}
              gl={{ antialias: true, preserveDrawingBuffer: true }}
            >
              <color attach="background" args={["#24262a"]} />
              <Lens />
              <SceneLighting />
              <Mannequin />
              <Ground />
            </Canvas>
          ) : (
            <WebGLFallback />
          )}
        </RenderBoundary>
        <div className="frame-corners" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
        <span className="preview-ratio">{aspect}</span>
      </div>
    </div>
  );
}
