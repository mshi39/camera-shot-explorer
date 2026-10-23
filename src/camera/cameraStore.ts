import { create } from "zustand";
import {
  CAMERA_LIMITS,
  DEFAULT_CAMERA_STATE,
  type FilmingCameraState,
  type ObservationCameraState,
  type ControlMode,
} from "./cameraTypes";
import { lookAtEyesPreservingRoll } from "./cameraMath";
import { restoreSession, saveSession, SESSION_KEY } from "./cameraPersistence";
function initial() {
  try {
    return restoreSession(window.localStorage.getItem(SESSION_KEY));
  } catch {
    return restoreSession(null);
  }
}
interface CameraStore {
  filming: FilmingCameraState;
  observation: ObservationCameraState;
  mode: ControlMode;
  selected: boolean;
  dragging: boolean;
  revision: number;
  updateCamera: (patch: Partial<FilmingCameraState>) => void;
  resetPosition: () => void;
  resetRotation: () => void;
  lookAtSubject: () => void;
  setMode: (mode: ControlMode) => void;
  setSelected: (selected: boolean) => void;
  setDragging: (dragging: boolean) => void;
  setObservation: (observation: ObservationCameraState) => void;
}
export const useCameraStore = create<CameraStore>((set, get) => ({
  ...initial(),
  mode: "position",
  selected: true,
  dragging: false,
  revision: 0,
  updateCamera: (patch) =>
    set((state) => {
      const filming = { ...state.filming };
      for (const key of Object.keys(
        CAMERA_LIMITS,
      ) as (keyof typeof CAMERA_LIMITS)[]) {
        const n = patch[key];
        if (n === undefined || !Number.isFinite(n)) continue;
        const [min, max] = CAMERA_LIMITS[key];
        filming[key] = Math.max(min, Math.min(max, n));
      }
      if (patch.aspect === "16:9" || patch.aspect === "9:16")
        filming.aspect = patch.aspect;
      if (
        Object.keys(filming).every(
          (k) =>
            filming[k as keyof FilmingCameraState] ===
            state.filming[k as keyof FilmingCameraState],
        )
      )
        return state;
      return { filming, revision: state.revision + 1 };
    }),
  resetPosition: () => {
    const { horizontal, vertical, distance } = DEFAULT_CAMERA_STATE;
    get().updateCamera({ horizontal, vertical, distance });
  },
  resetRotation: () => {
    const { yaw, pitch, roll } = DEFAULT_CAMERA_STATE;
    get().updateCamera({ yaw, pitch, roll });
  },
  lookAtSubject: () =>
    get().updateCamera(lookAtEyesPreservingRoll(get().filming)),
  setMode: (mode) => set({ mode }),
  setSelected: (selected) => set({ selected }),
  setDragging: (dragging) => set({ dragging }),
  setObservation: (observation) => set({ observation }),
}));
let timer: ReturnType<typeof setTimeout>;
useCameraStore.subscribe((s, previous) => {
  if (s.filming === previous.filming && s.observation === previous.observation)
    return;
  clearTimeout(timer);
  timer = setTimeout(() => {
    try {
      window.localStorage.setItem(SESSION_KEY, saveSession(s));
    } catch {
      /* Storage-disabled sessions remain fully usable. */
    }
  }, 250);
});
