import { Component, type ReactNode } from "react";
export function WebGLFallback() {
  return (
    <div className="webgl-fallback" role="alert">
      <strong>3D view unavailable</strong>
      <p>
        Enable hardware acceleration in your browser, then reload this page.
      </p>
    </div>
  );
}
export class RenderBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <WebGLFallback /> : this.props.children;
  }
}
export function supportsWebGL() {
  return (
    typeof window !== "undefined" &&
    typeof window.WebGLRenderingContext !== "undefined"
  );
}
