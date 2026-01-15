import { AppState, ExportState, SCHEMA_VERSION, Sensor, VehicleTemplate } from "../models/types";

const isNumber = (value: unknown) => typeof value === "number" && Number.isFinite(value);

const validateSensor = (sensor: any): sensor is Sensor => {
  return sensor &&
    typeof sensor.id === "string" &&
    ["camera", "radar", "ultrasonic", "lidar"].includes(sensor.type) &&
    typeof sensor.label === "string" &&
    sensor.pose &&
    sensor.pose.position &&
    isNumber(sensor.pose.position.x) &&
    isNumber(sensor.pose.position.y) &&
    isNumber(sensor.pose.position.z) &&
    sensor.pose.orientation &&
    isNumber(sensor.pose.orientation.yawDeg) &&
    isNumber(sensor.pose.orientation.pitchDeg) &&
    isNumber(sensor.pose.orientation.rollDeg) &&
    sensor.fov &&
    isNumber(sensor.fov.horizontalDeg) &&
    (sensor.fov.verticalDeg === null || isNumber(sensor.fov.verticalDeg)) &&
    isNumber(sensor.rangeM) &&
    typeof sensor.enabled === "boolean";
};

const validateVehicle = (vehicle: any): vehicle is VehicleTemplate => {
  return vehicle &&
    ["sedan", "hatchback", "suv"].includes(vehicle.type) &&
    vehicle.dimensions &&
    isNumber(vehicle.dimensions.length) &&
    isNumber(vehicle.dimensions.width) &&
    isNumber(vehicle.dimensions.wheelbase) &&
    Array.isArray(vehicle.footprintPolygon) &&
    vehicle.footprintPolygon.length >= 3 &&
    vehicle.footprintPolygon.every((p: any) => isNumber(p.x) && isNumber(p.y));
};

const validateConstraints = (constraints: any) => {
  return constraints &&
    typeof constraints.boundaryClamp === "boolean" &&
    isNumber(constraints.minSpacingM) &&
    typeof constraints.mirrorPlacement === "boolean";
};

const validateLayers = (layers: any) => {
  return layers &&
    typeof layers.camera === "boolean" &&
    typeof layers.radar === "boolean" &&
    typeof layers.ultrasonic === "boolean" &&
    typeof layers.lidar === "boolean" &&
    typeof layers.overlapHighlight === "boolean";
};

const validateSettings = (settings: any) => {
  return settings &&
    typeof settings.enableViewEditing === "boolean" &&
    typeof settings.performanceMode === "boolean" &&
    isNumber(settings.lidarPointCount) &&
    isNumber(settings.coverageSampleCount) &&
    typeof settings.showCoverageHeatmap === "boolean";
};

const validateScenarios = (scenarios: any) => {
  return scenarios &&
    scenarios.pedestrian &&
    typeof scenarios.pedestrian.enabled === "boolean" &&
    isNumber(scenarios.pedestrian.crossingDistanceM) &&
    isNumber(scenarios.pedestrian.speedMps) &&
    scenarios.intersection &&
    typeof scenarios.intersection.enabled === "boolean" &&
    isNumber(scenarios.intersection.centerDistanceM) &&
    isNumber(scenarios.intersection.speedMps);
};

export const exportState = (state: AppState): ExportState => ({
  schemaVersion: state.schemaVersion,
  meta: state.meta,
  vehicle: state.vehicle,
  constraints: state.constraints,
  layers: state.layers,
  settings: state.settings,
  scenarios: state.scenarios,
  sensors: state.sensors
});

export const importState = (raw: string) => {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.schemaVersion !== SCHEMA_VERSION) {
      return { ok: false, error: "Unsupported or missing schemaVersion." } as const;
    }
    if (!validateVehicle(parsed.vehicle)) {
      return { ok: false, error: "Invalid vehicle data." } as const;
    }
    if (!validateConstraints(parsed.constraints)) {
      return { ok: false, error: "Invalid constraints data." } as const;
    }
    if (!validateLayers(parsed.layers)) {
      return { ok: false, error: "Invalid layers data." } as const;
    }
    if (!validateSettings(parsed.settings)) {
      return { ok: false, error: "Invalid settings data." } as const;
    }
    if (!validateScenarios(parsed.scenarios)) {
      return { ok: false, error: "Invalid scenarios data." } as const;
    }
    if (!Array.isArray(parsed.sensors) || !parsed.sensors.every(validateSensor)) {
      return { ok: false, error: "Invalid sensor data." } as const;
    }
    return { ok: true, data: parsed as ExportState } as const;
  } catch (error) {
    return { ok: false, error: "Invalid JSON format." } as const;
  }
};
