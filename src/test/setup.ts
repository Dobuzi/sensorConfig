import "@testing-library/jest-dom";
import { vi } from "vitest";

HTMLCanvasElement.prototype.getContext = () => {
  return {
    clearRect: () => {},
    save: () => {},
    restore: () => {},
    translate: () => {},
    scale: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    fill: () => {},
    stroke: () => {},
    arc: () => {},
    fillText: () => {},
    font: "",
    globalAlpha: 1,
    canvas: document.createElement("canvas")
  } as unknown as CanvasRenderingContext2D;
};

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

globalThis.requestAnimationFrame = (callback: FrameRequestCallback) => {
  return window.setTimeout(() => callback(performance.now()), 16);
};

globalThis.cancelAnimationFrame = (handle: number) => {
  clearTimeout(handle);
};

vi.mock("@react-three/fiber", async () => {
  const React = await import("react");
  return {
    Canvas: () => React.createElement("div", { "data-mocked": "canvas" })
  };
});

vi.mock("@react-three/drei", () => ({
  OrbitControls: () => null
}));
