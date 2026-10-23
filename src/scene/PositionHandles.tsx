import { Html, Line } from "@react-three/drei";
import { useCameraStore } from "../camera/cameraStore";
import { positionFromOrbit } from "../camera/cameraMath";
import { useCameraDrag } from "./useCameraDrag";
import type { CameraParameter, Vec3 } from "../camera/cameraTypes";
export function PositionHandles() {
  const s = useCameraStore((x) => x.filming);
  const drag = useCameraDrag();
  const p = positionFromOrbit(s);
  const handles: {
    key: CameraParameter;
    label: string;
    position: Vec3;
    color: string;
  }[] = [
    { key: "horizontal", label: "H", position: [0.55, 0, 0], color: "#bac7d0" },
    { key: "vertical", label: "V", position: [0, 0.55, 0], color: "#dde0e2" },
    { key: "distance", label: "D", position: [0, 0, 0.55], color: "#829aac" },
  ];
  return (
    <group position={p}>
      {handles.map((h) => (
        <group key={h.key}>
          <Line
            points={[[0, 0, 0], h.position]}
            color={h.color}
            lineWidth={1.7}
          />
          <mesh position={h.position} onPointerDown={(e) => drag(h.key, e)}>
            <sphereGeometry args={[0.065, 16, 12]} />
            <meshBasicMaterial color={h.color} depthTest={false} />
          </mesh>
          <Html
            position={h.position}
            center
            style={{
              pointerEvents: "none",
              transform: "translate(15px,-15px)",
            }}
          >
            <span className="handle-label">{h.label}</span>
          </Html>
        </group>
      ))}
    </group>
  );
}
