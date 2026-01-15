import { Layers, Sensor, Vec2 } from "../models/types";
import { pointInTriangle, wedgeTriangle } from "../utils/geometry";

const toRad = (deg: number) => (deg * Math.PI) / 180;

export type CoverageResult = {
  total: number;
  covered: number;
  byType: Record<string, number>;
  points: Vec2[];
  coveredPoints: Vec2[];
};

export const sampleCoverageRegion = (count: number) => {
  const points: Vec2[] = [];
  const xMin = 0;
  const xMax = 50;
  const yMin = -10;
  const yMax = 10;
  const grid = Math.ceil(Math.sqrt(count));
  const dx = (xMax - xMin) / grid;
  const dy = (yMax - yMin) / grid;
  for (let i = 0; i < grid; i += 1) {
    for (let j = 0; j < grid; j += 1) {
      points.push({ x: xMin + i * dx, y: yMin + j * dy });
    }
  }
  return points;
};

const pointCoveredBySensor = (point: Vec2, sensor: Sensor) => {
  if (!sensor.enabled) return false;
  const dx = point.x - sensor.pose.position.x;
  const dy = point.y - sensor.pose.position.y;
  const range = Math.hypot(dx, dy);
  if (range > sensor.rangeM) return false;
  if (sensor.fov.horizontalDeg >= 350) return true;
  const triangle = wedgeTriangle(
    { x: sensor.pose.position.x, y: sensor.pose.position.y },
    sensor.pose.orientation.yawDeg,
    sensor.fov.horizontalDeg,
    sensor.rangeM
  );
  return pointInTriangle(point, triangle[0], triangle[1], triangle[2]);
};

export const computeCoverage = (
  sensors: Sensor[],
  layers: Layers,
  sampleCount: number
): CoverageResult => {
  const points = sampleCoverageRegion(sampleCount);
  const coveredPoints: Vec2[] = [];
  const byType: Record<string, number> = { camera: 0, radar: 0, ultrasonic: 0, lidar: 0 };
  let covered = 0;

  points.forEach((point) => {
    let pointCovered = false;
    const typeCovered: Record<string, boolean> = { camera: false, radar: false, ultrasonic: false, lidar: false };
    sensors.forEach((sensor) => {
      if (!layers[sensor.type]) return;
      if (pointCoveredBySensor(point, sensor)) {
        pointCovered = true;
        typeCovered[sensor.type] = true;
      }
    });
    if (pointCovered) {
      covered += 1;
      coveredPoints.push(point);
    }
    Object.keys(typeCovered).forEach((type) => {
      if (typeCovered[type]) byType[type] += 1;
    });
  });

  return { total: points.length, covered, byType, points, coveredPoints };
};

export const isPointInSensorVolume = (sensor: Sensor, target: { x: number; y: number; z: number }) => {
  const dx = target.x - sensor.pose.position.x;
  const dy = target.y - sensor.pose.position.y;
  const dz = target.z - sensor.pose.position.z;
  const range = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (range > sensor.rangeM) return false;
  const yaw = toRad(sensor.pose.orientation.yawDeg);
  const pitch = toRad(sensor.pose.orientation.pitchDeg);
  const roll = toRad(sensor.pose.orientation.rollDeg);

  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const cr = Math.cos(roll);
  const sr = Math.sin(roll);

  const m00 = cy * cp;
  const m01 = cy * sp * sr - sy * cr;
  const m02 = cy * sp * cr + sy * sr;
  const m10 = sy * cp;
  const m11 = sy * sp * sr + cy * cr;
  const m12 = sy * sp * cr - cy * sr;
  const m20 = -sp;
  const m21 = cp * sr;
  const m22 = cp * cr;

  const lx = m00 * dx + m10 * dy + m20 * dz;
  const ly = m01 * dx + m11 * dy + m21 * dz;
  const lz = m02 * dx + m12 * dy + m22 * dz;

  const hDeg = sensor.fov.horizontalDeg;
  const vDeg = sensor.fov.verticalDeg ?? 60;
  const h = Math.abs(Math.atan2(ly, lx)) * (180 / Math.PI);
  const v = Math.abs(Math.atan2(lz, lx)) * (180 / Math.PI);
  if (hDeg < 350 && h > hDeg / 2) return false;
  if (vDeg && v > vDeg / 2) return false;
  return lx >= 0;
};

export const scenarioCovered = (sensors: Sensor[], layers: Layers, target: { x: number; y: number; z: number }) => {
  return sensors.some((sensor) => layers[sensor.type] && isPointInSensorVolume(sensor, target));
};
