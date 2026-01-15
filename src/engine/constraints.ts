import { Constraints, Sensor, Vec2, VehicleTemplate } from "../models/types";
import { clampPointToPolygon, distance, pointInPolygon } from "../utils/geometry";

export const applyBoundaryClamp = (sensor: Sensor, polygon: Vec2[]) => {
  const point = { x: sensor.pose.position.x, y: sensor.pose.position.y };
  const clamped = clampPointToPolygon(point, polygon);
  return {
    ...sensor,
    pose: { ...sensor.pose, position: { ...sensor.pose.position, ...clamped } }
  };
};

const separatePair = (a: Sensor, b: Sensor, minSpacing: number, polygon: Vec2[]) => {
  const pa = { x: a.pose.position.x, y: a.pose.position.y };
  const pb = { x: b.pose.position.x, y: b.pose.position.y };
  const d = distance(pa, pb);
  if (d === 0 || d >= minSpacing) return [a, b];
  const overlap = (minSpacing - d) / 2;
  const dir = { x: (pa.x - pb.x) / d, y: (pa.y - pb.y) / d };
  const nextA = { x: pa.x + dir.x * overlap, y: pa.y + dir.y * overlap };
  const nextB = { x: pb.x - dir.x * overlap, y: pb.y - dir.y * overlap };
  const clampedA = clampPointToPolygon(nextA, polygon);
  const clampedB = clampPointToPolygon(nextB, polygon);
  return [
    { ...a, pose: { ...a.pose, position: { ...a.pose.position, ...clampedA } } },
    { ...b, pose: { ...b.pose, position: { ...b.pose.position, ...clampedB } } }
  ];
};

export const applyMinSpacing = (sensors: Sensor[], polygon: Vec2[], minSpacing: number) => {
  let updated = sensors.map((sensor) => ({ ...sensor }));
  for (let i = 0; i < updated.length; i += 1) {
    for (let j = i + 1; j < updated.length; j += 1) {
      const [a, b] = separatePair(updated[i], updated[j], minSpacing, polygon);
      updated[i] = a;
      updated[j] = b;
    }
  }
  return updated;
};

export const applyMirrorPlacement = (sensors: Sensor[], enabled: boolean) => {
  if (!enabled) return sensors.map((sensor) => ({ ...sensor }));
  const updated = sensors.map((sensor) => ({ ...sensor }));
  const byGroup = new Map<string, Sensor[]>();
  updated.forEach((sensor) => {
    if (!sensor.mirrorGroup) return;
    const group = byGroup.get(sensor.mirrorGroup) ?? [];
    group.push(sensor);
    byGroup.set(sensor.mirrorGroup, group);
  });

  byGroup.forEach((group) => {
    if (group.length === 1) {
      const original = group[0];
      const mirrored: Sensor = {
        ...original,
        id: `${original.id}-mirror`,
        label: `${original.label} (Mirrored)`,
        pose: {
          ...original.pose,
          position: { ...original.pose.position, y: -original.pose.position.y },
          orientation: {
            ...original.pose.orientation,
            yawDeg: -original.pose.orientation.yawDeg
          }
        }
      };
      updated.push(mirrored);
      return;
    }
    if (group.length >= 2) {
      const [a, b] = group;
      const source = Math.abs(a.pose.position.y) >= Math.abs(b.pose.position.y) ? a : b;
      const target = source === a ? b : a;
      const nextTarget = {
        ...target,
        pose: {
          ...source.pose,
          position: { ...source.pose.position, y: -source.pose.position.y },
          orientation: { ...source.pose.orientation, yawDeg: -source.pose.orientation.yawDeg }
        }
      };
      const index = updated.findIndex((sensor) => sensor.id === target.id);
      if (index !== -1) updated[index] = nextTarget;
    }
  });
  return updated;
};

export const enforceConstraints = (
  sensors: Sensor[],
  vehicle: VehicleTemplate,
  constraints: Constraints
) => {
  let updated = sensors.map((sensor) => ({ ...sensor }));
  if (constraints.boundaryClamp) {
    updated = updated.map((sensor) => applyBoundaryClamp(sensor, vehicle.footprintPolygon));
  }
  updated = applyMinSpacing(updated, vehicle.footprintPolygon, constraints.minSpacingM);
  updated = applyMirrorPlacement(updated, constraints.mirrorPlacement);
  if (constraints.boundaryClamp) {
    updated = updated.map((sensor) => {
      const point = { x: sensor.pose.position.x, y: sensor.pose.position.y };
      if (pointInPolygon(point, vehicle.footprintPolygon)) return sensor;
      return applyBoundaryClamp(sensor, vehicle.footprintPolygon);
    });
  }
  return updated;
};
