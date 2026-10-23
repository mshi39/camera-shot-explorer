import { Quaternion, Vector3 } from "three";
import type { Vec3 } from "../camera/cameraTypes";
function Ellipsoid({
  at,
  scale,
  color = "#a4a5a7",
}: {
  at: Vec3;
  scale: Vec3;
  color?: string;
}) {
  return (
    <mesh position={at} scale={scale} castShadow receiveShadow>
      <sphereGeometry args={[1, 32, 24]} />
      <meshStandardMaterial color={color} roughness={0.72} />
    </mesh>
  );
}
function Limb({ from, to, radius }: { from: Vec3; to: Vec3; radius: number }) {
  const a = new Vector3(...from),
    b = new Vector3(...to),
    direction = b.clone().sub(a);
  const q = new Quaternion().setFromUnitVectors(
    new Vector3(0, 1, 0),
    direction.clone().normalize(),
  );
  return (
    <mesh
      position={a.add(b).multiplyScalar(0.5)}
      quaternion={q}
      castShadow
      receiveShadow
    >
      <capsuleGeometry
        args={[radius, Math.max(0.01, direction.length() - radius * 2), 8, 20]}
      />
      <meshStandardMaterial color="#929497" roughness={0.8} />
    </mesh>
  );
}
export function Mannequin() {
  return (
    <group name="Subject">
      <Ellipsoid
        at={[0, 1.65, 0]}
        scale={[0.104, 0.15, 0.108]}
        color="#b6b6b7"
      />
      <Ellipsoid
        at={[0, 1.625, 0.107]}
        scale={[0.025, 0.038, 0.028]}
        color="#aaa9aa"
      />
      {[-1, 1].map((side) => (
        <group key={side}>
          <Ellipsoid
            at={[side * 0.041, 1.66, 0.097]}
            scale={[0.018, 0.012, 0.008]}
            color="#55575a"
          />
          <Ellipsoid
            at={[side * 0.103, 1.64, 0]}
            scale={[0.019, 0.039, 0.022]}
          />
          <Ellipsoid
            at={[side * 0.204, 1.405, 0]}
            scale={[0.085, 0.085, 0.085]}
            color="#85888b"
          />
          <Limb
            from={[side * 0.22, 1.39, 0]}
            to={[side * 0.28, 1.12, 0.015]}
            radius={0.058}
          />
          <Ellipsoid
            at={[side * 0.28, 1.12, 0.015]}
            scale={[0.048, 0.048, 0.048]}
            color="#65686c"
          />
          <Limb
            from={[side * 0.28, 1.12, 0.015]}
            to={[side * 0.3, 0.87, 0.04]}
            radius={0.043}
          />
          <Ellipsoid
            at={[side * 0.3, 0.81, 0.04]}
            scale={[0.038, 0.079, 0.027]}
          />
          <Limb
            from={[side * 0.098, 0.86, 0]}
            to={[side * 0.105, 0.49, 0.015]}
            radius={0.082}
          />
          <Ellipsoid
            at={[side * 0.105, 0.49, 0.015]}
            scale={[0.063, 0.063, 0.065]}
            color="#65686c"
          />
          <Limb
            from={[side * 0.105, 0.49, 0.015]}
            to={[side * 0.115, 0.1, 0]}
            radius={0.058}
          />
          <Ellipsoid
            at={[side * 0.115, 0.06, 0.055]}
            scale={[0.06, 0.06, 0.135]}
            color="#85888b"
          />
        </group>
      ))}
      <Limb from={[0, 1.43, 0]} to={[0, 1.55, 0]} radius={0.045} />
      <Ellipsoid at={[0, 1.25, 0]} scale={[0.199, 0.239, 0.105]} />
      <Ellipsoid
        at={[0, 1.02, 0]}
        scale={[0.139, 0.15, 0.095]}
        color="#85888b"
      />
      <Ellipsoid
        at={[0, 0.89, 0]}
        scale={[0.16, 0.13, 0.112]}
        color="#9b9da0"
      />
    </group>
  );
}
export function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.75} />
      <hemisphereLight args={["#e1e5ea", "#444549", 1.1]} />
      <directionalLight
        position={[3, 5, 4]}
        intensity={2.3}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-normalBias={0.025}
      />
      <directionalLight
        position={[-3, 2, -3]}
        intensity={1.5}
        color="#b8c1ca"
      />
    </>
  );
}
export function Ground({ grid = false }: { grid?: boolean }) {
  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.012, 0]}
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#25272a" roughness={1} />
      </mesh>
      {grid && (
        <gridHelper
          args={[40, 80, "#45484e", "#32353b"]}
          position={[0, 0, 0]}
        />
      )}
    </>
  );
}
