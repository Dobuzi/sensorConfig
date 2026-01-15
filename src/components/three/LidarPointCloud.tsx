import { useMemo } from "react";
import * as THREE from "three";
import { Sensor } from "../../models/types";
import { generateLidarPoints } from "../../engine/lidar";

export const LidarPointCloud = ({ sensor, pointCount }: { sensor: Sensor; pointCount: number }) => {
  const geometry = useMemo(() => {
    const points = generateLidarPoints(sensor, pointCount);
    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute("position", new THREE.BufferAttribute(points, 3));
    return buffer;
  }, [sensor, pointCount]);

  return (
    <points geometry={geometry}>
      <pointsMaterial size={0.05} color="#22d3ee" transparent opacity={0.6} />
    </points>
  );
};
