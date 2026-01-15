import { useMemo } from "react";
import * as THREE from "three";
import { Layers, Sensor, VehicleTemplate } from "../../models/types";
import { detectOverlaps } from "../../engine/overlap";
import { useFrustumGeometry } from "./Frustum";

const SENSOR_COLORS: Record<string, string> = {
  camera: "#38bdf8",
  radar: "#fb923c",
  ultrasonic: "#4ade80",
  lidar: "#f87171"
};

const toRad = (deg: number) => (deg * Math.PI) / 180;

const useVehicleGeometry = (vehicle: VehicleTemplate) => {
  return useMemo(() => {
    const shape = new THREE.Shape();
    vehicle.footprintPolygon.forEach((point, index) => {
      if (index === 0) shape.moveTo(point.x, point.y);
      else shape.lineTo(point.x, point.y);
    });
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, { depth: 0.4, bevelEnabled: false });
  }, [vehicle]);
};

const SensorMesh = ({ sensor }: { sensor: Sensor }) => {
  const geometry = useMemo(() => new THREE.BoxGeometry(0.12, 0.08, 0.06), []);
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color: SENSOR_COLORS[sensor.type] }),
    [sensor.type]
  );
  const frustum = useFrustumGeometry(sensor.fov.horizontalDeg, sensor.fov.verticalDeg, sensor.rangeM);
  const frustumMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: SENSOR_COLORS[sensor.type],
      transparent: true,
      opacity: 0.15
    }),
    [sensor.type]
  );
  const lineGeom = useMemo(() => {
    const vertices = new Float32Array([0, 0, 0, sensor.rangeM, 0, 0]);
    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    return buffer;
  }, [sensor.rangeM]);

  return (
    <group
      position={[sensor.pose.position.x, sensor.pose.position.y, sensor.pose.position.z]}
      rotation={new THREE.Euler(
        toRad(sensor.pose.orientation.rollDeg),
        toRad(sensor.pose.orientation.pitchDeg),
        toRad(sensor.pose.orientation.yawDeg),
        "ZYX"
      )}
    >
      <mesh geometry={geometry} material={material} />
      <mesh geometry={frustum} material={frustumMaterial} />
      <line geometry={lineGeom}>
        <lineBasicMaterial color={SENSOR_COLORS[sensor.type]} transparent opacity={0.5} />
      </line>
    </group>
  );
};

export const SceneObjects = ({
  vehicle,
  sensors,
  layers
}: {
  vehicle: VehicleTemplate;
  sensors: Sensor[];
  layers: Layers;
}) => {
  const vehicleGeometry = useVehicleGeometry(vehicle);
  const overlaps = useMemo(() => detectOverlaps(sensors), [sensors]);

  return (
    <group>
      <mesh geometry={vehicleGeometry} position={[0, 0, 0]}>
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      <mesh geometry={vehicleGeometry} position={[0, 0, 0]}>
        <meshStandardMaterial color="#1f2937" wireframe transparent opacity={0.3} />
      </mesh>
      {sensors
        .filter((sensor) => sensor.enabled && layers[sensor.type])
        .map((sensor) => (
          <SensorMesh key={sensor.id} sensor={sensor} />
        ))}
      {layers.overlapHighlight &&
        overlaps.map((overlap) => {
          const [aId, bId] = overlap.pair;
          const a = sensors.find((sensor) => sensor.id === aId);
          const b = sensors.find((sensor) => sensor.id === bId);
          if (!a || !b) return null;
          const x = (a.pose.position.x + b.pose.position.x) / 2;
          const y = (a.pose.position.y + b.pose.position.y) / 2;
          const z = (a.pose.position.z + b.pose.position.z) / 2;
          return (
            <mesh key={`${aId}-${bId}`} position={[x, y, z]}>
              <sphereGeometry args={[0.15, 12, 12]} />
              <meshStandardMaterial color="#ef4444" transparent opacity={0.4} />
            </mesh>
          );
        })}
    </group>
  );
};
