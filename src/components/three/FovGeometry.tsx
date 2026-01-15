import * as THREE from "three";
import { Sensor } from "../../models/types";

const toRad = (deg: number) => (deg * Math.PI) / 180;

const buildCameraFrustum = (horizontalDeg: number, verticalDeg: number | null, range: number) => {
  const vDeg = verticalDeg ?? 20;
  const hRad = toRad(horizontalDeg);
  const vRad = toRad(vDeg);
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
};

const buildRadarFan = (horizontalDeg: number, verticalDeg: number | null, range: number) => {
  const hRad = toRad(horizontalDeg);
  const vRad = toRad(verticalDeg ?? 10);
  const height = Math.max(0.2, Math.tan(vRad / 2) * range * 2);
  const shape = new THREE.Shape();
  const start = -hRad / 2;
  const end = hRad / 2;
  shape.moveTo(0, 0);
  shape.absarc(0, 0, range, start, end, false);
  shape.lineTo(0, 0);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: false,
    steps: 1
  });
  geometry.translate(0, 0, -height / 2);
  return geometry;
};

const buildUltrasonicCone = (horizontalDeg: number, verticalDeg: number | null, range: number) => {
  const hRad = toRad(horizontalDeg);
  const vRad = toRad(verticalDeg ?? horizontalDeg);
  const halfAngle = Math.max(hRad, vRad) / 2;
  const radius = Math.tan(halfAngle) * range;
  const geometry = new THREE.ConeGeometry(radius, range, 20, 1, true);
  geometry.rotateZ(-Math.PI / 2);
  geometry.translate(range / 2, 0, 0);
  return geometry;
};

export const buildFovGeometry = (sensor: Sensor) => {
  switch (sensor.type) {
    case "radar":
      return buildRadarFan(sensor.fov.horizontalDeg, sensor.fov.verticalDeg, sensor.rangeM);
    case "ultrasonic":
      return buildUltrasonicCone(sensor.fov.horizontalDeg, sensor.fov.verticalDeg, sensor.rangeM);
    case "lidar":
      return buildCameraFrustum(sensor.fov.horizontalDeg, sensor.fov.verticalDeg ?? 30, sensor.rangeM);
    case "camera":
    default:
      return buildCameraFrustum(sensor.fov.horizontalDeg, sensor.fov.verticalDeg, sensor.rangeM);
  }
};
