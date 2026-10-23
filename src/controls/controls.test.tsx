import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, expect, test } from "vitest";
import { ModeSwitcher } from "./ModeSwitcher";
import { CameraActions } from "./CameraActions";
import { CameraControls } from "./CameraControls";
import { useCameraStore } from "../camera/cameraStore";
import { DEFAULT_CAMERA_STATE } from "../camera/cameraTypes";
beforeEach(() =>
  useCameraStore.setState({
    mode: "position",
    filming: { ...DEFAULT_CAMERA_STATE },
  }),
);
test("S toggles mode but typing and modifiers do not", () => {
  render(
    <>
      <ModeSwitcher />
      <input aria-label="typing" />
    </>,
  );
  fireEvent.keyDown(window, { key: "s" });
  expect(useCameraStore.getState().mode).toBe("rotation");
  fireEvent.keyDown(window, { key: "s", ctrlKey: true });
  expect(useCameraStore.getState().mode).toBe("rotation");
  const input = screen.getByRole("textbox");
  input.focus();
  fireEvent.keyDown(input, { key: "s" });
  expect(useCameraStore.getState().mode).toBe("rotation");
});
test("dropdown exposes alternate actions without resetting on open", () => {
  useCameraStore.getState().updateCamera({ horizontal: 45, roll: 20 });
  render(<CameraActions />);
  fireEvent.click(screen.getByRole("button", { name: "More camera actions" }));
  expect(useCameraStore.getState().filming.horizontal).toBe(45);
  fireEvent.click(screen.getByRole("menuitem", { name: "Rotation Reset" }));
  expect(useCameraStore.getState().filming.roll).toBe(0);
  expect(useCameraStore.getState().filming.horizontal).toBe(45);
});
test("a slider updates the camera without changing its orientation", () => {
  render(<CameraControls />);
  fireEvent.change(screen.getByRole("slider", { name: "Distance" }), {
    target: { value: "5" },
  });
  expect(useCameraStore.getState().filming.distance).toBe(5);
  expect(useCameraStore.getState().filming.pitch).toBe(-6);
});

test("number fields allow clearing before typing a replacement", () => {
  render(<CameraControls />);
  const input = screen.getByRole("spinbutton", {
    name: "Horizontal Orbit value",
  });
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: "" } });
  expect(input).toHaveValue(null);
  fireEvent.change(input, { target: { value: "-30" } });
  expect(useCameraStore.getState().filming.horizontal).toBe(-30);
  fireEvent.change(input, { target: { value: "" } });
  fireEvent.blur(input);
  expect(input).toHaveValue(-30);
});
