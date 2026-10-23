import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import App from "./App";
test("opens a usable camera interface with a labeled preview and default controls", () => {
  render(<App />);
  expect(screen.getByText("Camera Preview")).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /Position mode/ }),
  ).toBeInTheDocument();
  expect(screen.getByRole("combobox", { name: "Aspect ratio" })).toHaveValue(
    "16:9",
  );
  expect(screen.queryByText("3D Workspace")).not.toBeInTheDocument();
});
