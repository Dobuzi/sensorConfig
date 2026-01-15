import { SENSOR_SPECS, SensorSpec, SensorVendorType } from "./sensorSpecs";

export const vendorOptions = (sensorType: SensorVendorType) => {
  const vendors = new Map<string, { vendorId: string; vendorName: string }>();
  SENSOR_SPECS.filter((spec) => spec.sensorType === sensorType).forEach((spec) => {
    vendors.set(spec.vendorId, { vendorId: spec.vendorId, vendorName: spec.vendorName });
  });
  return Array.from(vendors.values());
};

export const findSpec = (sensorType: SensorVendorType, vendorId: string, category: string): SensorSpec | null => {
  return (
    SENSOR_SPECS.find(
      (spec) =>
        spec.sensorType === sensorType &&
        spec.vendorId === vendorId &&
        spec.category.toLowerCase() === category.toLowerCase()
    ) ?? null
  );
};

export const defaultVendorByType: Record<SensorVendorType, string> = {
  camera: "onsemi",
  radar: "continental",
  ultrasonic: "bosch",
  lidar: "luminar"
};

export const defaultCategoryByType: Record<SensorVendorType, string> = {
  camera: "main",
  radar: "mrr",
  ultrasonic: "parking",
  lidar: "long"
};
