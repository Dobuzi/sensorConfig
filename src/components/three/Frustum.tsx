import { useMemo } from "react";
import * as THREE from "three";

const DEFAULT_VERTICAL_DEG = 20;

export const useFrustumGeometry = (horizontalDeg: number, verticalDeg: number | null, range: number) => {
  return useMemo(() => {
    const vDeg = verticalDeg ?? DEFAULT_VERTICAL_DEG;
    const hRad = (horizontalDeg * Math.PI) / 180;
    const vRad = (vDeg * Math.PI) / 180;
    const halfW = Math.tan(hRad / 2) * range;
    const halfH = Math.tan(vRad / 2) * range;

    const vertices = new Float32Array([
      0, 0, 0,
      range, -halfW, -halfH,
      range, halfW, -halfH,
      range, halfW, halfH,
      range, -halfW, halfH
    ]);

    const indices = [
      0, 1, 2,
      0, 2, 3,
      0, 3, 4,
      0, 4, 1,
      1, 2, 3,
      1, 3, 4
    ];

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }, [horizontalDeg, verticalDeg, range]);
};
