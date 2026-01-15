import { describe, expect, it } from "vitest";
import { applyVendorSpecs } from "../engine/vendorSpecs";
import { presetSensors, presetVendors } from "../engine/presets";
import { exportState, importState } from "../engine/serialization";
import { createInitialState } from "../engine/state";
import { findSpec } from "../specs/sensorVendors";
import { VEHICLES } from "../models/vehicles";

const baseSensor = {
  id: "cam-1",
  type: "camera" as const,
  label: "Cam",
  specCategory: "wide",
  pose: {
    position: { x: 0, y: 0, z: 1 },
    orientation: { yawDeg: 0, pitchDeg: 0, rollDeg: 0 }
  },
  fov: { horizontalDeg: 0, verticalDeg: 0 },
  rangeM: 0,
  enabled: true
};

describe("vendor specs", () => {
  it("updates sensor specs deterministically for vendor", () => {
    const vendorsA = { camera: "mobileye", radar: "continental", ultrasonic: "bosch", lidar: "luminar" };
    const vendorsB = { camera: "onsemi", radar: "continental", ultrasonic: "bosch", lidar: "luminar" };
    const updatedA = applyVendorSpecs([baseSensor], vendorsA)[0];
    const updatedB = applyVendorSpecs([baseSensor], vendorsB)[0];
    expect(updatedA.fov.horizontalDeg).not.toBe(updatedB.fov.horizontalDeg);
    expect(updatedA.rangeM).not.toBe(updatedB.rangeM);
  });

  it("presets declare default vendors", () => {
    const tesla = presetVendors("tesla-fsd");
    expect(tesla.camera).toBe("onsemi");
    const ncap = presetVendors("ncap");
    expect(ncap.radar).toBe("continental");
  });

  it("preset sensors use registry specs", () => {
    const vendors = presetVendors("tesla-fsd");
    const sensors = presetSensors("tesla-fsd", VEHICLES.sedan, vendors);
    const first = sensors.find((sensor) => sensor.type === "camera")!;
    const spec = findSpec("camera", vendors.camera, first.specCategory)!;
    expect(first.fov.horizontalDeg).toBe(spec.specs.horizontalFOVDeg);
    expect(first.rangeM).toBe(spec.specs.rangeM);
  });

  it("import/export preserves vendors", () => {
    const state = createInitialState();
    const exported = exportState({ ...state, vendors: { ...state.vendors, camera: "mobileye" } });
    const result = importState(JSON.stringify(exported));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.vendors.camera).toBe("mobileye");
    }
  });
});
