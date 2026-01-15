import { VehicleTemplate } from "./types";

export const VEHICLES: Record<string, VehicleTemplate> = {
  sedan: {
    type: "sedan",
    dimensions: { length: 4.7, width: 1.8, wheelbase: 2.8 },
    footprintPolygon: [
      { x: -2.3, y: -0.9 },
      { x: 2.3, y: -0.9 },
      { x: 2.4, y: 0.0 },
      { x: 2.3, y: 0.9 },
      { x: -2.3, y: 0.9 },
      { x: -2.4, y: 0.0 }
    ]
  },
  hatchback: {
    type: "hatchback",
    dimensions: { length: 4.2, width: 1.75, wheelbase: 2.6 },
    footprintPolygon: [
      { x: -2.0, y: -0.85 },
      { x: 2.0, y: -0.85 },
      { x: 2.1, y: 0.0 },
      { x: 2.0, y: 0.85 },
      { x: -2.0, y: 0.85 },
      { x: -2.1, y: 0.0 }
    ]
  },
  suv: {
    type: "suv",
    dimensions: { length: 4.9, width: 2.0, wheelbase: 2.9 },
    footprintPolygon: [
      { x: -2.4, y: -1.0 },
      { x: 2.4, y: -1.0 },
      { x: 2.5, y: 0.0 },
      { x: 2.4, y: 1.0 },
      { x: -2.4, y: 1.0 },
      { x: -2.5, y: 0.0 }
    ]
  }
};
