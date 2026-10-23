import { Html, Line } from "@react-three/drei";
import { useCameraStore } from "../camera/cameraStore";
import { positionFromOrbit } from "../camera/cameraMath";
import { useCameraDrag } from "./useCameraDrag";
import {
  ORBIT_CENTER,
  type CameraParameter,
  type Vec3,
} from "../camera/cameraTypes";
import { Vector3 } from "three";
export function PositionHandles() {
  const s = useCameraStore((x) => x.filming);
  const active = useCameraStore((x) => x.activeHandle);
  const drag = useCameraDrag();
  const p = positionFromOrbit(s);
  const handles: {
    key: CameraParameter;
    label: string;
    position: Vec3;
    color: string;
  }[] = [
    { key: "horizontal", label: "H", position: [0.55, 0, 0], color: "#9bb9a2" },
    { key: "vertical", label: "V", position: [0, 0.55, 0], color: "#c29a9a" },
    {
      key: "distance",
      label: "D",
      position: p
        .clone()
        .sub(new Vector3(...ORBIT_CENTER))
        .normalize()
        .multiplyScalar(0.55)
        .toArray() as Vec3,
      color: "#829aac",
    },
  ];
  return (
    <group position={p}>
      {handles.map((h) => (
        <group key={h.key}>
          <Line
            points={[[0, 0, 0], h.position]}
            color={active === h.key ? "#ffffff" : h.color}
            lineWidth={1.7}
          />
          <mesh position={h.position} onPointerDown={(e) => drag(h.key, e)}>
            <sphereGeometry args={[0.065, 16, 12]} />
            <meshBasicMaterial
              color={active === h.key ? "#ffffff" : h.color}
              depthTest={false}
            />
          </mesh>
          <Html
            position={h.position}
            center
            style={{
              pointerEvents: "none",
              transform: "translate(15px,-15px)",
            }}
          >
            <span
              className={`handle-label ${active === h.key ? "active" : ""}`}
            >
              {h.label}
            </span>
          </Html>
        </group>
      ))}
    </group>
  );
}
