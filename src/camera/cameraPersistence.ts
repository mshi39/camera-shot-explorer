import {
  CAMERA_LIMITS,
  DEFAULT_CAMERA_STATE,
  DEFAULT_OBSERVATION,
  type FilmingCameraState,
  type ObservationCameraState,
} from "./cameraTypes";
export const SESSION_KEY = "camera-shot-explorer.session.v1";
type Session = {
  filming: FilmingCameraState;
  observation: ObservationCameraState;
};
const defaults = (): Session => ({
  filming: { ...DEFAULT_CAMERA_STATE },
  observation: {
    position: [...DEFAULT_OBSERVATION.position],
    target: [...DEFAULT_OBSERVATION.target],
  },
});
export function restoreSession(raw: string | null): Session {
  try {
    if (!raw) return defaults();
    const x = JSON.parse(raw);
    if (x.version !== 1 || !x.filming || !x.observation) return defaults();
    for (const [key, [min, max]] of Object.entries(CAMERA_LIMITS)) {
      if (
        !Number.isFinite(x.filming[key]) ||
        x.filming[key] < min ||
        x.filming[key] > max
      )
        return defaults();
    }
    if (!["16:9", "9:16"].includes(x.filming.aspect)) return defaults();
    for (const key of ["position", "target"]) {
      const a = x.observation[key];
      if (
        !Array.isArray(a) ||
        a.length !== 3 ||
        !a.every(
          (n: unknown) =>
            typeof n === "number" && Number.isFinite(n) && Math.abs(n) < 1000,
        )
      )
        return defaults();
    }
    if (
      Math.hypot(
        ...x.observation.position.map(
          (n: number, i: number) => n - x.observation.target[i],
        ),
      ) < 0.1
    )
      return defaults();
    return { filming: x.filming, observation: x.observation };
  } catch {
    return defaults();
  }
}
export function saveSession(s: Session): string {
  return JSON.stringify({
    version: 1,
    filming: s.filming,
    observation: s.observation,
  });
}
