import {
  AppState,
  Constraints,
  ExportState,
  Layers,
  SCHEMA_VERSION,
  ScenarioState,
  Sensor,
  UiSettings,
  VendorSelection,
  VehicleTemplate
} from "../models/types";
import { VEHICLES } from "../models/vehicles";
import { enforceConstraints } from "./constraints";
import { presetSensors, presetVendors, PresetId } from "./presets";
import { applyVendorSpecs } from "./vendorSpecs";
import { defaultVendorByType } from "../specs/sensorVendors";

export type Action =
  | { type: "setVehicle"; vehicle: VehicleTemplate }
  | { type: "applyPreset"; preset: PresetId }
  | { type: "updateSensor"; sensor: Sensor }
  | { type: "selectSensor"; id: string | null }
  | { type: "setConstraints"; constraints: Constraints }
  | { type: "setLayers"; layers: Layers }
  | { type: "setSettings"; settings: UiSettings }
  | { type: "setScenarios"; scenarios: ScenarioState }
  | { type: "setVendors"; vendors: VendorSelection }
  | { type: "importState"; state: ExportState }
  | { type: "setError"; error: string | null };

const baseConstraints: Constraints = {
  boundaryClamp: true,
  minSpacingM: 0.15,
  mirrorPlacement: false
};

const baseLayers: Layers = {
  camera: true,
  radar: true,
  ultrasonic: true,
  lidar: true,
  overlapHighlight: true
};

const baseSettings: UiSettings = {
  enableViewEditing: false,
  performanceMode: false,
  lidarPointCount: 5000,
  coverageSampleCount: 2000,
  showCoverageHeatmap: false
};

const baseScenarios: ScenarioState = {
  pedestrian: { enabled: false, crossingDistanceM: 20, speedMps: 1.4 },
  intersection: { enabled: false, centerDistanceM: 25, speedMps: 10 }
};

const baseVendors: VendorSelection = {
  camera: defaultVendorByType.camera,
  radar: defaultVendorByType.radar,
  ultrasonic: defaultVendorByType.ultrasonic,
  lidar: defaultVendorByType.lidar
};

export const createInitialState = (): AppState => ({
  schemaVersion: SCHEMA_VERSION,
  meta: { presetId: "", createdAt: new Date().toISOString(), notes: "" },
  vehicle: VEHICLES.sedan,
  constraints: baseConstraints,
  layers: baseLayers,
  settings: baseSettings,
  scenarios: baseScenarios,
  vendors: baseVendors,
  sensors: [],
  selectedSensorId: null,
  error: null
});

export const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case "setVehicle": {
      const sensors = enforceConstraints(state.sensors, action.vehicle, state.constraints);
      return { ...state, vehicle: action.vehicle, sensors };
    }
    case "applyPreset": {
      const vendors = presetVendors(action.preset);
      const sensors = presetSensors(action.preset, state.vehicle);
      const withSpecs = applyVendorSpecs(sensors, vendors);
      const constrained = enforceConstraints(withSpecs, state.vehicle, state.constraints);
      return {
        ...state,
        meta: { ...state.meta, presetId: action.preset },
        vendors,
        sensors: constrained,
        selectedSensorId: constrained[0]?.id ?? null
      };
    }
    case "updateSensor": {
      const sensors = state.sensors.map((sensor) => (sensor.id === action.sensor.id ? action.sensor : sensor));
      const constrained = enforceConstraints(sensors, state.vehicle, state.constraints);
      return { ...state, sensors: constrained };
    }
    case "selectSensor":
      return { ...state, selectedSensorId: action.id };
    case "setConstraints": {
      const sensors = enforceConstraints(state.sensors, state.vehicle, action.constraints);
      return { ...state, constraints: action.constraints, sensors };
    }
    case "setLayers":
      return { ...state, layers: action.layers };
    case "setSettings":
      return { ...state, settings: action.settings };
    case "setScenarios":
      return { ...state, scenarios: action.scenarios };
    case "setVendors": {
      const sensors = applyVendorSpecs(state.sensors, action.vendors);
      const constrained = enforceConstraints(sensors, state.vehicle, state.constraints);
      return { ...state, vendors: action.vendors, sensors: constrained };
    }
    case "importState": {
      const vendors = action.state.vendors ?? baseVendors;
      const settings = action.state.settings ?? baseSettings;
      const scenarios = action.state.scenarios ?? baseScenarios;
      const sensorsWithSpecs = applyVendorSpecs(action.state.sensors, vendors);
      const sensors = enforceConstraints(sensorsWithSpecs, action.state.vehicle, action.state.constraints);
      return {
        ...state,
        ...action.state,
        vendors,
        settings,
        scenarios,
        sensors,
        selectedSensorId: sensors[0]?.id ?? null,
        error: null
      };
    }
    case "setError":
      return { ...state, error: action.error };
    default:
      return state;
  }
};
