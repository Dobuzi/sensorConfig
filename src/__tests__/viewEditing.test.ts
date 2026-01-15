import { describe, expect, it } from "vitest";
import { applySideViewDrag, applyTopViewDrag } from "../engine/viewEditing";

const baseSensor = {
  id: "s1",
  type: "camera" as const,
  label: "S1",
  pose: {
    position: { x: 1, y: 2, z: 0.5 },
    orientation: { yawDeg: 0, pitchDeg: 0, rollDeg: 0 }
  },
  fov: { horizontalDeg: 90, verticalDeg: 60 },
  rangeM: 50,
  enabled: true
};

describe("view editing", () => {
  it("applies top view drag to x/y", () => {
    const updated = applyTopViewDrag(baseSensor, { x: 3, y: -1 });
    expect(updated.pose.position.x).toBe(3);
    expect(updated.pose.position.y).toBe(-1);
    expect(updated.pose.position.z).toBe(0.5);
  });

  it("applies side view drag to x/z", () => {
    const updated = applySideViewDrag(baseSensor, { x: 4, z: 1.2 });
    expect(updated.pose.position.x).toBe(4);
    expect(updated.pose.position.z).toBe(1.2);
    expect(updated.pose.position.y).toBe(2);
  });
});
