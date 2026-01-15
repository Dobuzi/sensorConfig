import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Layers, Sensor, VehicleTemplate } from "../models/types";
import { ReferenceGuides } from "./three/ReferenceGuides";
import { SceneObjects } from "./three/SceneObjects";

export type SceneViewMode = "main" | "top" | "side";

type SceneViewProps = {
  mode: SceneViewMode;
  vehicle: VehicleTemplate;
  sensors: Sensor[];
  layers: Layers;
};

const ViewLabel = ({ text }: { text: string }) => <div className="view-label">{text}</div>;

const CameraRig = ({ mode }: { mode: SceneViewMode }) => {
  const isMain = mode === "main";
  return isMain ? <OrbitControls enablePan enableRotate enableZoom /> : null;
};

export const SceneView = ({ mode, vehicle, sensors, layers }: SceneViewProps) => {
  const isMain = mode === "main";
  const cameraProps = isMain
    ? { position: [4.5, -4.2, 3], fov: 45, near: 0.1, far: 200 }
    : mode === "top"
    ? { position: [0, 0, 10], zoom: 60, near: 0.1, far: 200 }
    : { position: [0, 10, 0], zoom: 60, near: 0.1, far: 200 };

  const orthographic = !isMain;

  const label = mode === "main" ? "3D View" : mode === "top" ? "Top View" : "Side View";

  return (
    <div className={`scene-view ${mode}`}>
      <Canvas
        camera={cameraProps}
        orthographic={orthographic}
        shadows
        data-testid={`${mode}-view`}
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
        <SceneObjects vehicle={vehicle} sensors={sensors} layers={layers} />
        <CameraRig mode={mode} />
      </Canvas>
      <ViewLabel text={label} />
    </div>
  );
};
