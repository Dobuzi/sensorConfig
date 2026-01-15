import { Sensor } from "../models/types";

export const applyTopViewDrag = (sensor: Sensor, point: { x: number; y: number }) => {
  return {
    ...sensor,
    pose: {
      ...sensor.pose,
      position: { ...sensor.pose.position, x: point.x, y: point.y }
    }
  };
};

export const applySideViewDrag = (sensor: Sensor, point: { x: number; z: number }) => {
  return {
    ...sensor,
    pose: {
      ...sensor.pose,
      position: { ...sensor.pose.position, x: point.x, z: point.z }
    }
  };
};
