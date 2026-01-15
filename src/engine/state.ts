import {
  AppState,
  Constraints,
  ExportState,
  Layers,
  SCHEMA_VERSION,
  ScenarioState,
  Sensor,
  UiSettings,
  VehicleTemplate
} from "../models/types";
import { VEHICLES } from "../models/vehicles";
import { enforceConstraints } from "./constraints";
import { presetSensors, PresetId } from "./presets";

export type Action =
  | { type: "setVehicle"; vehicle: VehicleTemplate }
  | { type: "applyPreset"; preset: PresetId }
  | { type: "updateSensor"; sensor: Sensor }
  | { type: "selectSensor"; id: string | null }
  | { type: "setConstraints"; constraints: Constraints }
  | { type: "setLayers"; layers: Layers }
  | { type: "setSettings"; settings: UiSettings }
  | { type: "setScenarios"; scenarios: ScenarioState }
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

export const createInitialState = (): AppState => ({
  schemaVersion: SCHEMA_VERSION,
  meta: { presetId: "", createdAt: new Date().toISOString(), notes: "" },
  vehicle: VEHICLES.sedan,
  constraints: baseConstraints,
  layers: baseLayers,
  settings: baseSettings,
  scenarios: baseScenarios,
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
      const sensors = presetSensors(action.preset, state.vehicle);
      const constrained = enforceConstraints(sensors, state.vehicle, state.constraints);
      return {
        ...state,
        meta: { ...state.meta, presetId: action.preset },
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
    case "importState": {
      const sensors = enforceConstraints(action.state.sensors, action.state.vehicle, action.state.constraints);
      return {
        ...state,
        ...action.state,
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
