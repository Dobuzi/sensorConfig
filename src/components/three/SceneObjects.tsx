import { useMemo } from "react";
import * as THREE from "three";
import { Layers, ScenarioState, Sensor, VehicleTemplate } from "../../models/types";
import { detectOverlaps } from "../../engine/overlap";
import { useFrustumGeometry } from "./Frustum";
import { VehicleModel3D } from "./VehicleModel3D";
import { LidarPointCloud } from "./LidarPointCloud";
import { ScenarioOverlays } from "./ScenarioOverlays";
import { SENSOR_TYPE_COLORS } from "../../theme/sensorColors";

const toRad = (deg: number) => (deg * Math.PI) / 180;

const SensorMesh = ({
  sensor,
  onPointerDown,
  showLidarPoints,
  lidarPointCount
}: {
  sensor: Sensor;
  onPointerDown?: (sensor: Sensor) => void;
  showLidarPoints: boolean;
  lidarPointCount: number;
}) => {
  const geometry = useMemo(() => {
    switch (sensor.type) {
      case "camera":
        return new THREE.BoxGeometry(0.12, 0.08, 0.06);
      case "radar":
        return new THREE.CylinderGeometry(0.05, 0.05, 0.06, 12);
      case "ultrasonic":
        return new THREE.SphereGeometry(0.04, 12, 12);
      case "lidar":
        return new THREE.ConeGeometry(0.05, 0.08, 12);
      default:
        return new THREE.BoxGeometry(0.12, 0.08, 0.06);
    }
  }, [sensor.type]);
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color: SENSOR_TYPE_COLORS[sensor.type] }),
    [sensor.type]
  );
  const frustum = useFrustumGeometry(sensor.fov.horizontalDeg, sensor.fov.verticalDeg, sensor.rangeM);
  const frustumMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: SENSOR_TYPE_COLORS[sensor.type],
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
      <mesh
        geometry={geometry}
        material={material}
        onPointerDown={(event) => {
          event.stopPropagation();
          onPointerDown?.(sensor);
        }}
      />
      <mesh geometry={frustum} material={frustumMaterial} />
      <line geometry={lineGeom}>
        <lineBasicMaterial color={SENSOR_TYPE_COLORS[sensor.type]} transparent opacity={0.5} />
      </line>
      {sensor.type === "lidar" && showLidarPoints && (
        <LidarPointCloud
          sensor={sensor}
          pointCount={Math.max(
            500,
            Math.round(
              lidarPointCount * (sensor.specPointRateKpps ? sensor.specPointRateKpps / 200 : 1)
            )
          )}
        />
      )}
    </group>
  );
};

export const SceneObjects = ({
  vehicle,
  sensors,
  layers,
  scenarios,
  onSensorPointerDown,
  showLidarPoints,
  lidarPointCount
}: {
  vehicle: VehicleTemplate;
  sensors: Sensor[];
  layers: Layers;
  scenarios: ScenarioState;
  onSensorPointerDown?: (sensor: Sensor) => void;
  showLidarPoints: boolean;
  lidarPointCount: number;
}) => {
  const overlaps = useMemo(() => detectOverlaps(sensors), [sensors]);

  return (
    <group>
      <VehicleModel3D vehicle={vehicle} />
      {sensors
        .filter((sensor) => sensor.enabled && layers[sensor.type])
        .map((sensor) => (
          <SensorMesh
            key={sensor.id}
            sensor={sensor}
            onPointerDown={onSensorPointerDown}
            showLidarPoints={showLidarPoints}
            lidarPointCount={lidarPointCount}
          />
        ))}
      <ScenarioOverlays scenarios={scenarios} />
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
