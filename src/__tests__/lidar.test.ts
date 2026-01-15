import { describe, expect, it } from "vitest";
import { generateLidarPoints } from "../engine/lidar";
import { Sensor } from "../models/types";

const sensor: Sensor = {
  id: "lidar-1",
  type: "lidar",
  label: "Lidar",
  pose: {
    position: { x: 0, y: 0, z: 1 },
    orientation: { yawDeg: 0, pitchDeg: 0, rollDeg: 0 }
  },
  fov: { horizontalDeg: 360, verticalDeg: 30 },
  rangeM: 100,
  enabled: true
};

describe("lidar point cloud", () => {
  it("is deterministic for same seed", () => {
    const a = generateLidarPoints(sensor, 1000);
    const b = generateLidarPoints(sensor, 1000);
    expect(a[10]).toBeCloseTo(b[10], 6);
  });

  it("range affects point radius", () => {
    const shorter = generateLidarPoints({ ...sensor, rangeM: 50 }, 1000);
    const longer = generateLidarPoints({ ...sensor, rangeM: 150 }, 1000);
    const maxShort = Math.max(...shorter);
    const maxLong = Math.max(...longer);
    expect(maxLong).toBeGreaterThan(maxShort);
  });
});
