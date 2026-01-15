import { describe, expect, it } from "vitest";
import { SENSOR_SPECS } from "../specs/sensorSpecs";

const cameraSpecs = (vendorId: string) =>
  SENSOR_SPECS.filter((spec) => spec.sensorType === "camera" && spec.vendorId === vendorId);

describe("sensor spec sanity rules", () => {
  it("ensures wide camera range is shorter than narrow camera range", () => {
    ["mobileye", "onsemi"].forEach((vendor) => {
      const specs = cameraSpecs(vendor);
      const wide = specs.find((spec) => spec.category === "wide");
      const narrow = specs.find((spec) => spec.category === "narrow");
      expect(wide).toBeTruthy();
      expect(narrow).toBeTruthy();
      expect((wide?.specs.rangeM ?? 0)).toBeLessThan(narrow?.specs.rangeM ?? 0);
    });
  });

  it("keeps ultrasonic ranges far below camera ranges", () => {
    const maxUltrasonic = Math.max(
      ...SENSOR_SPECS.filter((spec) => spec.sensorType === "ultrasonic").map((spec) => spec.specs.rangeM)
    );
    const minCamera = Math.min(
      ...SENSOR_SPECS.filter((spec) => spec.sensorType === "camera").map((spec) => spec.specs.rangeM)
    );
    expect(maxUltrasonic).toBeLessThan(minCamera);
  });

  it("radar and lidar ranges align with registry values", () => {
    const radar = SENSOR_SPECS.filter((spec) => spec.sensorType === "radar");
    const lidar = SENSOR_SPECS.filter((spec) => spec.sensorType === "lidar");
    radar.forEach((spec) => expect(spec.specs.rangeM).toBeGreaterThan(0));
    lidar.forEach((spec) => expect(spec.specs.rangeM).toBeGreaterThan(0));
  });
});
