import { Sensor, VendorSelection, VehicleTemplate } from "../models/types";
import { defaultCategoryByType, defaultVendorByType, findSpec } from "../specs/sensorVendors";

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

export const presetVendors = (preset: PresetId): VendorSelection => {
  switch (preset) {
    case "tesla-fsd":
      return { camera: "onsemi", radar: "continental", ultrasonic: "bosch", lidar: "luminar" };
    case "ncap":
      return { camera: "mobileye", radar: "continental", ultrasonic: "bosch", lidar: "luminar" };
    case "robotaxi":
      return { camera: "mobileye", radar: "bosch", ultrasonic: "bosch", lidar: "luminar" };
    default:
      return { camera: "onsemi", radar: "continental", ultrasonic: "bosch", lidar: "luminar" };
  }
};

const specFor = (vendors: VendorSelection, type: Sensor["type"], category: string) => {
  return (
    findSpec(type, vendors[type], category) ??
    findSpec(type, defaultVendorByType[type], defaultCategoryByType[type])
  );
};

export const presetSensors = (
  preset: PresetId,
  vehicle: VehicleTemplate,
  vendors: VendorSelection = presetVendors(preset)
): Sensor[] => {
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
    opts: { z?: number; category: "narrow" | "main" | "wide"; mirrorGroup?: string } = { category: "main" }
  ) => {
    const spec = specFor(vendors, "camera", opts.category);
    if (!spec) throw new Error(`Missing camera spec for ${vendors.camera}:${opts.category}`);
    return newSensor(preset, label, {
      type: "camera",
      specCategory: opts.category,
      pose: {
        position: { x, y, z: opts.z ?? 1.3 },
        orientation: { yawDeg, pitchDeg: 0, rollDeg: 0 }
      },
      fov: {
        horizontalDeg: spec.specs.horizontalFOVDeg,
        verticalDeg: spec.specs.verticalFOVDeg
      },
      rangeM: spec.specs.rangeM,
      enabled: true,
      mirrorGroup: opts.mirrorGroup
    });
  };

  const radar = (
    label: string,
    x: number,
    y: number,
    yawDeg: number,
    opts: { z?: number; category: "srr" | "mrr" | "lrr"; mirrorGroup?: string } = { category: "mrr" }
  ) => {
    const spec = specFor(vendors, "radar", opts.category);
    if (!spec) throw new Error(`Missing radar spec for ${vendors.radar}:${opts.category}`);
    return newSensor(preset, label, {
      type: "radar",
      specCategory: opts.category,
      pose: {
        position: { x, y, z: opts.z ?? 0.6 },
        orientation: { yawDeg, pitchDeg: 0, rollDeg: 0 }
      },
      fov: {
        horizontalDeg: spec.specs.horizontalFOVDeg,
        verticalDeg: spec.specs.verticalFOVDeg
      },
      rangeM: spec.specs.rangeM,
      enabled: true,
      mirrorGroup: opts.mirrorGroup
    });
  };

  const ultrasonic = (
    label: string,
    x: number,
    y: number,
    yawDeg: number,
    opts: { z?: number; mirrorGroup?: string } = {}
  ) => {
    const spec = specFor(vendors, "ultrasonic", "parking");
    if (!spec) throw new Error(`Missing ultrasonic spec for ${vendors.ultrasonic}`);
    return newSensor(preset, label, {
      type: "ultrasonic",
      specCategory: "parking",
      pose: {
        position: { x, y, z: opts.z ?? 0.4 },
        orientation: { yawDeg, pitchDeg: 0, rollDeg: 0 }
      },
      fov: {
        horizontalDeg: spec.specs.horizontalFOVDeg,
        verticalDeg: spec.specs.verticalFOVDeg
      },
      rangeM: spec.specs.rangeM,
      enabled: true,
      mirrorGroup: opts.mirrorGroup
    });
  };

  const lidar = (label: string, x: number, y: number, yawDeg: number) =>
    (() => {
      const category = preset === "robotaxi" ? "long" : "mid";
      const spec = specFor(vendors, "lidar", category);
      if (!spec) throw new Error(`Missing lidar spec for ${vendors.lidar}:${category}`);
      return newSensor(preset, label, {
      type: "lidar",
      specCategory: category,
      pose: {
        position: { x, y, z: 1.8 },
        orientation: { yawDeg, pitchDeg: 0, rollDeg: 0 }
      },
      fov: {
        horizontalDeg: spec.specs.horizontalFOVDeg,
        verticalDeg: spec.specs.verticalFOVDeg
      },
      rangeM: spec.specs.rangeM,
      enabled: true
    });
    })();

  switch (preset) {
    case "tesla-fsd":
      return [
        camera("Front Wide", frontX, 0, 0, { category: "wide" }),
        camera("Front Narrow", frontX, 0, 0, { category: "narrow" }),
        camera("Front Main", frontX, 0, 0, { category: "main" }),
        camera("Front Side Left", frontX - 0.25, halfW - 0.08, 55, { category: "wide", mirrorGroup: "front-side" }),
        camera("Front Side Right", frontX - 0.25, -halfW + 0.08, -55, { category: "wide", mirrorGroup: "front-side" }),
        camera("B-Pillar Left", midX, halfW - 0.05, 100, { category: "wide", mirrorGroup: "pillar" }),
        camera("B-Pillar Right", midX, -halfW + 0.05, -100, { category: "wide", mirrorGroup: "pillar" }),
        camera("Rear", rearX, 0, 180, { category: "wide" })
      ];
    case "ncap":
      return [
        camera("Front Wide", frontX, 0, 0, { category: "wide" }),
        camera("Front Narrow", frontX, 0, 0, { category: "narrow" }),
        camera("Front Side Left", frontX - 0.2, halfW - 0.05, 55, { category: "wide", mirrorGroup: "front-side" }),
        camera("Front Side Right", frontX - 0.2, -halfW + 0.05, -55, { category: "wide", mirrorGroup: "front-side" }),
        camera("Rear Wide", rearX, 0, 180, { category: "wide" }),
        camera("Rear Corner Left", rearX + 0.2, halfW - 0.05, 135, { category: "wide", mirrorGroup: "rear-corner" }),
        camera("Rear Corner Right", rearX + 0.2, -halfW + 0.05, -135, { category: "wide", mirrorGroup: "rear-corner" }),
        radar("Front Radar", frontX - 0.1, 0, 0, { category: "mrr" }),
        radar("Rear Radar", rearX + 0.1, 0, 180, { category: "mrr" }),
        radar("Corner Radar", midX, halfW - 0.1, 90, { category: "srr", mirrorGroup: "corner-radar" }),
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
        camera("Front Wide", frontX, 0, 0, { category: "wide" }),
        camera("Front Narrow", frontX, 0, 0, { category: "narrow" }),
        camera("Front Side Left", frontX - 0.2, halfW - 0.05, 60, { category: "wide", mirrorGroup: "front-side" }),
        camera("Front Side Right", frontX - 0.2, -halfW + 0.05, -60, { category: "wide", mirrorGroup: "front-side" }),
        camera("Rear Wide", rearX, 0, 180, { category: "wide" }),
        camera("Rear Corner Left", rearX + 0.2, halfW - 0.05, 135, { category: "wide", mirrorGroup: "rear-corner" }),
        camera("Rear Corner Right", rearX + 0.2, -halfW + 0.05, -135, { category: "wide", mirrorGroup: "rear-corner" }),
        radar("Front Radar", frontX - 0.1, 0, 0, { category: "mrr" }),
        radar("Rear Radar", rearX + 0.1, 0, 180, { category: "mrr" }),
        radar("Corner Radar", midX, halfW - 0.1, 90, { category: "srr", mirrorGroup: "corner-radar" }),
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
