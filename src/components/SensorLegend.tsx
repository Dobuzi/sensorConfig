import { Layers, SensorType } from "../models/types";
import { SENSOR_TYPE_COLORS, SENSOR_TYPE_LABELS } from "../theme/sensorColors";

const SENSOR_TYPE_ORDER: SensorType[] = ["camera", "radar", "ultrasonic", "lidar"];

export const SensorLegend = ({
  presentTypes,
  layers,
  onToggle
}: {
  presentTypes: SensorType[];
  layers: Layers;
  onToggle: (type: SensorType, enabled: boolean) => void;
}) => {
  const types = SENSOR_TYPE_ORDER.filter((type) => presentTypes.includes(type));
  return (
    <div className="legend" data-testid="sensor-legend">
      <div className="legend-title">Sensor Legend</div>
      {types.length === 0 ? (
        <div className="legend-empty">No sensors</div>
      ) : (
        types.map((type) => (
          <label key={type} className="legend-item">
            <input
              type="checkbox"
              checked={layers[type]}
              onChange={(event) => onToggle(type, event.target.checked)}
            />
            <span className="legend-swatch" style={{ background: SENSOR_TYPE_COLORS[type] }} />
            <span>{SENSOR_TYPE_LABELS[type]}</span>
          </label>
        ))
      )}
    </div>
  );
};
