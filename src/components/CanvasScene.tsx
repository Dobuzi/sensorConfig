import { useEffect, useMemo, useRef, useState } from "react";
import { Layers, Sensor, VehicleTemplate } from "../models/types";
import { detectOverlaps } from "../engine/overlap";
import { degToRad } from "../utils/geometry";

const SENSOR_COLORS: Record<string, string> = {
  camera: "#1f77b4",
  radar: "#ff7f0e",
  ultrasonic: "#2ca02c",
  lidar: "#d62728"
};

type CanvasSceneProps = {
  vehicle: VehicleTemplate;
  sensors: Sensor[];
  layers: Layers;
  selectedSensorId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateSensor: (sensor: Sensor) => void;
};

export const CanvasScene = ({
  vehicle,
  sensors,
  layers,
  selectedSensorId,
  onSelect,
  onUpdateSensor
}: CanvasSceneProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(80);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const overlaps = useMemo(() => detectOverlaps(sensors), [sensors]);

  const visibleSensors = sensors.filter((sensor) => layers[sensor.type] && sensor.enabled);
  const visibleFovCount = visibleSensors.length;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2 + pan.x, height / 2 + pan.y);
    ctx.scale(zoom, -zoom);

    ctx.lineWidth = 1 / zoom;
    ctx.strokeStyle = "#1f2933";
    ctx.fillStyle = "#e2e8f0";
    ctx.beginPath();
    vehicle.footprintPolygon.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    visibleSensors.forEach((sensor) => {
      const { x, y } = sensor.pose.position;
      const yaw = degToRad(sensor.pose.orientation.yawDeg);
      const range = sensor.rangeM;
      const half = degToRad(sensor.fov.horizontalDeg / 2);
      const color = SENSOR_COLORS[sensor.type];

      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 0.05, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 0.15;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + range * Math.cos(yaw + half), y + range * Math.sin(yaw + half));
      ctx.lineTo(x + range * Math.cos(yaw - half), y + range * Math.sin(yaw - half));
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + range * Math.cos(yaw), y + range * Math.sin(yaw));
      ctx.stroke();

      if (sensor.id === selectedSensorId) {
        ctx.strokeStyle = "#111827";
        ctx.beginPath();
        ctx.arc(x, y, 0.08, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    if (layers.overlapHighlight) {
      ctx.fillStyle = "rgba(255,0,0,0.18)";
      overlaps.forEach((overlap) => {
        const [aId, bId] = overlap.pair;
        const a = sensors.find((sensor) => sensor.id === aId);
        const b = sensors.find((sensor) => sensor.id === bId);
        if (!a || !b) return;
        const ax = a.pose.position.x;
        const ay = a.pose.position.y;
        const bx = b.pose.position.x;
        const by = b.pose.position.y;
        ctx.beginPath();
        ctx.arc((ax + bx) / 2, (ay + by) / 2, 0.2, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    ctx.restore();
  }, [vehicle, sensors, layers, selectedSensorId, pan, zoom, overlaps, visibleSensors]);

  const toWorld = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left - rect.width / 2 - pan.x) / zoom;
    const y = -(clientY - rect.top - rect.height / 2 - pan.y) / zoom;
    return { x, y };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const point = toWorld(event.clientX, event.clientY);
    const hit = visibleSensors.find(
      (sensor) => Math.hypot(sensor.pose.position.x - point.x, sensor.pose.position.y - point.y) < 0.1
    );
    if (hit) {
      setDraggingId(hit.id);
      onSelect(hit.id);
      return;
    }
    onSelect(null);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!draggingId) return;
    const point = toWorld(event.clientX, event.clientY);
    const sensor = sensors.find((item) => item.id === draggingId);
    if (!sensor) return;
    onUpdateSensor({
      ...sensor,
      pose: { ...sensor.pose, position: { ...sensor.pose.position, x: point.x, y: point.y } }
    });
  };

  const handlePointerUp = () => {
    setDraggingId(null);
  };

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    if (event.shiftKey) {
      setPan((prev) => ({ x: prev.x - event.deltaX * 0.2, y: prev.y - event.deltaY * 0.2 }));
    } else {
      setZoom((prev) => Math.max(40, Math.min(140, prev - event.deltaY * 0.05)));
    }
  };

  return (
    <div className="canvas-wrapper">
      <canvas
        ref={canvasRef}
        width={900}
        height={520}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
        data-testid="scene-canvas"
      />
      <div className="canvas-meta" data-testid="visible-fov-count">
        {visibleFovCount}
      </div>
    </div>
  );
};
