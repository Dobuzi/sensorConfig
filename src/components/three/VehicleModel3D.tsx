import { useMemo } from "react";
import * as THREE from "three";
import { VehicleTemplate } from "../../models/types";

type DetailLevel = "low" | "high";

const alignToGround = (geometry: THREE.BufferGeometry) => {
  geometry.computeBoundingBox();
  if (!geometry.boundingBox) return geometry;
  const minZ = geometry.boundingBox.min.z;
  geometry.translate(0, 0, -minZ);
  return geometry;
};

const buildBodyGeometry = (length: number, width: number, height: number) => {
  const halfL = length * 0.5;
  const profile = new THREE.Shape();
  profile.moveTo(-halfL, 0);
  profile.lineTo(halfL * 0.82, 0);
  profile.quadraticCurveTo(halfL, height * 0.08, halfL * 0.92, height * 0.18);
  profile.lineTo(halfL * 0.35, height * 0.55);
  profile.quadraticCurveTo(0, height * 0.68, -halfL * 0.28, height * 0.58);
  profile.lineTo(-halfL * 0.88, height * 0.28);
  profile.quadraticCurveTo(-halfL, height * 0.12, -halfL, 0);

  const body = new THREE.ExtrudeGeometry(profile, {
    depth: width * 0.9,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.06,
    bevelSegments: 2
  });
  body.rotateX(Math.PI / 2);
  body.center();
  return alignToGround(body);
};

const buildRoofGeometry = (length: number, width: number, height: number) => {
  const halfL = length * 0.35;
  const roof = new THREE.Shape();
  roof.moveTo(-halfL, 0);
  roof.lineTo(halfL * 0.9, 0);
  roof.quadraticCurveTo(halfL, height * 0.1, halfL * 0.75, height * 0.25);
  roof.lineTo(-halfL * 0.65, height * 0.28);
  roof.quadraticCurveTo(-halfL, height * 0.12, -halfL, 0);
  const geometry = new THREE.ExtrudeGeometry(roof, {
    depth: width * 0.65,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelSegments: 1
  });
  geometry.rotateX(Math.PI / 2);
  geometry.center();
  return alignToGround(geometry);
};

const useVehicleMeshes = (vehicle: VehicleTemplate, detail: DetailLevel) => {
  return useMemo(() => {
    const { length, width } = vehicle.dimensions;
    const height = vehicle.type === "suv" ? 1.65 : vehicle.type === "hatchback" ? 1.45 : 1.4;
    const body = buildBodyGeometry(length, width, height * 0.55);
    const roof = detail === "high" ? buildRoofGeometry(length, width, height * 0.35) : null;
    const wheelRadius = vehicle.type === "suv" ? 0.33 : 0.3;
    const wheelThickness = 0.18;
    const wheelbase = vehicle.dimensions.wheelbase;

    return {
      body,
      roof,
      height,
      wheelRadius,
      wheelThickness,
      width,
      length,
      wheelbase
    };
  }, [vehicle, detail]);
};

export const VehicleModel3D = ({
  vehicle,
  detailLevel
}: {
  vehicle: VehicleTemplate;
  detailLevel: DetailLevel;
}) => {
  // Parametric Tesla-inspired low-poly form; extra trim disabled in low detail for performance.
  const meshes = useVehicleMeshes(vehicle, detailLevel);
  const wheelX = meshes.wheelbase * 0.5;
  const wheelZ = meshes.wheelRadius;
  const wheelY = Math.min(meshes.width * 0.46, meshes.width / 2 - 0.12);
  const mirrorX = meshes.length * 0.1;
  const mirrorY = meshes.width * 0.52;
  const roofZ = meshes.height * 0.55;

  return (
    <group raycast={() => null}>
      <mesh geometry={meshes.body} position={[0, 0, 0]}>
        <meshStandardMaterial color="#e2e8f0" roughness={0.4} metalness={0.1} />
      </mesh>
      {meshes.roof && (
        <mesh geometry={meshes.roof} position={[-meshes.length * 0.05, 0, roofZ]}>
          <meshStandardMaterial color="#cbd5f5" roughness={0.3} metalness={0.2} />
        </mesh>
      )}
      {detailLevel === "high" && (
        <mesh position={[-meshes.length * 0.05, 0, roofZ + 0.05]}>
          <boxGeometry args={[meshes.length * 0.4, meshes.width * 0.55, meshes.height * 0.12]} />
          <meshStandardMaterial color="#93c5fd" transparent opacity={0.5} />
        </mesh>
      )}
      {[1, -1].map((side) => (
        <mesh key={`wheel-front-${side}`} position={[wheelX, side * wheelY, wheelZ]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[meshes.wheelRadius, meshes.wheelRadius, meshes.wheelThickness, 16]} />
          <meshStandardMaterial color="#111827" roughness={0.8} />
        </mesh>
      ))}
      {[1, -1].map((side) => (
        <mesh key={`wheel-rear-${side}`} position={[-wheelX, side * wheelY, wheelZ]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[meshes.wheelRadius, meshes.wheelRadius, meshes.wheelThickness, 16]} />
          <meshStandardMaterial color="#111827" roughness={0.8} />
        </mesh>
      ))}
      {detailLevel === "high" &&
        [1, -1].map((side) => (
          <mesh key={`mirror-${side}`} position={[mirrorX, side * mirrorY, meshes.height * 0.42]}>
            <boxGeometry args={[0.12, 0.08, 0.06]} />
            <meshStandardMaterial color="#64748b" roughness={0.6} />
          </mesh>
        ))}
      {detailLevel === "high" && (
        <mesh geometry={meshes.body} position={[0, 0, meshes.height * 0.15]}>
          <meshStandardMaterial color="#1f2937" wireframe transparent opacity={0.12} />
        </mesh>
      )}
    </group>
  );
};
