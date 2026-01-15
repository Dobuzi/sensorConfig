import { useMemo } from "react";
import * as THREE from "three";

const buildGrid = (plane: "xy" | "xz", size: number, step: number) => {
  const points: number[] = [];
  for (let i = -size; i <= size; i += step) {
    if (plane === "xy") {
      points.push(-size, i, 0, size, i, 0);
      points.push(i, -size, 0, i, size, 0);
    } else {
      points.push(-size, 0, i, size, 0, i);
      points.push(i, 0, -size, i, 0, size);
    }
  }
  return new Float32Array(points);
};

const buildRays = (plane: "xy" | "xz", radius: number, stepDeg: number) => {
  const points: number[] = [];
  for (let deg = -180; deg <= 180; deg += stepDeg) {
    const rad = (deg * Math.PI) / 180;
    const x = Math.cos(rad) * radius;
    const y = Math.sin(rad) * radius;
    if (plane === "xy") {
      points.push(0, 0, 0, x, y, 0);
    } else {
      points.push(0, 0, 0, x, 0, y);
    }
  }
  return new Float32Array(points);
};

export const ReferenceGuides = ({ plane }: { plane: "xy" | "xz" }) => {
  const minor = useMemo(() => buildGrid(plane, 12, 1), [plane]);
  const major = useMemo(() => buildGrid(plane, 12, 5), [plane]);
  const rays = useMemo(() => buildRays(plane, 8, 30), [plane]);

  return (
    <group>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={minor} itemSize={3} count={minor.length / 3} />
        </bufferGeometry>
        <lineBasicMaterial color="#94a3b8" transparent opacity={0.15} />
      </lineSegments>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={major} itemSize={3} count={major.length / 3} />
        </bufferGeometry>
        <lineBasicMaterial color="#64748b" transparent opacity={0.25} />
      </lineSegments>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={rays} itemSize={3} count={rays.length / 3} />
        </bufferGeometry>
        <lineBasicMaterial color="#1f2937" transparent opacity={0.2} />
      </lineSegments>
    </group>
  );
};
