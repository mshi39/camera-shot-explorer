import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { WebGLFallback } from "./WebGLFallback";
test("unsupported rendering explains recovery", () => {
  render(<WebGLFallback />);
  expect(screen.getByRole("alert")).toHaveTextContent("hardware acceleration");
});
