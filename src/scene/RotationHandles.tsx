import { Html } from "@react-three/drei";
import { useCameraStore } from "../camera/cameraStore";
import { cameraEuler, positionFromOrbit } from "../camera/cameraMath";
import { useCameraDrag } from "./useCameraDrag";
import type { Vec3 } from "../camera/cameraTypes";
export function RotationHandles() {
  const s = useCameraStore((x) => x.filming);
  const drag = useCameraDrag();
  const rings: {
    key: "yaw" | "pitch" | "roll";
    rotation: Vec3;
    color: string;
    radius: number;
    label: Vec3;
  }[] = [
    {
      key: "yaw",
      rotation: [Math.PI / 2, 0, 0],
      color: "#b6c4cf",
      radius: 0.46,
      label: [0.5, 0, 0],
    },
    {
      key: "pitch",
      rotation: [0, Math.PI / 2, 0],
      color: "#e0e2e4",
      radius: 0.5,
      label: [0, 0.54, 0],
    },
    {
      key: "roll",
      rotation: [0, 0, 0],
      color: "#829aac",
      radius: 0.55,
      label: [-0.389, 0.389, 0],
    },
  ];
  return (
    <group position={positionFromOrbit(s)} rotation={cameraEuler(s)}>
      {rings.map((r) => (
        <group key={r.key}>
          <mesh rotation={r.rotation} onPointerDown={(e) => drag(r.key, e)}>
            <torusGeometry args={[r.radius, 0.009, 8, 96]} />
            <meshBasicMaterial
              color={r.color}
              transparent
              opacity={0.85}
              depthTest={false}
            />
          </mesh>
          <mesh rotation={r.rotation} onPointerDown={(e) => drag(r.key, e)}>
            <torusGeometry args={[r.radius, 0.035, 6, 64]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
          <mesh position={r.label} onPointerDown={(e) => drag(r.key, e)}>
            <sphereGeometry args={[0.055, 16, 12]} />
            <meshBasicMaterial color={r.color} depthTest={false} />
          </mesh>
          <Html
            position={[r.label[0], r.label[1] + 0.1, r.label[2]]}
            center
            style={{ pointerEvents: "none" }}
          >
            <span className="handle-label">{r.key}</span>
          </Html>
        </group>
      ))}
    </group>
  );
}
