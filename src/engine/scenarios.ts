import { ScenarioState, Vec2 } from "../models/types";

export const pedestrianPath = (distance: number) => ({
  line: [
    { x: distance, y: -6 },
    { x: distance, y: 6 }
  ] as [Vec2, Vec2],
  marker: { x: distance, y: 0, z: 0 }
});

export const intersectionPath = (distance: number) => ({
  line: [
    { x: distance, y: -8 },
    { x: distance, y: 8 }
  ] as [Vec2, Vec2],
  marker: { x: distance, y: 0, z: 0 }
});

export const scenarioMarkers = (scenarios: ScenarioState) => {
  const pedestrian = pedestrianPath(scenarios.pedestrian.crossingDistanceM).marker;
  const intersection = intersectionPath(scenarios.intersection.centerDistanceM).marker;
  return { pedestrian, intersection };
};
