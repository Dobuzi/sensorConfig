export type VehicleType = "sedan" | "hatchback" | "suv";
export type SensorType = "camera" | "radar" | "ultrasonic" | "lidar";

export type Vec2 = { x: number; y: number };

export type VehicleTemplate = {
  type: VehicleType;
  dimensions: { length: number; width: number; wheelbase: number };
  footprintPolygon: Vec2[];
};

export type SensorPose = {
  position: { x: number; y: number; z: number };
  orientation: { yawDeg: number; pitchDeg: number; rollDeg: number };
};

export type Sensor = {
  id: string;
  type: SensorType;
  label: string;
  pose: SensorPose;
  fov: { horizontalDeg: number; verticalDeg: number | null };
  rangeM: number;
  enabled: boolean;
  mirrorGroup?: string;
};

export type Constraints = {
  boundaryClamp: boolean;
  minSpacingM: number;
  mirrorPlacement: boolean;
};

export type Layers = {
  camera: boolean;
  radar: boolean;
  ultrasonic: boolean;
  lidar: boolean;
  overlapHighlight: boolean;
};

export type AppState = {
  schemaVersion: string;
  meta: { presetId: string; createdAt: string; notes: string };
  vehicle: VehicleTemplate;
  constraints: Constraints;
  layers: Layers;
  sensors: Sensor[];
  selectedSensorId: string | null;
  error: string | null;
};

export type ExportState = Omit<AppState, "selectedSensorId" | "error">;

export const SCHEMA_VERSION = "1.0.0";
