import { useMemo } from "react";
import * as THREE from "three";
import { ScenarioState } from "../../models/types";
import { intersectionPath, pedestrianPath } from "../../engine/scenarios";

const lineGeometry = (points: { x: number; y: number; z: number }[]) => {
  const vertices = new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]));
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  return geometry;
};

const LabelSprite = ({ text, position, color }: { text: string; position: [number, number, number]; color: string }) => {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    ctx.font = "24px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [text, color]);

  if (!texture) return null;

  return (
    <sprite position={position} raycast={() => null}>
      <spriteMaterial map={texture} transparent opacity={0.8} />
    </sprite>
  );
};

export const ScenarioOverlays = ({ scenarios }: { scenarios: ScenarioState }) => {
  const pedestrian = useMemo(() => pedestrianPath(scenarios.pedestrian.crossingDistanceM), [scenarios]);
  const intersection = useMemo(() => intersectionPath(scenarios.intersection.centerDistanceM), [scenarios]);

  const lane = useMemo(() => {
    const points = [
      { x: 0, y: -1.75, z: 0.01 },
      { x: 50, y: -1.75, z: 0.01 },
      { x: 50, y: 1.75, z: 0.01 },
      { x: 0, y: 1.75, z: 0.01 },
      { x: 0, y: -1.75, z: 0.01 }
    ];
    return lineGeometry(points);
  }, []);

  const pedestrianLine = useMemo(
    () => lineGeometry([
      { x: pedestrian.line[0].x, y: pedestrian.line[0].y, z: 0.02 },
      { x: pedestrian.line[1].x, y: pedestrian.line[1].y, z: 0.02 }
    ]),
    [pedestrian]
  );

  const intersectionLine = useMemo(
    () => lineGeometry([
      { x: intersection.line[0].x, y: intersection.line[0].y, z: 0.02 },
      { x: intersection.line[1].x, y: intersection.line[1].y, z: 0.02 }
    ]),
    [intersection]
  );

  return (
    <group raycast={() => null}>
      <line geometry={lane}>
        <lineBasicMaterial color="#94a3b8" transparent opacity={0.3} />
      </line>

      {scenarios.pedestrian.enabled && (
        <group>
          <line geometry={pedestrianLine}>
            <lineBasicMaterial color="#f97316" transparent opacity={0.6} />
          </line>
          <mesh position={[pedestrian.marker.x, pedestrian.marker.y, 0.9]}>
            <cylinderGeometry args={[0.2, 0.2, 1.8, 10]} />
            <meshStandardMaterial color="#fb923c" transparent opacity={0.75} />
          </mesh>
          <LabelSprite text="Pedestrian" position={[pedestrian.marker.x, pedestrian.marker.y + 1, 2]} color="#f97316" />
        </group>
      )}

      {scenarios.intersection.enabled && (
        <group>
          <line geometry={intersectionLine}>
            <lineBasicMaterial color="#38bdf8" transparent opacity={0.6} />
          </line>
          <mesh position={[intersection.marker.x, intersection.marker.y, 0.6]}>
            <boxGeometry args={[1.4, 0.7, 1.2]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.6} />
          </mesh>
          <LabelSprite text="Intersection" position={[intersection.marker.x, intersection.marker.y + 1, 1.6]} color="#38bdf8" />
        </group>
      )}
    </group>
  );
};
