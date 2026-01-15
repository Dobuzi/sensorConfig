import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useState } from "react";
import { applySideViewDrag, applyTopViewDrag } from "../engine/viewEditing";
import { CoverageResult } from "../engine/coverage";
import { Layers, ScenarioState, Sensor, VehicleTemplate } from "../models/types";
import { CoverageHeatmap } from "./three/CoverageHeatmap";
import { ReferenceGuides } from "./three/ReferenceGuides";
import { SceneObjects } from "./three/SceneObjects";

export type SceneViewMode = "main" | "top" | "side";

type SceneViewProps = {
  mode: SceneViewMode;
  vehicle: VehicleTemplate;
  sensors: Sensor[];
  layers: Layers;
  scenarios: ScenarioState;
  selectedSensorId: string | null;
  enableEdit: boolean;
  performanceMode: boolean;
  lidarPointCount: number;
  showLidarPoints: boolean;
  coverage?: CoverageResult;
  onSelect: (id: string | null) => void;
  onUpdateSensor: (sensor: Sensor) => void;
};

const ViewLabel = ({ text }: { text: string }) => <div className="view-label">{text}</div>;

const CameraRig = ({ mode }: { mode: SceneViewMode }) => {
  const isMain = mode === "main";
  return isMain ? <OrbitControls enablePan enableRotate enableZoom /> : null;
};

const InvalidateOnChange = ({ deps }: { deps: unknown[] }) => {
  const { invalidate } = useThree();
  useEffect(() => {
    invalidate();
  }, [invalidate, ...deps]);
  return null;
};

export const SceneView = ({
  mode,
  vehicle,
  sensors,
  layers,
  scenarios,
  selectedSensorId,
  enableEdit,
  performanceMode,
  lidarPointCount,
  showLidarPoints,
  coverage,
  onSelect,
  onUpdateSensor
}: SceneViewProps) => {
  const isMain = mode === "main";
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const isEditableView = enableEdit && !isMain;
  const cameraProps = isMain
    ? { position: [4.5, -4.2, 3], fov: 45, near: 0.1, far: 200 }
    : mode === "top"
    ? { position: [0, 0, 10], zoom: 60, near: 0.1, far: 200 }
    : { position: [0, 10, 0], zoom: 60, near: 0.1, far: 200 };

  const orthographic = !isMain;
  const frameloop = !isMain && performanceMode ? "demand" : "always";

  const label = mode === "main" ? "3D View" : mode === "top" ? "Top View" : "Side View";

  const coveragePoints = useMemo(() => {
    if (!coverage?.coveredPoints || !coverage?.points) return [];
    return coverage.coveredPoints.filter((_, index) => index % 3 === 0);
  }, [coverage]);

  const handleSensorPointerDown = (sensor: Sensor) => {
    if (!isEditableView) return;
    setDraggingId(sensor.id);
    onSelect(sensor.id);
  };

  const nearestSensorId = (point: { x: number; y: number; z: number }) => {
    let closest: { id: string; dist: number } | null = null;
    sensors.forEach((sensor) => {
      if (!layers[sensor.type]) return;
      const dx = sensor.pose.position.x - point.x;
      const dy = mode === "top" ? sensor.pose.position.y - point.y : 0;
      const dz = mode === "side" ? sensor.pose.position.z - point.z : 0;
      const dist = Math.hypot(dx, dy, dz);
      if (!closest || dist < closest.dist) {
        closest = { id: sensor.id, dist };
      }
    });
    if (!closest || closest.dist > 0.6) return null;
    return closest.id;
  };

  const handlePlaneMove = (point: { x: number; y: number; z: number }) => {
    if (!draggingId) return;
    const sensor = sensors.find((item) => item.id === draggingId);
    if (!sensor) return;
    const updated =
      mode === "top"
        ? applyTopViewDrag(sensor, { x: point.x, y: point.y })
        : applySideViewDrag(sensor, { x: point.x, z: point.z });
    onUpdateSensor(updated);
  };

  return (
    <div className={`scene-view ${mode}`} data-edit-enabled={isEditableView} data-testid={`${mode}-view`}>
      <Canvas
        camera={cameraProps}
        orthographic={orthographic}
        shadows
        frameloop={frameloop}
        onCreated={({ camera }) => {
          if (mode === "top") {
            camera.up.set(0, 1, 0);
            camera.lookAt(0, 0, 0);
          }
          if (mode === "side") {
            camera.up.set(0, 0, 1);
            camera.lookAt(0, 0, 0);
          }
        }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, -3, 6]} intensity={0.8} />
        {!isMain && <ReferenceGuides plane={mode === "top" ? "xy" : "xz"} />}
        {mode === "top" && coverage && coveragePoints.length > 0 && (
          <CoverageHeatmap points={coveragePoints} />
        )}
        <SceneObjects
          vehicle={vehicle}
          sensors={sensors}
          layers={layers}
          scenarios={scenarios}
          onSensorPointerDown={handleSensorPointerDown}
          showLidarPoints={showLidarPoints}
          lidarPointCount={lidarPointCount}
        />
        {isEditableView && (
          <mesh
            onPointerDown={(event) => {
              event.stopPropagation();
              const candidate = nearestSensorId(event.point);
              if (!candidate) return;
              setDraggingId(candidate);
              onSelect(candidate);
              handlePlaneMove(event.point);
            }}
            onPointerMove={(event) => {
              event.stopPropagation();
              handlePlaneMove(event.point);
            }}
            onPointerUp={() => setDraggingId(null)}
            onPointerLeave={() => setDraggingId(null)}
            rotation={mode === "side" ? [Math.PI / 2, 0, 0] : [0, 0, 0]}
          >
            <planeGeometry args={[120, 120]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        )}
        <CameraRig mode={mode} />
        {frameloop === "demand" && (
          <InvalidateOnChange deps={[sensors, layers, scenarios, coveragePoints, showLidarPoints, lidarPointCount]} />
        )}
      </Canvas>
      <ViewLabel text={label} />
    </div>
  );
};
