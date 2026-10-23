export type AspectRatio = "16:9" | "9:16";
export type ControlMode = "position" | "rotation";
export type Vec3 = [number, number, number];
export interface FilmingCameraState {
  horizontal: number;
  vertical: number;
  distance: number;
  yaw: number;
  pitch: number;
  roll: number;
  aspect: AspectRatio;
}
export type CameraTransform = Pick<
  FilmingCameraState,
  "horizontal" | "vertical" | "distance" | "yaw" | "pitch" | "roll"
>;
export interface ObservationCameraState {
  position: Vec3;
  target: Vec3;
}
export const ORBIT_CENTER: Vec3 = [0, 1, 0];
export const EYES: Vec3 = [0, 1.64, 0.08];
export const DEFAULT_CAMERA_STATE: FilmingCameraState = {
  horizontal: 0,
  vertical: (Math.atan2(0.64, 2.2) * 180) / Math.PI,
  distance: Math.hypot(0.64, 2.2),
  yaw: 0,
  pitch: -6,
  roll: 0,
  aspect: "16:9",
};
export const DEFAULT_OBSERVATION: ObservationCameraState = {
  position: [5.2, 3.6, 6.2],
  target: [0, 1.1, 0.6],
};
export const CAMERA_LIMITS = {
  horizontal: [-180, 180],
  vertical: [-80, 80],
  distance: [0.35, 20],
  yaw: [-180, 180],
  pitch: [-89, 89],
  roll: [-180, 180],
} as const;
export type CameraParameter = keyof typeof CAMERA_LIMITS;
