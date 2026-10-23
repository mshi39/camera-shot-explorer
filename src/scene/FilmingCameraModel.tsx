import { useCameraStore } from "../camera/cameraStore";
import { cameraEuler, positionFromOrbit } from "../camera/cameraMath";
import type { ThreeEvent } from "@react-three/fiber";
export function FilmingCameraModel({
  onDrag,
}: {
  onDrag?: (event: ThreeEvent<PointerEvent>) => void;
}) {
  const s = useCameraStore((x) => x.filming),
    selected = useCameraStore((x) => x.selected);
  const color = selected ? "#b9cbd8" : "#676c74";
  return (
    <group
      name="Filming camera"
      position={positionFromOrbit(s)}
      rotation={cameraEuler(s)}
      onPointerDown={(e) => {
        e.stopPropagation();
        useCameraStore.getState().setSelected(true);
        onDrag?.(e);
      }}
    >
      <mesh castShadow>
        <boxGeometry args={[0.24, 0.17, 0.26]} />
        <meshStandardMaterial color={color} roughness={0.45} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0, -0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.075, 0.085, 0.15, 24]} />
        <meshStandardMaterial color="#32373d" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, -0.279]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.058, 0.058, 0.008, 24]} />
        <meshStandardMaterial
          color="#a4bdce"
          metalness={0.8}
          roughness={0.18}
        />
      </mesh>
      <mesh position={[0, 0.12, 0.01]}>
        <boxGeometry args={[0.15, 0.045, 0.13]} />
        <meshStandardMaterial color="#6b747e" />
      </mesh>
      <mesh position={[0.138, 0, 0.02]}>
        <boxGeometry args={[0.025, 0.12, 0.13]} />
        <meshStandardMaterial color="#444a51" />
      </mesh>
    </group>
  );
}
