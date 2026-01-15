import { Sensor, VendorSelection } from "../models/types";
import { defaultCategoryByType, findSpec } from "../specs/sensorVendors";

export const applyVendorSpecs = (sensors: Sensor[], vendors: VendorSelection) => {
  return sensors.map((sensor) => {
    const category = sensor.specCategory || defaultCategoryByType[sensor.type];
    const vendorId = vendors[sensor.type];
    const spec = findSpec(sensor.type, vendorId, category);
    if (!spec) return sensor;
    return {
      ...sensor,
      specCategory: category,
      specPointRateKpps: spec.specs.pointRateKpps,
      fov: {
        horizontalDeg: spec.specs.horizontalFOVDeg,
        verticalDeg: spec.specs.verticalFOVDeg
      },
      rangeM: spec.specs.rangeM
    };
  });
};
