import { describe, expect, it } from "vitest";
import { computeCoverage, scenarioCovered } from "../engine/coverage";
import { Layers, Sensor } from "../models/types";

const layers: Layers = {
  camera: true,
  radar: true,
  ultrasonic: true,
  lidar: true,
  overlapHighlight: true
};

const makeSensor = (type: Sensor["type"], yaw: number, fov: number) => ({
  id: `${type}-1`,
  type,
  label: "S",
  pose: {
    position: { x: 0, y: 0, z: 1 },
    orientation: { yawDeg: yaw, pitchDeg: 0, rollDeg: 0 }
  },
  fov: { horizontalDeg: fov, verticalDeg: 60 },
  rangeM: 50,
  enabled: true
});

describe("coverage", () => {
  it("high coverage for 360 sensor", () => {
    const sensor = makeSensor("lidar", 0, 360);
    const result = computeCoverage([sensor], layers, 400);
    expect(result.covered / result.total).toBeGreaterThan(0.9);
  });

  it("lower coverage for narrow FOV", () => {
    const sensor = makeSensor("camera", 0, 30);
    const result = computeCoverage([sensor], layers, 400);
    expect(result.covered / result.total).toBeLessThan(0.7);
  });

  it("union coverage increases with additional sensor", () => {
    const sensorA = makeSensor("camera", 0, 60);
    const sensorB = makeSensor("camera", 90, 60);
    const single = computeCoverage([sensorA], layers, 400);
    const combined = computeCoverage([sensorA, sensorB], layers, 400);
    expect(combined.covered).toBeGreaterThan(single.covered);
  });

  it("scenario covered detects sensor volume", () => {
    const sensor = makeSensor("camera", 0, 90);
    const covered = scenarioCovered([sensor], layers, { x: 10, y: 0, z: 1 });
    expect(covered).toBe(true);
  });
});
