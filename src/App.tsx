import { useMemo, useReducer, useState } from "react";
import { SceneView } from "./components/SceneView";
import { exportState, importState } from "./engine/serialization";
import { detectOverlaps } from "./engine/overlap";
import { PresetId, presetSensors } from "./engine/presets";
import { createInitialState, reducer } from "./engine/state";
import { VEHICLES } from "./models/vehicles";
import { Sensor } from "./models/types";

const presetOptions: { id: PresetId; label: string; sublabel: string }[] = [
  { id: "tesla-fsd", label: "Tesla FSD", sublabel: "8 cameras (approx)" },
  { id: "ncap", label: "NCAP", sublabel: "7 cams, 3 radars, 12 ultrasonics" },
  { id: "robotaxi", label: "Robotaxi", sublabel: "7 cams, 3 radars, 12 ultrasonics, 1 lidar" }
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

  const visibleSensors = useMemo(
    () => state.sensors.filter((sensor) => sensor.enabled && state.layers[sensor.type]),
    [state.sensors, state.layers]
  );

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Sensor Configuration Studio</h1>
          <p>Design autonomous-driving sensor layouts with 3D constraints and presets.</p>
        </div>
        <div className="meta">
          <span>Overlaps: {overlaps.length}</span>
          <span>Preset: {state.meta.presetId || "custom"}</span>
        </div>
      </header>
      <div className="layout">
        <aside className="panel left compact">
          <details open>
            <summary>Vehicle</summary>
            <div className="field">
              <label>Template</label>
              <select
                value={state.vehicle.type}
                onChange={(event) => dispatch({ type: "setVehicle", vehicle: VEHICLES[event.target.value] })}
              >
                <option value="sedan">Sedan</option>
                <option value="hatchback">Hatchback</option>
                <option value="suv">SUV</option>
              </select>
            </div>
          </details>
          <details open>
            <summary>Presets</summary>
            <div className="preset-list">
              {presetOptions.map((preset) => (
                <button key={preset.id} onClick={() => handlePreset(preset.id)}>
                  <span>{preset.label}</span>
                  <small>{preset.sublabel}</small>
                </button>
              ))}
            </div>
          </details>
          <details open>
            <summary>Constraints</summary>
            <div className="inline-grid">
              <label className="toggle">
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
                Clamp
              </label>
              <label className="toggle">
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
                Mirror
              </label>
              <label>
                Spacing (m)
                <input
                  type="number"
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
              </label>
            </div>
          </details>
          <details open>
            <summary>Layers</summary>
            <div className="inline-grid">
              {(["camera", "radar", "ultrasonic", "lidar", "overlapHighlight"] as const).map((layer) => (
                <label key={layer} className="toggle">
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
            </div>
          </details>
          <details>
            <summary>Import / Export</summary>
            <textarea
              value={importText}
              onChange={(event) => setImportText(event.target.value)}
              placeholder="Paste JSON here"
              rows={6}
            />
            <div className="button-row">
              <button onClick={handleExport}>Export</button>
              <button onClick={handleImport}>Import</button>
            </div>
            {state.error && <p className="error">{state.error}</p>}
          </details>
        </aside>

        <main className="viewport">
          <SceneView mode="main" vehicle={state.vehicle} sensors={state.sensors} layers={state.layers} />
          <div className="stats" data-testid="visible-sensor-count">
            <span>Cameras: {countsByType.camera}</span>
            <span>Radar: {countsByType.radar}</span>
            <span>Ultrasonic: {countsByType.ultrasonic}</span>
            <span>Lidar: {countsByType.lidar}</span>
            <span>Visible: {visibleSensors.length}</span>
          </div>
        </main>

        <aside className="panel right">
          <div className="aux-views">
            <SceneView mode="top" vehicle={state.vehicle} sensors={state.sensors} layers={state.layers} />
            <SceneView mode="side" vehicle={state.vehicle} sensors={state.sensors} layers={state.layers} />
          </div>
          <div className="panel-section">
            <h3>Inspector</h3>
            {selectedSensor ? (
              <div className="inspector">
                <div className="inspector-header">
                  <span>{selectedSensor.label}</span>
                  <small>{selectedSensor.type}</small>
                </div>
                <label>
                  Sensor
                  <select
                    value={state.selectedSensorId ?? ""}
                    onChange={(event) =>
                      dispatch({ type: "selectSensor", id: event.target.value || null })
                    }
                  >
                    <option value="">None</option>
                    {state.sensors.map((sensor) => (
                      <option key={sensor.id} value={sensor.id}>
                        {sensor.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="inspector-grid">
                  <label>
                    X
                    <input
                      type="number"
                      step={0.05}
                      value={selectedSensor.pose.position.x}
                      onChange={(event) =>
                        handleSensorUpdate({
                          ...selectedSensor,
                          pose: {
                            ...selectedSensor.pose,
                            position: { ...selectedSensor.pose.position, x: Number(event.target.value) }
                          }
                        })
                      }
                    />
                  </label>
                  <label>
                    Y
                    <input
                      type="number"
                      step={0.05}
                      value={selectedSensor.pose.position.y}
                      onChange={(event) =>
                        handleSensorUpdate({
                          ...selectedSensor,
                          pose: {
                            ...selectedSensor.pose,
                            position: { ...selectedSensor.pose.position, y: Number(event.target.value) }
                          }
                        })
                      }
                    />
                  </label>
                  <label>
                    Z
                    <input
                      type="number"
                      step={0.05}
                      value={selectedSensor.pose.position.z}
                      onChange={(event) =>
                        handleSensorUpdate({
                          ...selectedSensor,
                          pose: {
                            ...selectedSensor.pose,
                            position: { ...selectedSensor.pose.position, z: Number(event.target.value) }
                          }
                        })
                      }
                    />
                  </label>
                  <label>
                    Yaw
                    <input
                      type="number"
                      step={1}
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
                  </label>
                  <label>
                    Pitch
                    <input
                      type="number"
                      step={1}
                      value={selectedSensor.pose.orientation.pitchDeg}
                      onChange={(event) =>
                        handleSensorUpdate({
                          ...selectedSensor,
                          pose: {
                            ...selectedSensor.pose,
                            orientation: {
                              ...selectedSensor.pose.orientation,
                              pitchDeg: Number(event.target.value)
                            }
                          }
                        })
                      }
                    />
                  </label>
                  <label>
                    Roll
                    <input
                      type="number"
                      step={1}
                      value={selectedSensor.pose.orientation.rollDeg}
                      onChange={(event) =>
                        handleSensorUpdate({
                          ...selectedSensor,
                          pose: {
                            ...selectedSensor.pose,
                            orientation: {
                              ...selectedSensor.pose.orientation,
                              rollDeg: Number(event.target.value)
                            }
                          }
                        })
                      }
                    />
                  </label>
                  <label>
                    FOV
                    <input
                      type="number"
                      step={1}
                      value={selectedSensor.fov.horizontalDeg}
                      onChange={(event) =>
                        handleSensorUpdate({
                          ...selectedSensor,
                          fov: { ...selectedSensor.fov, horizontalDeg: Number(event.target.value) }
                        })
                      }
                    />
                  </label>
                  <label>
                    Range (m)
                    <input
                      type="number"
                      step={5}
                      value={selectedSensor.rangeM}
                      onChange={(event) =>
                        handleSensorUpdate({ ...selectedSensor, rangeM: Number(event.target.value) })
                      }
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="inspector">
                <label>
                  Sensor
                  <select
                    value={state.selectedSensorId ?? ""}
                    onChange={(event) =>
                      dispatch({ type: "selectSensor", id: event.target.value || null })
                    }
                  >
                    <option value="">None</option>
                    {state.sensors.map((sensor) => (
                      <option key={sensor.id} value={sensor.id}>
                        {sensor.label}
                      </option>
                    ))}
                  </select>
                </label>
                <p>Select a sensor to edit.</p>
              </div>
            )}
          </div>
          <div className="panel-section">
            <h3>Preset Utilities</h3>
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
                const sensors = presetSensors("tesla-fsd", state.vehicle);
                dispatch({ type: "importState", state: { ...exportState(state), sensors } });
              }}
            >
              Reset to Tesla FSD
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
