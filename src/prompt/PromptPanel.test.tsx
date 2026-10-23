import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { PromptPanel } from "./PromptPanel";
import { useCameraStore } from "../camera/cameraStore";
import { DEFAULT_CAMERA_STATE } from "../camera/cameraTypes";
import { generateShotPrompt } from "./promptGenerator";
import { classifyShot } from "../classification/classifier";
beforeEach(() =>
  useCameraStore.setState({
    filming: { ...DEFAULT_CAMERA_STATE },
    revision: 0,
  }),
);
test("refresh is explicit and copy returns the displayed older shot", async () => {
  let clipboard = "";
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: {
      writeText: async (text: string) => {
        clipboard = text;
      },
    },
  });
  render(<PromptPanel />);
  expect(
    screen.getByText("Click Refresh to generate a prompt."),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Refresh prompt" }));
  const text = screen.getByTestId("prompt-text").textContent!;
  expect(text).toContain("Medium shot");
  expect(text).toContain("50mm");
  expect(text).toContain("16:9");
  act(() => useCameraStore.getState().updateCamera({ aspect: "9:16" }));
  expect(screen.getByTestId("prompt-text")).toHaveTextContent(text);
  expect(screen.getByText("Out of date")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Copy prompt" }));
  await waitFor(() => expect(clipboard).toBe(text));
  fireEvent.click(screen.getByRole("button", { name: "Refresh prompt" }));
  expect(screen.getByTestId("prompt-text")).toHaveTextContent("9:16");
});
test("clipboard failure leaves text available for manual copy", async () => {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
  });
  render(<PromptPanel />);
  fireEvent.click(screen.getByRole("button", { name: "Refresh prompt" }));
  fireEvent.click(screen.getByRole("button", { name: "Copy prompt" }));
  await screen.findByText(/Select the prompt text/);
  expect(screen.getByTestId("prompt-text")).toHaveTextContent("50mm");
});
test("generated prompt uses known shot facts without embellishments", () => {
  const text = generateShotPrompt(
    classifyShot({ ...DEFAULT_CAMERA_STATE, roll: 10 }),
    { ...DEFAULT_CAMERA_STATE, roll: 10 },
  );
  expect(text).toContain("10° Dutch tilt");
  expect(text).not.toMatch(/dramatic|lighting|cinematic|mood/);
});
