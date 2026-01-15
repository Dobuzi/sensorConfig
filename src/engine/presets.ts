import { Sensor, VehicleTemplate } from "../models/types";
export type PresetId = "fsd-camera" | "adas-ncap" | "robotaxi" | "tesla-hw4";

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const newSensor = (preset: PresetId, label: string, partial: Omit<Sensor, "id" | "label">): Sensor => ({
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

  const camera = (label: string, x: number, y: number, yawDeg: number) =>
    newSensor(preset, label, {
      type: "camera",
      pose: {
        position: { x, y, z: 1.3 },
        orientation: { yawDeg, pitchDeg: 0, rollDeg: 0 }
      },
      fov: { horizontalDeg: 120, verticalDeg: 60 },
      rangeM: 120,
      enabled: true
    });

  const radar = (label: string, x: number, y: number, yawDeg: number) =>
    newSensor(preset, label, {
      type: "radar",
      pose: {
        position: { x, y, z: 0.6 },
        orientation: { yawDeg, pitchDeg: 0, rollDeg: 0 }
      },
      fov: { horizontalDeg: 40, verticalDeg: null },
      rangeM: 200,
      enabled: true
    });

  const ultrasonic = (label: string, x: number, y: number, yawDeg: number) =>
    newSensor(preset, label, {
      type: "ultrasonic",
      pose: {
        position: { x, y, z: 0.4 },
        orientation: { yawDeg, pitchDeg: 0, rollDeg: 0 }
      },
      fov: { horizontalDeg: 80, verticalDeg: null },
      rangeM: 5,
      enabled: true
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
    case "fsd-camera":
      return [
        camera("Front Wide", frontX, 0, 0),
        camera("Front Narrow", frontX, 0, 0),
        camera("Front Side Left", frontX - 0.2, halfW - 0.1, 55),
        camera("Front Side Right", frontX - 0.2, -halfW + 0.1, -55),
        camera("Rear", rearX, 0, 180),
        camera("Rear Left", rearX + 0.2, halfW - 0.1, 135),
        camera("Rear Right", rearX + 0.2, -halfW + 0.1, -135)
      ];
    case "adas-ncap":
      return [
        camera("Front", frontX, 0, 0),
        radar("Front Radar", frontX - 0.1, 0, 0),
        camera("Rear", rearX, 0, 180),
        ultrasonic("Front Left", frontX - 0.2, halfW - 0.05, 15),
        ultrasonic("Front Right", frontX - 0.2, -halfW + 0.05, -15),
        ultrasonic("Rear Left", rearX + 0.2, halfW - 0.05, 165),
        ultrasonic("Rear Right", rearX + 0.2, -halfW + 0.05, -165)
      ];
    case "robotaxi":
      return [
        lidar("Roof", midX, 0, 0),
        camera("Front", frontX, 0, 0),
        camera("Left", midX, halfW - 0.1, 90),
        camera("Right", midX, -halfW + 0.1, -90),
        radar("Front Radar", frontX - 0.1, 0, 0),
        radar("Rear Radar", rearX + 0.1, 0, 180)
      ];
    case "tesla-hw4":
      return [
        camera("Front Wide", frontX, 0, 0),
        camera("Front Side Left", frontX - 0.2, halfW - 0.1, 55),
        camera("Front Side Right", frontX - 0.2, -halfW + 0.1, -55),
        camera("B-Pillar Left", midX, halfW - 0.05, 100),
        camera("B-Pillar Right", midX, -halfW + 0.05, -100),
        camera("Rear", rearX, 0, 180)
      ];
    default:
      return [];
  }
};
