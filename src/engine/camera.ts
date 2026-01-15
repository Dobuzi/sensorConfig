import { VehicleTemplate } from "../models/types";

export type CameraPose = {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  near: number;
  far: number;
};

export const getMainCameraPose = (vehicle: VehicleTemplate): CameraPose => {
  const span = Math.max(vehicle.dimensions.length, vehicle.dimensions.width);
  const radius = Math.max(2.5, span * 0.7);
  const position: [number, number, number] = [radius * 0.45, -radius * 1.4, radius * 0.6];
  return {
    position,
    target: [0, 0, 0],
    fov: 45,
    near: 0.1,
    far: 200
  };
};
