import { useMemo } from "react";
import * as THREE from "three";
import { VehicleTemplate } from "../../models/types";

const useVehicleMeshes = (vehicle: VehicleTemplate) => {
  return useMemo(() => {
    const { length, width } = vehicle.dimensions;
    const height = vehicle.type === "suv" ? 1.6 : vehicle.type === "hatchback" ? 1.4 : 1.35;
    const cabinHeight = height * 0.55;
    const cabinLength = length * 0.45;
    const hoodLength = length * 0.25;
    const rearLength = length * 0.25;

    const body = new THREE.BoxGeometry(length, width, height * 0.45);
    const cabin = new THREE.BoxGeometry(cabinLength, width * 0.8, cabinHeight);
    const hood = new THREE.BoxGeometry(hoodLength, width * 0.75, height * 0.25);
    const rear = new THREE.BoxGeometry(rearLength, width * 0.85, height * 0.35);

    return { body, cabin, hood, rear, height };
  }, [vehicle]);
};

export const VehicleModel3D = ({ vehicle }: { vehicle: VehicleTemplate }) => {
  // Low-poly parametric mesh keeps footprint alignment deterministic without asset loading.
  const meshes = useVehicleMeshes(vehicle);

  return (
    <group raycast={() => null}>
      <mesh geometry={meshes.body} position={[0, 0, meshes.height * 0.2]}>
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      <mesh geometry={meshes.cabin} position={[-0.1, 0, meshes.height * 0.55]}>
        <meshStandardMaterial color="#cbd5f5" />
      </mesh>
      <mesh geometry={meshes.hood} position={[vehicle.dimensions.length * 0.25, 0, meshes.height * 0.18]}>
        <meshStandardMaterial color="#dbe3f2" />
      </mesh>
      <mesh geometry={meshes.rear} position={[-vehicle.dimensions.length * 0.3, 0, meshes.height * 0.22]}>
        <meshStandardMaterial color="#d1d9ea" />
      </mesh>
      <mesh geometry={meshes.body} position={[0, 0, meshes.height * 0.2]}>
        <meshStandardMaterial color="#1f2937" wireframe transparent opacity={0.2} />
      </mesh>
    </group>
  );
};
