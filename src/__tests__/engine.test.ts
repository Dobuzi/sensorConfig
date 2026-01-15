import { describe, expect, it } from "vitest";
import { VEHICLES } from "../models/vehicles";
import { presetSensors } from "../engine/presets";
import { applyBoundaryClamp, applyMinSpacing, applyMirrorPlacement } from "../engine/constraints";
import { detectOverlaps } from "../engine/overlap";
import { exportState, importState } from "../engine/serialization";
import { createInitialState } from "../engine/state";
import { pointInPolygon } from "../utils/geometry";

const sedan = VEHICLES.sedan;

describe("recommendation presets", () => {
  it("creates deterministic placements for each preset", () => {
    const fsd = presetSensors("fsd-camera", sedan);
    expect(fsd.map((sensor) => sensor.id)).toEqual([
      "fsd-camera-front-wide",
      "fsd-camera-front-narrow",
      "fsd-camera-front-side-left",
      "fsd-camera-front-side-right",
      "fsd-camera-rear",
      "fsd-camera-rear-left",
      "fsd-camera-rear-right"
    ]);

    const adas = presetSensors("adas-ncap", sedan);
    expect(adas.find((sensor) => sensor.label === "Front")?.pose.position.x).toBeCloseTo(2.15, 2);
    expect(adas.find((sensor) => sensor.label === "Front Radar")?.type).toBe("radar");

    const robotaxi = presetSensors("robotaxi", sedan);
    expect(robotaxi.find((sensor) => sensor.type === "lidar")?.label).toBe("Roof");

    const hw4 = presetSensors("tesla-hw4", sedan);
    expect(hw4.map((sensor) => sensor.label)).toContain("B-Pillar Left");
  });
});

describe("constraint solver", () => {
  it("clamps sensors outside polygon to the nearest boundary", () => {
    const square = [
      { x: -1, y: -1 },
      { x: 1, y: -1 },
      { x: 1, y: 1 },
      { x: -1, y: 1 }
    ];
    const sensor = {
      id: "outside",
      type: "camera" as const,
      label: "Outside",
      pose: {
        position: { x: 10, y: 10, z: 1 },
        orientation: { yawDeg: 0, pitchDeg: 0, rollDeg: 0 }
      },
      fov: { horizontalDeg: 90, verticalDeg: 45 },
      rangeM: 50,
      enabled: true
    };
    const clamped = applyBoundaryClamp(sensor, square);
    expect(clamped.pose.position.x).toBeCloseTo(1, 2);
    expect(clamped.pose.position.y).toBeCloseTo(1, 2);
  });

  it("separates sensors closer than min spacing", () => {
    const a = {
      id: "a",
      type: "radar" as const,
      label: "A",
      pose: {
        position: { x: 0, y: 0, z: 0.6 },
        orientation: { yawDeg: 0, pitchDeg: 0, rollDeg: 0 }
      },
      fov: { horizontalDeg: 40, verticalDeg: null },
      rangeM: 100,
      enabled: true
    };
    const b = { ...a, id: "b", label: "B", pose: { ...a.pose, position: { x: 0.05, y: 0.05, z: 0.6 } } };
    const separated = applyMinSpacing([a, b], sedan.footprintPolygon, 0.2);
    const dx = separated[0].pose.position.x - separated[1].pose.position.x;
    const dy = separated[0].pose.position.y - separated[1].pose.position.y;
    expect(Math.hypot(dx, dy)).toBeGreaterThanOrEqual(0.19);
    expect(pointInPolygon({ x: separated[0].pose.position.x, y: separated[0].pose.position.y }, sedan.footprintPolygon)).toBe(true);
  });

  it("creates and updates mirrored sensors", () => {
    const sensor = {
      id: "left",
      type: "camera" as const,
      label: "Left",
      pose: {
        position: { x: 0, y: 0.5, z: 1.3 },
        orientation: { yawDeg: 30, pitchDeg: 0, rollDeg: 0 }
      },
      fov: { horizontalDeg: 120, verticalDeg: 60 },
      rangeM: 120,
      enabled: true,
      mirrorGroup: "side"
    };
    const mirrored = applyMirrorPlacement([sensor], true);
    expect(mirrored).toHaveLength(2);
    const right = mirrored.find((item) => item.id === "left-mirror")!;
    expect(right.pose.position.y).toBeCloseTo(-0.5, 3);
    expect(right.pose.orientation.yawDeg).toBe(-30);
  });

  it("updates mirrored sensor when source changes", () => {
    const sensor = {
      id: "left",
      type: "camera" as const,
      label: "Left",
      pose: {
        position: { x: 0.2, y: 0.4, z: 1.3 },
        orientation: { yawDeg: 10, pitchDeg: 0, rollDeg: 0 }
      },
      fov: { horizontalDeg: 120, verticalDeg: 60 },
      rangeM: 120,
      enabled: true,
      mirrorGroup: "side"
    };
    const mirrored = applyMirrorPlacement([sensor, { ...sensor, id: "left-mirror", pose: { ...sensor.pose, position: { x: 0.2, y: -0.2, z: 1.3 } } }], true);
    const right = mirrored.find((item) => item.id === "left-mirror")!;
    expect(right.pose.position.y).toBeCloseTo(-0.4, 3);
    expect(right.pose.orientation.yawDeg).toBe(-10);
  });
});

describe("overlap detection", () => {
  it("flags overlap for known wedge intersection", () => {
    const sensors = [
      {
        id: "a",
        type: "camera" as const,
        label: "A",
        pose: {
          position: { x: 0, y: 0, z: 1 },
          orientation: { yawDeg: 0, pitchDeg: 0, rollDeg: 0 }
        },
        fov: { horizontalDeg: 90, verticalDeg: 60 },
        rangeM: 50,
        enabled: true
      },
      {
        id: "b",
        type: "camera" as const,
        label: "B",
        pose: {
          position: { x: 0.1, y: 0, z: 1 },
          orientation: { yawDeg: 5, pitchDeg: 0, rollDeg: 0 }
        },
        fov: { horizontalDeg: 90, verticalDeg: 60 },
        rangeM: 50,
        enabled: true
      }
    ];
    const overlaps = detectOverlaps(sensors);
    expect(overlaps.length).toBe(1);
  });

  it("handles extreme FOV and range values", () => {
    const sensors = [
      {
        id: "wide",
        type: "camera" as const,
        label: "Wide",
        pose: {
          position: { x: 0, y: 0, z: 1 },
          orientation: { yawDeg: 0, pitchDeg: 0, rollDeg: 0 }
        },
        fov: { horizontalDeg: 179, verticalDeg: 60 },
        rangeM: 300,
        enabled: true
      },
      {
        id: "wide-2",
        type: "camera" as const,
        label: "Wide 2",
        pose: {
          position: { x: 0.2, y: 0, z: 1 },
          orientation: { yawDeg: 5, pitchDeg: 0, rollDeg: 0 }
        },
        fov: { horizontalDeg: 170, verticalDeg: 60 },
        rangeM: 300,
        enabled: true
      }
    ];
    const overlaps = detectOverlaps(sensors);
    expect(overlaps.length).toBe(1);
  });
});

describe("import/export", () => {
  it("round-trips identical state", () => {
    const state = createInitialState();
    const sensors = presetSensors("robotaxi", sedan);
    const withSensors = { ...state, sensors };
    const exported = exportState(withSensors);
    const result = importState(JSON.stringify(exported));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.sensors).toEqual(exported.sensors);
      expect(result.data.vehicle.type).toBe(exported.vehicle.type);
    }
  });

  it("rejects invalid JSON", () => {
    const result = importState("{ bad json }");
    expect(result.ok).toBe(false);
  });
});
