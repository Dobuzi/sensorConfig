import { Sensor, VehicleTemplate } from "../models/types";

export type PresetId = "tesla-fsd" | "ncap" | "robotaxi";

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const newSensor = (
  preset: PresetId,
  label: string,
  partial: Omit<Sensor, "id" | "label">
): Sensor => ({
  ...partial,
  label,
  id: `${preset}-${slugify(label)}`
});

export const presetSensors = (preset: PresetId, vehicle: VehicleTemplate): Sensor[] => {
  const { length, width } = vehicle.dimensions;
  const halfW = width / 2;
  const frontX = length / 2 - 0.2;
  const rearX = -length / 2 + 0.2;
  const midX = 0;

  const camera = (
    label: string,
    x: number,
    y: number,
    yawDeg: number,
    opts: { z?: number; fov?: number; vertical?: number; range?: number; mirrorGroup?: string } = {}
  ) =>
    newSensor(preset, label, {
      type: "camera",
      pose: {
        position: { x, y, z: opts.z ?? 1.3 },
        orientation: { yawDeg, pitchDeg: 0, rollDeg: 0 }
      },
      fov: { horizontalDeg: opts.fov ?? 120, verticalDeg: opts.vertical ?? 60 },
      rangeM: opts.range ?? 120,
      enabled: true,
      mirrorGroup: opts.mirrorGroup
    });

  const radar = (
    label: string,
    x: number,
    y: number,
    yawDeg: number,
    opts: { z?: number; range?: number; mirrorGroup?: string } = {}
  ) =>
    newSensor(preset, label, {
      type: "radar",
      pose: {
        position: { x, y, z: opts.z ?? 0.6 },
        orientation: { yawDeg, pitchDeg: 0, rollDeg: 0 }
      },
      fov: { horizontalDeg: 45, verticalDeg: null },
      rangeM: opts.range ?? 200,
      enabled: true,
      mirrorGroup: opts.mirrorGroup
    });

  const ultrasonic = (
    label: string,
    x: number,
    y: number,
    yawDeg: number,
    opts: { z?: number; mirrorGroup?: string } = {}
  ) =>
    newSensor(preset, label, {
      type: "ultrasonic",
      pose: {
        position: { x, y, z: opts.z ?? 0.4 },
        orientation: { yawDeg, pitchDeg: 0, rollDeg: 0 }
      },
      fov: { horizontalDeg: 90, verticalDeg: null },
      rangeM: 6,
      enabled: true,
      mirrorGroup: opts.mirrorGroup
    });

  const lidar = (label: string, x: number, y: number, yawDeg: number) =>
    newSensor(preset, label, {
      type: "lidar",
      pose: {
        position: { x, y, z: 1.8 },
        orientation: { yawDeg, pitchDeg: 0, rollDeg: 0 }
      },
      fov: { horizontalDeg: 360, verticalDeg: 30 },
      rangeM: 150,
      enabled: true
    });

  switch (preset) {
    case "tesla-fsd":
      return [
        camera("Front Wide", frontX, 0, 0, { fov: 130, vertical: 55, range: 120 }),
        camera("Front Narrow", frontX, 0, 0, { fov: 60, vertical: 35, range: 200 }),
        camera("Front Main", frontX, 0, 0, { fov: 90, vertical: 45, range: 150 }),
        camera("Front Side Left", frontX - 0.25, halfW - 0.08, 55, { mirrorGroup: "front-side" }),
        camera("Front Side Right", frontX - 0.25, -halfW + 0.08, -55, { mirrorGroup: "front-side" }),
        camera("B-Pillar Left", midX, halfW - 0.05, 100, { mirrorGroup: "pillar" }),
        camera("B-Pillar Right", midX, -halfW + 0.05, -100, { mirrorGroup: "pillar" }),
        camera("Rear", rearX, 0, 180, { fov: 120, vertical: 60, range: 120 })
      ];
    case "ncap":
      return [
        camera("Front Wide", frontX, 0, 0, { fov: 140, vertical: 60, range: 120 }),
        camera("Front Narrow", frontX, 0, 0, { fov: 60, vertical: 35, range: 180 }),
        camera("Front Side Left", frontX - 0.2, halfW - 0.05, 55, { mirrorGroup: "front-side" }),
        camera("Front Side Right", frontX - 0.2, -halfW + 0.05, -55, { mirrorGroup: "front-side" }),
        camera("Rear Wide", rearX, 0, 180, { fov: 140, vertical: 60, range: 120 }),
        camera("Rear Corner Left", rearX + 0.2, halfW - 0.05, 135, { mirrorGroup: "rear-corner" }),
        camera("Rear Corner Right", rearX + 0.2, -halfW + 0.05, -135, { mirrorGroup: "rear-corner" }),
        radar("Front Radar", frontX - 0.1, 0, 0),
        radar("Rear Radar", rearX + 0.1, 0, 180),
        radar("Corner Radar", midX, halfW - 0.1, 90, { mirrorGroup: "corner-radar" }),
        ultrasonic("Front Left", frontX - 0.2, halfW - 0.02, 15, { mirrorGroup: "us-front" }),
        ultrasonic("Front Right", frontX - 0.2, -halfW + 0.02, -15, { mirrorGroup: "us-front" }),
        ultrasonic("Front Mid Left", frontX - 0.4, halfW - 0.04, 15, { mirrorGroup: "us-front-mid" }),
        ultrasonic("Front Mid Right", frontX - 0.4, -halfW + 0.04, -15, { mirrorGroup: "us-front-mid" }),
        ultrasonic("Front Center Left", frontX - 0.05, halfW - 0.01, 0, { mirrorGroup: "us-front-center" }),
        ultrasonic("Front Center Right", frontX - 0.05, -halfW + 0.01, 0, { mirrorGroup: "us-front-center" }),
        ultrasonic("Rear Left", rearX + 0.2, halfW - 0.02, 165, { mirrorGroup: "us-rear" }),
        ultrasonic("Rear Right", rearX + 0.2, -halfW + 0.02, -165, { mirrorGroup: "us-rear" }),
        ultrasonic("Rear Mid Left", rearX + 0.4, halfW - 0.04, 165, { mirrorGroup: "us-rear-mid" }),
        ultrasonic("Rear Mid Right", rearX + 0.4, -halfW + 0.04, -165, { mirrorGroup: "us-rear-mid" }),
        ultrasonic("Rear Center Left", rearX + 0.05, halfW - 0.01, 180, { mirrorGroup: "us-rear-center" }),
        ultrasonic("Rear Center Right", rearX + 0.05, -halfW + 0.01, 180, { mirrorGroup: "us-rear-center" })
      ];
    case "robotaxi":
      return [
        camera("Front Wide", frontX, 0, 0, { fov: 140, vertical: 60, range: 150 }),
        camera("Front Narrow", frontX, 0, 0, { fov: 60, vertical: 35, range: 200 }),
        camera("Front Side Left", frontX - 0.2, halfW - 0.05, 60, { mirrorGroup: "front-side" }),
        camera("Front Side Right", frontX - 0.2, -halfW + 0.05, -60, { mirrorGroup: "front-side" }),
        camera("Rear Wide", rearX, 0, 180, { fov: 140, vertical: 60, range: 150 }),
        camera("Rear Corner Left", rearX + 0.2, halfW - 0.05, 135, { mirrorGroup: "rear-corner" }),
        camera("Rear Corner Right", rearX + 0.2, -halfW + 0.05, -135, { mirrorGroup: "rear-corner" }),
        radar("Front Radar", frontX - 0.1, 0, 0),
        radar("Rear Radar", rearX + 0.1, 0, 180),
        radar("Corner Radar", midX, halfW - 0.1, 90, { mirrorGroup: "corner-radar" }),
        ultrasonic("Front Left", frontX - 0.2, halfW - 0.02, 15, { mirrorGroup: "us-front" }),
        ultrasonic("Front Right", frontX - 0.2, -halfW + 0.02, -15, { mirrorGroup: "us-front" }),
        ultrasonic("Front Mid Left", frontX - 0.4, halfW - 0.04, 15, { mirrorGroup: "us-front-mid" }),
        ultrasonic("Front Mid Right", frontX - 0.4, -halfW + 0.04, -15, { mirrorGroup: "us-front-mid" }),
        ultrasonic("Front Center Left", frontX - 0.05, halfW - 0.01, 0, { mirrorGroup: "us-front-center" }),
        ultrasonic("Front Center Right", frontX - 0.05, -halfW + 0.01, 0, { mirrorGroup: "us-front-center" }),
        ultrasonic("Rear Left", rearX + 0.2, halfW - 0.02, 165, { mirrorGroup: "us-rear" }),
        ultrasonic("Rear Right", rearX + 0.2, -halfW + 0.02, -165, { mirrorGroup: "us-rear" }),
        ultrasonic("Rear Mid Left", rearX + 0.4, halfW - 0.04, 165, { mirrorGroup: "us-rear-mid" }),
        ultrasonic("Rear Mid Right", rearX + 0.4, -halfW + 0.04, -165, { mirrorGroup: "us-rear-mid" }),
        ultrasonic("Rear Center Left", rearX + 0.05, halfW - 0.01, 180, { mirrorGroup: "us-rear-center" }),
        ultrasonic("Rear Center Right", rearX + 0.05, -halfW + 0.01, 180, { mirrorGroup: "us-rear-center" }),
        lidar("Roof Lidar", midX, 0, 0)
      ];
    default:
      return [];
  }
};
