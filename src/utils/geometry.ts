import { Vec2 } from "../models/types";

export const degToRad = (deg: number) => (deg * Math.PI) / 180;

export const distance = (a: Vec2, b: Vec2) => Math.hypot(a.x - b.x, a.y - b.y);

export const pointInPolygon = (point: Vec2, polygon: Vec2[]) => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    const intersect = yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

export const nearestPointOnSegment = (p: Vec2, a: Vec2, b: Vec2): Vec2 => {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const abLenSq = abx * abx + aby * aby;
  if (abLenSq === 0) return { ...a };
  const t = ((p.x - a.x) * abx + (p.y - a.y) * aby) / abLenSq;
  const clamped = Math.max(0, Math.min(1, t));
  return { x: a.x + abx * clamped, y: a.y + aby * clamped };
};

export const clampPointToPolygon = (point: Vec2, polygon: Vec2[]) => {
  if (pointInPolygon(point, polygon)) return { ...point };
  let nearest = polygon[0];
  let minDist = Infinity;
  for (let i = 0; i < polygon.length; i += 1) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];
    const candidate = nearestPointOnSegment(point, a, b);
    const dist = distance(point, candidate);
    if (dist < minDist) {
      minDist = dist;
      nearest = candidate;
    }
  }
  return nearest;
};

export const wedgeTriangle = (origin: Vec2, yawDeg: number, fovDeg: number, range: number) => {
  const half = degToRad(fovDeg / 2);
  const yaw = degToRad(yawDeg);
  const left = { x: origin.x + range * Math.cos(yaw + half), y: origin.y + range * Math.sin(yaw + half) };
  const right = { x: origin.x + range * Math.cos(yaw - half), y: origin.y + range * Math.sin(yaw - half) };
  return [origin, right, left];
};

const polygonArea = (poly: Vec2[]) => {
  let area = 0;
  for (let i = 0; i < poly.length; i += 1) {
    const j = (i + 1) % poly.length;
    area += poly[i].x * poly[j].y - poly[j].x * poly[i].y;
  }
  return Math.abs(area) / 2;
};

const inside = (p: Vec2, a: Vec2, b: Vec2) => (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x) >= 0;

const intersection = (s: Vec2, e: Vec2, a: Vec2, b: Vec2): Vec2 => {
  const dc = { x: a.x - b.x, y: a.y - b.y };
  const dp = { x: s.x - e.x, y: s.y - e.y };
  const n1 = a.x * b.y - a.y * b.x;
  const n2 = s.x * e.y - s.y * e.x;
  const denom = dc.x * dp.y - dc.y * dp.x;
  if (denom === 0) return s;
  const x = (n1 * dp.x - n2 * dc.x) / denom;
  const y = (n1 * dp.y - n2 * dc.y) / denom;
  return { x, y };
};

export const intersectionAreaConvex = (subjectPolygon: Vec2[], clipPolygon: Vec2[]) => {
  let output = [...subjectPolygon];
  for (let i = 0; i < clipPolygon.length; i += 1) {
    const a = clipPolygon[i];
    const b = clipPolygon[(i + 1) % clipPolygon.length];
    const input = output;
    output = [];
    for (let j = 0; j < input.length; j += 1) {
      const s = input[j];
      const e = input[(j + 1) % input.length];
      if (inside(e, a, b)) {
        if (!inside(s, a, b)) {
          output.push(intersection(s, e, a, b));
        }
        output.push(e);
      } else if (inside(s, a, b)) {
        output.push(intersection(s, e, a, b));
      }
    }
    if (output.length === 0) return 0;
  }
  return polygonArea(output);
};
