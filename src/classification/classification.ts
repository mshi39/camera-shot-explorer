export type ShotSize =
  | "Long Shot"
  | "Full Shot"
  | "Medium Full Shot"
  | "Cowboy Shot"
  | "Medium Shot"
  | "Medium Close-Up"
  | "Close-Up"
  | "Extreme Close-Up"
  | "Unclassified";
export interface ShotClassification {
  size: ShotSize;
  angle: string;
  viewpoint: string;
  composition: string;
  dutch: boolean;
}
export interface Framing {
  fullBody: boolean;
  occupancy: number;
  cropHeight: number;
  visible: number;
  headVisible: boolean;
  faceVisible: boolean;
  centerX?: number;
  behind?: boolean;
  clippedFullHeight?: boolean;
}
