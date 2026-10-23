import { expect, test } from "vitest";
import { restoreSession, saveSession } from "./cameraPersistence";
import { DEFAULT_CAMERA_STATE, DEFAULT_OBSERVATION } from "./cameraTypes";
test.each([
  "{",
  '{"version":99}',
  '{"version":1,"filming":{"distance":"bad"}}',
])("invalid session safely restores defaults: %s", (raw) => {
  expect(restoreSession(raw).filming).toEqual(DEFAULT_CAMERA_STATE);
});
test("valid filming and observation state round trip", () => {
  const value = {
    filming: { ...DEFAULT_CAMERA_STATE, roll: 17 },
    observation: DEFAULT_OBSERVATION,
  };
  expect(restoreSession(saveSession(value))).toEqual(value);
});
