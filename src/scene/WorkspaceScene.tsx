import { Canvas } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import { useRef } from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useCameraStore } from "../camera/cameraStore";
import { Mannequin, Ground, SceneLighting } from "./Mannequin";
import { FilmingCameraModel } from "./FilmingCameraModel";
import {
  RenderBoundary,
  supportsWebGL,
  WebGLFallback,
} from "../ui/WebGLFallback";
import type { Vec3 } from "../camera/cameraTypes";
import { PositionHandles } from "./PositionHandles";
import { RotationHandles } from "./RotationHandles";
import { useCameraDrag } from "./useCameraDrag";
function ObservationControls() {
  const ref = useRef<OrbitControlsImpl>(null);
  const initial = useRef(useCameraStore.getState().observation);
  const dragging = useCameraStore((x) => x.dragging);
  return (
    <OrbitControls
      ref={ref}
      makeDefault
      enabled={!dragging}
      target={initial.current.target}
      enablePan={false}
      enableDamping={false}
      minDistance={1}
      maxDistance={40}
      maxPolarAngle={Math.PI * 0.92}
      onEnd={() => {
        const c = ref.current;
        if (c)
          useCameraStore.getState().setObservation({
            position: c.object.position.toArray() as Vec3,
            target: c.target.toArray() as Vec3,
          });
      }}
    />
  );
}
function Guides() {
  const s = useCameraStore((state) => state.filming);
  const elevation = (s.vertical * Math.PI) / 180;
  const radius = s.distance * Math.cos(elevation);
  const height = 1 + s.distance * Math.sin(elevation);
  const points = Array.from({ length: 97 }, (_, i): Vec3 => {
    const t = (i / 96) * Math.PI * 2;
    return [Math.sin(t) * radius, height, Math.cos(t) * radius];
  });
  return (
    <>
      <Line
        points={points}
        color="#626b76"
        lineWidth={1}
        transparent
        opacity={0.45}
        dashed
        dashSize={0.06}
        gapSize={0.055}
      />
      <Line
        points={[
          [0, 0, 0],
          [0, 2.25, 0],
        ]}
        color="#68717a"
        transparent
        opacity={0.3}
        dashed
        dashSize={0.04}
        gapSize={0.07}
      />
    </>
  );
}
function InteractiveCamera() {
  const mode = useCameraStore((s) => s.mode),
    activeHandle = useCameraStore((s) => s.activeHandle),
    selected = useCameraStore((s) => s.selected);
  const drag = useCameraDrag();
  return (
    <>
      <FilmingCameraModel onDrag={(e) => drag(activeHandle ?? mode, e)} />
      {selected &&
        (mode === "position" ? <PositionHandles /> : <RotationHandles />)}
    </>
  );
}
export function WorkspaceScene() {
  const initial = useRef(useCameraStore.getState().observation);
  return (
    <RenderBoundary>
      {supportsWebGL() ? (
        <Canvas
          className="workspace-canvas"
          shadows
          dpr={[1, 1.5]}
          camera={{
            position: initial.current.position,
            fov: 42,
            near: 0.05,
            far: 150,
          }}
          gl={{ antialias: true, preserveDrawingBuffer: true }}
        >
          <color attach="background" args={["#1c1e22"]} />
          <fog attach="fog" args={["#1c1e22", 14, 38]} />
          <SceneLighting />
          <Ground grid />
          <Mannequin />
          <Guides />
          <ObservationControls />
          <InteractiveCamera />
        </Canvas>
      ) : (
        <WebGLFallback />
      )}
    </RenderBoundary>
  );
}
