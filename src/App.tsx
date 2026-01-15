import { useMemo, useReducer, useState } from "react";
import { CanvasScene } from "./components/CanvasScene";
import { exportState, importState } from "./engine/serialization";
import { detectOverlaps } from "./engine/overlap";
import { presetSensors, PresetId } from "./engine/presets";
import { createInitialState, reducer } from "./engine/state";
import { VEHICLES } from "./models/vehicles";
import { Sensor } from "./models/types";

const presetOptions: { id: PresetId; label: string }[] = [
  { id: "fsd-camera", label: "FSD-like (camera-only)" },
  { id: "adas-ncap", label: "ADAS/NCAP-oriented" },
  { id: "robotaxi", label: "Robotaxi/AV-oriented" },
  { id: "tesla-hw4", label: "Tesla FSD HW4 (approx)" }
];

export const App = () => {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const [importText, setImportText] = useState("");

  const selectedSensor = state.sensors.find((sensor) => sensor.id === state.selectedSensorId) || null;
  const overlaps = useMemo(() => detectOverlaps(state.sensors), [state.sensors]);

  const handlePreset = (presetId: PresetId) => {
    dispatch({ type: "applyPreset", preset: presetId });
  };

  const handleExport = () => {
    const data = exportState(state);
    setImportText(JSON.stringify(data, null, 2));
  };

  const handleImport = () => {
    const result = importState(importText);
    if (!result.ok) {
      dispatch({ type: "setError", error: result.error });
      return;
    }
    dispatch({ type: "importState", state: result.data });
  };

  const handleSensorUpdate = (sensor: Sensor) => {
    dispatch({ type: "updateSensor", sensor });
  };

  const countsByType = useMemo(() => {
    const counts = { camera: 0, radar: 0, ultrasonic: 0, lidar: 0 };
    state.sensors.forEach((sensor) => {
      counts[sensor.type] += 1;
    });
    return counts;
  }, [state.sensors]);

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Sensor Configuration Studio</h1>
          <p>Design autonomous-driving sensor layouts with constraints and presets.</p>
        </div>
        <div className="meta">
          <span>Overlaps: {overlaps.length}</span>
          <span>Preset: {state.meta.presetId || "custom"}</span>
        </div>
      </header>
      <div className="content">
        <aside className="panel left">
          <section>
            <h2>Vehicle Template</h2>
            <select
              value={state.vehicle.type}
              onChange={(event) => dispatch({ type: "setVehicle", vehicle: VEHICLES[event.target.value] })}
            >
              <option value="sedan">Sedan</option>
              <option value="hatchback">Hatchback</option>
              <option value="suv">SUV</option>
            </select>
          </section>
          <section>
            <h2>Presets</h2>
            <div className="preset-list">
              {presetOptions.map((preset) => (
                <button key={preset.id} onClick={() => handlePreset(preset.id)}>
                  {preset.label}
                </button>
              ))}
            </div>
          </section>
          <section>
            <h2>Constraints</h2>
            <label>
              <input
                type="checkbox"
                checked={state.constraints.boundaryClamp}
                onChange={(event) =>
                  dispatch({
                    type: "setConstraints",
                    constraints: { ...state.constraints, boundaryClamp: event.target.checked }
                  })
                }
              />
              Boundary clamp
            </label>
            <label>
              Min spacing (m)
              <input
                type="range"
                min={0.1}
                max={0.2}
                step={0.01}
                value={state.constraints.minSpacingM}
                onChange={(event) =>
                  dispatch({
                    type: "setConstraints",
                    constraints: { ...state.constraints, minSpacingM: Number(event.target.value) }
                  })
                }
              />
              <span>{state.constraints.minSpacingM.toFixed(2)}</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={state.constraints.mirrorPlacement}
                onChange={(event) =>
                  dispatch({
                    type: "setConstraints",
                    constraints: { ...state.constraints, mirrorPlacement: event.target.checked }
                  })
                }
              />
              Mirror placement
            </label>
          </section>
          <section>
            <h2>Layers</h2>
            {(["camera", "radar", "ultrasonic", "lidar", "overlapHighlight"] as const).map((layer) => (
              <label key={layer}>
                <input
                  type="checkbox"
                  checked={state.layers[layer]}
                  onChange={(event) =>
                    dispatch({ type: "setLayers", layers: { ...state.layers, [layer]: event.target.checked } })
                  }
                />
                {layer}
              </label>
            ))}
          </section>
          <section>
            <h2>Import / Export</h2>
            <textarea
              value={importText}
              onChange={(event) => setImportText(event.target.value)}
              placeholder="Paste JSON here"
              rows={8}
            />
            <div className="button-row">
              <button onClick={handleExport}>Export</button>
              <button onClick={handleImport}>Import</button>
            </div>
            {state.error && <p className="error">{state.error}</p>}
          </section>
        </aside>

        <main className="canvas-panel">
          <CanvasScene
            vehicle={state.vehicle}
            sensors={state.sensors}
            layers={state.layers}
            selectedSensorId={state.selectedSensorId}
            onSelect={(id) => dispatch({ type: "selectSensor", id })}
            onUpdateSensor={handleSensorUpdate}
          />
          <div className="stats">
            <span>Cameras: {countsByType.camera}</span>
            <span>Radar: {countsByType.radar}</span>
            <span>Ultrasonic: {countsByType.ultrasonic}</span>
            <span>Lidar: {countsByType.lidar}</span>
          </div>
        </main>

        <aside className="panel right">
          <section>
            <h2>Inspector</h2>
            {selectedSensor ? (
              <div className="inspector">
                <p>{selectedSensor.label}</p>
                <label>
                  X
                  <input
                    type="number"
                    value={selectedSensor.pose.position.x}
                    step={0.05}
                    onChange={(event) =>
                      handleSensorUpdate({
                        ...selectedSensor,
                        pose: {
                          ...selectedSensor.pose,
                          position: {
                            ...selectedSensor.pose.position,
                            x: Number(event.target.value)
                          }
                        }
                      })
                    }
                  />
                </label>
                <label>
                  Y
                  <input
                    type="number"
                    value={selectedSensor.pose.position.y}
                    step={0.05}
                    onChange={(event) =>
                      handleSensorUpdate({
                        ...selectedSensor,
                        pose: {
                          ...selectedSensor.pose,
                          position: {
                            ...selectedSensor.pose.position,
                            y: Number(event.target.value)
                          }
                        }
                      })
                    }
                  />
                </label>
                <label>
                  Yaw
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    value={selectedSensor.pose.orientation.yawDeg}
                    onChange={(event) =>
                      handleSensorUpdate({
                        ...selectedSensor,
                        pose: {
                          ...selectedSensor.pose,
                          orientation: {
                            ...selectedSensor.pose.orientation,
                            yawDeg: Number(event.target.value)
                          }
                        }
                      })
                    }
                  />
                  <span>{selectedSensor.pose.orientation.yawDeg.toFixed(0)} deg</span>
                </label>
                <label>
                  FOV
                  <input
                    type="range"
                    min={20}
                    max={180}
                    value={selectedSensor.fov.horizontalDeg}
                    onChange={(event) =>
                      handleSensorUpdate({
                        ...selectedSensor,
                        fov: { ...selectedSensor.fov, horizontalDeg: Number(event.target.value) }
                      })
                    }
                  />
                  <span>{selectedSensor.fov.horizontalDeg.toFixed(0)} deg</span>
                </label>
                <label>
                  Range (m)
                  <input
                    type="number"
                    value={selectedSensor.rangeM}
                    step={5}
                    onChange={(event) =>
                      handleSensorUpdate({ ...selectedSensor, rangeM: Number(event.target.value) })
                    }
                  />
                </label>
              </div>
            ) : (
              <p>Select a sensor to edit.</p>
            )}
          </section>
          <section>
            <h2>Recommendation Summary</h2>
            <p>
              Sensors follow deterministic anchors derived from vehicle length/width. Apply presets to refresh the
              baseline layout.
            </p>
            <button
              disabled={!state.meta.presetId}
              onClick={() => {
                if (!state.meta.presetId) return;
                dispatch({ type: "applyPreset", preset: state.meta.presetId as PresetId });
              }}
            >
              Re-apply current preset
            </button>
            <button
              onClick={() => {
                const sensors = presetSensors("fsd-camera", state.vehicle);
                dispatch({ type: "importState", state: { ...exportState(state), sensors } });
              }}
            >
              Reset to FSD-like
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
};
