import { useMemo } from "react";
import * as THREE from "three";

type GuideDetail = "low" | "high";

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

const createLabelSprite = (text: string) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.font = "bold 36px IBM Plex Sans, sans-serif";
  const metrics = ctx.measureText(text);
  canvas.width = Math.ceil(metrics.width + 24);
  canvas.height = 64;
  ctx.font = "bold 36px IBM Plex Sans, sans-serif";
  ctx.fillStyle = "#1f2937";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.7 });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.8, 0.8, 0.8);
  return sprite;
};

const buildAxisLine = (plane: "xy" | "xz", axis: "x" | "y" | "z", size: number) => {
  if (plane === "xy") {
    if (axis === "x") return new Float32Array([-size, 0, 0, size, 0, 0]);
    return new Float32Array([0, -size, 0, 0, size, 0]);
  }
  if (axis === "x") return new Float32Array([-size, 0, 0, size, 0, 0]);
  return new Float32Array([0, 0, -size, 0, 0, size]);
};

export const ReferenceGuides = ({ plane, detail }: { plane: "xy" | "xz"; detail: GuideDetail }) => {
  const size = detail === "low" ? 10 : 15;
  const minorStep = detail === "low" ? 5 : 1;
  const majorStep = 5;
  const minor = useMemo(() => (detail === "high" ? buildGrid(plane, size, minorStep) : new Float32Array()), [
    plane,
    detail,
    size,
    minorStep
  ]);
  const major = useMemo(() => buildGrid(plane, size, majorStep), [plane, size, majorStep]);
  const rays = useMemo(() => (detail === "high" ? buildRays(plane, 10, 30) : new Float32Array()), [plane, detail]);
  const axisX = useMemo(() => buildAxisLine(plane, "x", size), [plane, size]);
  const axisY = useMemo(() => buildAxisLine(plane, plane === "xy" ? "y" : "z", size), [plane, size]);
  const axisLabels = useMemo(() => {
    const xLabel = createLabelSprite("X");
    const yLabel = createLabelSprite(plane === "xy" ? "Y" : "Z");
    if (!xLabel || !yLabel) return null;
    xLabel.position.set(size + 0.6, 0, 0);
    yLabel.position.set(0, plane === "xy" ? size + 0.6 : 0, plane === "xy" ? 0 : size + 0.6);
    return { xLabel, yLabel };
  }, [plane, size]);
  const tickLabels = useMemo(() => {
    const ticks: THREE.Sprite[] = [];
    const maxTick = detail === "low" ? 10 : 20;
    for (let i = majorStep; i <= maxTick; i += majorStep) {
      const label = createLabelSprite(`${i}m`);
      if (!label) continue;
      if (plane === "xy") {
        label.position.set(i, -0.6, 0);
      } else {
        label.position.set(i, 0, -0.6);
      }
      ticks.push(label);
    }
    return ticks;
  }, [plane, detail]);

  return (
    <group>
      {minor.length > 0 && (
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" array={minor} itemSize={3} count={minor.length / 3} />
          </bufferGeometry>
          <lineBasicMaterial color="#94a3b8" transparent opacity={0.15} />
        </lineSegments>
      )}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={major} itemSize={3} count={major.length / 3} />
        </bufferGeometry>
        <lineBasicMaterial color="#64748b" transparent opacity={0.25} />
      </lineSegments>
      {rays.length > 0 && (
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" array={rays} itemSize={3} count={rays.length / 3} />
          </bufferGeometry>
          <lineBasicMaterial color="#1f2937" transparent opacity={0.2} />
        </lineSegments>
      )}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={axisX} itemSize={3} count={axisX.length / 3} />
        </bufferGeometry>
        <lineBasicMaterial color="#0f172a" transparent opacity={0.4} />
      </lineSegments>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={axisY} itemSize={3} count={axisY.length / 3} />
        </bufferGeometry>
        <lineBasicMaterial color="#0f172a" transparent opacity={0.4} />
      </lineSegments>
      {axisLabels && (
        <group>
          <primitive object={axisLabels.xLabel} />
          <primitive object={axisLabels.yLabel} />
        </group>
      )}
      {tickLabels.length > 0 && (
        <group>
          {tickLabels.map((label, index) => (
            <primitive key={`tick-${index}`} object={label} />
          ))}
        </group>
      )}
    </group>
  );
};
