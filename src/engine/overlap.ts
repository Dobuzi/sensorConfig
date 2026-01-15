import { Sensor } from "../models/types";
import { intersectionAreaConvex, wedgeTriangle } from "../utils/geometry";

export type OverlapResult = { pair: [string, string]; area: number }[];

export const detectOverlaps = (sensors: Sensor[]) => {
  const overlaps: OverlapResult = [];
  for (let i = 0; i < sensors.length; i += 1) {
    for (let j = i + 1; j < sensors.length; j += 1) {
      const a = sensors[i];
      const b = sensors[j];
      if (!a.enabled || !b.enabled) continue;
      const aTri = wedgeTriangle(
        { x: a.pose.position.x, y: a.pose.position.y },
        a.pose.orientation.yawDeg,
        a.fov.horizontalDeg,
        a.rangeM
      );
      const bTri = wedgeTriangle(
        { x: b.pose.position.x, y: b.pose.position.y },
        b.pose.orientation.yawDeg,
        b.fov.horizontalDeg,
        b.rangeM
      );
      const area = intersectionAreaConvex(aTri, bTri);
      if (area > 0) {
        overlaps.push({ pair: [a.id, b.id], area });
      }
    }
  }
  return overlaps;
};
