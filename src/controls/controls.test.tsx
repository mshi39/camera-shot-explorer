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
    activeHandle: null,
    dragging: false,
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

test("mode-aware reset and Look at Subject shortcuts preserve independent transforms", () => {
  render(<ModeSwitcher />);
  useCameraStore.getState().updateCamera({ distance: 5, roll: 20 });
  fireEvent.keyDown(window, { key: "r" });
  expect(useCameraStore.getState().filming.distance).toBe(5);
  fireEvent.keyDown(window, { key: "R", shiftKey: true });
  expect(useCameraStore.getState().filming.distance).toBe(
    DEFAULT_CAMERA_STATE.distance,
  );
  expect(useCameraStore.getState().filming.roll).toBe(20);
  fireEvent.keyDown(window, { key: "s" });
  fireEvent.keyDown(window, { key: "r" });
  expect(useCameraStore.getState().activeHandle).toBe("roll");
  expect(useCameraStore.getState().filming.roll).toBe(20);
  fireEvent.keyDown(window, { key: "R", shiftKey: true });
  expect(useCameraStore.getState().filming.roll).toBe(0);
  useCameraStore.getState().updateCamera({ yaw: 45 });
  fireEvent.keyDown(window, { key: "l" });
  expect(useCameraStore.getState().filming.yaw).toBeCloseTo(0);
  expect(useCameraStore.getState().filming.pitch).toBeCloseTo(0);
});

test("axis shortcuts toggle restrictions and mode switching clears them", () => {
  render(<ModeSwitcher />);
  for (const [key, axis] of [
    ["h", "horizontal"],
    ["v", "vertical"],
    ["d", "distance"],
  ]) {
    fireEvent.keyDown(window, { key });
    expect(useCameraStore.getState().activeHandle).toBe(axis);
  }
  fireEvent.keyDown(window, { key: "d" });
  expect(useCameraStore.getState().activeHandle).toBeNull();
  fireEvent.keyDown(window, { key: "h" });
  fireEvent.keyDown(window, { key: "s" });
  expect(useCameraStore.getState().activeHandle).toBeNull();
  for (const [key, axis] of [
    ["y", "yaw"],
    ["p", "pitch"],
    ["r", "roll"],
  ]) {
    fireEvent.keyDown(window, { key });
    expect(useCameraStore.getState().activeHandle).toBe(axis);
  }
  fireEvent.keyDown(window, { key: "Escape" });
  expect(useCameraStore.getState().activeHandle).toBeNull();
});

test("typing, modifiers and active drags cannot trigger camera shortcuts", () => {
  render(
    <>
      <ModeSwitcher />
      <input aria-label="typing" />
    </>,
  );
  useCameraStore.getState().updateCamera({ distance: 5 });
  fireEvent.keyDown(screen.getByRole("textbox"), { key: "r" });
  fireEvent.keyDown(window, { key: "r", ctrlKey: true });
  useCameraStore.getState().setDragging(true);
  fireEvent.keyDown(window, { key: "r" });
  expect(useCameraStore.getState().filming.distance).toBe(5);
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
