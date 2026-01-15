import { SensorType } from "../models/types";

export const SENSOR_TYPE_COLORS: Record<SensorType, string> = {
  camera: "#38bdf8",
  radar: "#f59e0b",
  ultrasonic: "#22c55e",
  lidar: "#ef4444"
};

export const SENSOR_TYPE_LABELS: Record<SensorType, string> = {
  camera: "Camera",
  radar: "Radar",
  ultrasonic: "Ultrasonic",
  lidar: "LiDAR"
};
