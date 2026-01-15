import { Sensor } from "../models/types";
import { hashString, mulberry32 } from "../utils/random";

const toRad = (deg: number) => (deg * Math.PI) / 180;

export const generateLidarPoints = (sensor: Sensor, pointCount: number) => {
  const seed = hashString(sensor.id);
  const rand = mulberry32(seed);
  const points = new Float32Array(pointCount * 3);
  const hDeg = sensor.fov.horizontalDeg;
  const vDeg = sensor.fov.verticalDeg ?? 30;
  const hRad = toRad(hDeg);
  const vRad = toRad(vDeg);
  for (let i = 0; i < pointCount; i += 1) {
    const az = hDeg >= 360 ? rand() * Math.PI * 2 : (rand() - 0.5) * hRad;
    const el = (rand() - 0.5) * vRad;
    const r = sensor.rangeM * Math.sqrt(rand());
    const x = r * Math.cos(el) * Math.cos(az);
    const y = r * Math.cos(el) * Math.sin(az);
    const z = r * Math.sin(el);
    points[i * 3] = x;
    points[i * 3 + 1] = y;
    points[i * 3 + 2] = z;
  }
  return points;
};
