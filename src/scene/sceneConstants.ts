import type { Vec3 } from "../camera/cameraTypes";
// Meters; +Y is up, the subject faces +Z.
export const SUBJECT_LANDMARKS = {
  head: [0, 1.8, 0],
  eyes: [0, 1.64, 0.08],
  chin: [0, 1.52, 0.07],
  shoulders: [0, 1.44, 0],
  chest: [0, 1.28, 0],
  waist: [0, 0.96, 0],
  hips: [0, 0.89, 0],
  thigh: [0, 0.73, 0],
  knees: [0, 0.49, 0],
  shins: [0, 0.35, 0],
  ankles: [0, 0.1, 0],
  feet: [0, 0.025, 0.05],
} satisfies Record<string, Vec3>;
