import "@testing-library/jest-dom";

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
    globalAlpha: 1
  } as unknown as CanvasRenderingContext2D;
};
