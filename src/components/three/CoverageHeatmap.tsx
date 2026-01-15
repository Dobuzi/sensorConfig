import { useMemo } from "react";
import * as THREE from "three";
import { Vec2 } from "../../models/types";

export const CoverageHeatmap = ({ points }: { points: Vec2[] }) => {
  const geometry = useMemo(() => {
    const vertices = new Float32Array(points.length * 3);
    points.forEach((p, i) => {
      vertices[i * 3] = p.x;
      vertices[i * 3 + 1] = p.y;
      vertices[i * 3 + 2] = 0.01;
    });
    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    return buffer;
  }, [points]);

  return (
    <points geometry={geometry} raycast={() => null}>
      <pointsMaterial size={0.08} color="#22c55e" transparent opacity={0.25} />
    </points>
  );
};
