import { useMemo, useReducer, useState } from "react";
import { SceneView } from "./components/SceneView";
import { computeCoverage, scenarioCovered } from "./engine/coverage";
import { scenarioMarkers } from "./engine/scenarios";
import { exportState, importState } from "./engine/serialization";
import { detectOverlaps } from "./engine/overlap";
import { PresetId, presetSensors, presetVendors } from "./engine/presets";
import { createInitialState, reducer } from "./engine/state";
import { VEHICLES } from "./models/vehicles";
import { Sensor } from "./models/types";
import { vendorOptions } from "./specs/sensorVendors";

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
  const effectiveLidarPoints = state.settings.performanceMode
    ? Math.min(state.settings.lidarPointCount, 2000)
    : state.settings.lidarPointCount;
  const effectiveCoverageSamples = state.settings.performanceMode
    ? Math.min(state.settings.coverageSampleCount, 800)
    : state.settings.coverageSampleCount;
  const coverage = useMemo(
    () => computeCoverage(state.sensors, state.layers, effectiveCoverageSamples),
    [state.sensors, state.layers, effectiveCoverageSamples]
  );
  const markers = useMemo(() => scenarioMarkers(state.scenarios), [state.scenarios]);
  const pedestrianCovered = state.scenarios.pedestrian.enabled
    ? scenarioCovered(state.sensors, state.layers, markers.pedestrian)
    : false;
  const intersectionCovered = state.scenarios.intersection.enabled
    ? scenarioCovered(state.sensors, state.layers, markers.intersection)
    : false;

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
  const cameraVendors = useMemo(() => vendorOptions("camera"), []);
  const radarVendors = useMemo(() => vendorOptions("radar"), []);
  const ultrasonicVendors = useMemo(() => vendorOptions("ultrasonic"), []);
  const lidarVendors = useMemo(() => vendorOptions("lidar"), []);

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
          <details open>
            <summary>Sensor Vendors</summary>
            <div className="vendor-grid">
              <label>
                Camera Vendor
                <select
                  value={state.vendors.camera}
                  onChange={(event) =>
                    dispatch({ type: "setVendors", vendors: { ...state.vendors, camera: event.target.value } })
                  }
                >
                  {cameraVendors.map((vendor) => (
                    <option key={vendor.vendorId} value={vendor.vendorId}>
                      {vendor.vendorName}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Radar Vendor
                <select
                  value={state.vendors.radar}
                  onChange={(event) =>
                    dispatch({ type: "setVendors", vendors: { ...state.vendors, radar: event.target.value } })
                  }
                >
                  {radarVendors.map((vendor) => (
                    <option key={vendor.vendorId} value={vendor.vendorId}>
                      {vendor.vendorName}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Ultrasonic Vendor
                <select
                  value={state.vendors.ultrasonic}
                  onChange={(event) =>
                    dispatch({
                      type: "setVendors",
                      vendors: { ...state.vendors, ultrasonic: event.target.value }
                    })
                  }
                >
                  {ultrasonicVendors.map((vendor) => (
                    <option key={vendor.vendorId} value={vendor.vendorId}>
                      {vendor.vendorName}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                LiDAR Vendor
                <select
                  value={state.vendors.lidar}
                  onChange={(event) =>
                    dispatch({ type: "setVendors", vendors: { ...state.vendors, lidar: event.target.value } })
                  }
                >
                  {lidarVendors.map((vendor) => (
                    <option key={vendor.vendorId} value={vendor.vendorId}>
                      {vendor.vendorName}
                    </option>
                  ))}
                </select>
              </label>
              <a
                className="vendor-link"
                href="https://github.com/Dobuzi/sensorConfig/blob/main/docs/sensor_specs_sources.md"
                target="_blank"
                rel="noreferrer"
              >
                Spec Sources
              </a>
            </div>
          </details>
          <details open>
            <summary>Editing</summary>
            <div className="inline-grid">
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={state.settings.enableViewEditing}
                  onChange={(event) =>
                    dispatch({
                      type: "setSettings",
                      settings: { ...state.settings, enableViewEditing: event.target.checked }
                    })
                  }
                />
                Edit Top/Side
              </label>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={state.settings.showCoverageHeatmap}
                  onChange={(event) =>
                    dispatch({
                      type: "setSettings",
                      settings: { ...state.settings, showCoverageHeatmap: event.target.checked }
                    })
                  }
                />
                Coverage Heatmap
              </label>
            </div>
          </details>
          <details open>
            <summary>Scenarios</summary>
            <div className="scenario-grid">
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={state.scenarios.pedestrian.enabled}
                  onChange={(event) =>
                    dispatch({
                      type: "setScenarios",
                      scenarios: {
                        ...state.scenarios,
                        pedestrian: { ...state.scenarios.pedestrian, enabled: event.target.checked }
                      }
                    })
                  }
                />
                Pedestrian Crossing
              </label>
              <label>
                Crossing X (m)
                <input
                  type="number"
                  step={1}
                  value={state.scenarios.pedestrian.crossingDistanceM}
                  onChange={(event) =>
                    dispatch({
                      type: "setScenarios",
                      scenarios: {
                        ...state.scenarios,
                        pedestrian: {
                          ...state.scenarios.pedestrian,
                          crossingDistanceM: Number(event.target.value)
                        }
                      }
                    })
                  }
                />
              </label>
              <label>
                Ped Speed (m/s)
                <input
                  type="number"
                  step={0.1}
                  value={state.scenarios.pedestrian.speedMps}
                  onChange={(event) =>
                    dispatch({
                      type: "setScenarios",
                      scenarios: {
                        ...state.scenarios,
                        pedestrian: {
                          ...state.scenarios.pedestrian,
                          speedMps: Number(event.target.value)
                        }
                      }
                    })
                  }
                />
              </label>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={state.scenarios.intersection.enabled}
                  onChange={(event) =>
                    dispatch({
                      type: "setScenarios",
                      scenarios: {
                        ...state.scenarios,
                        intersection: { ...state.scenarios.intersection, enabled: event.target.checked }
                      }
                    })
                  }
                />
                Intersection
              </label>
              <label>
                Intersection X (m)
                <input
                  type="number"
                  step={1}
                  value={state.scenarios.intersection.centerDistanceM}
                  onChange={(event) =>
                    dispatch({
                      type: "setScenarios",
                      scenarios: {
                        ...state.scenarios,
                        intersection: {
                          ...state.scenarios.intersection,
                          centerDistanceM: Number(event.target.value)
                        }
                      }
                    })
                  }
                />
              </label>
              <label>
                Cross Speed (m/s)
                <input
                  type="number"
                  step={0.5}
                  value={state.scenarios.intersection.speedMps}
                  onChange={(event) =>
                    dispatch({
                      type: "setScenarios",
                      scenarios: {
                        ...state.scenarios,
                        intersection: {
                          ...state.scenarios.intersection,
                          speedMps: Number(event.target.value)
                        }
                      }
                    })
                  }
                />
              </label>
            </div>
          </details>
          <details open>
            <summary>Performance</summary>
            <div className="inline-grid">
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={state.settings.performanceMode}
                  onChange={(event) =>
                    dispatch({
                      type: "setSettings",
                      settings: { ...state.settings, performanceMode: event.target.checked }
                    })
                  }
                />
                Performance Mode
              </label>
              <label>
                LiDAR Points
                <input
                  type="number"
                  min={1000}
                  max={20000}
                  step={500}
                  value={state.settings.lidarPointCount}
                  onChange={(event) =>
                    dispatch({
                      type: "setSettings",
                      settings: { ...state.settings, lidarPointCount: Number(event.target.value) }
                    })
                  }
                />
              </label>
              <label>
                Coverage Samples
                <input
                  type="number"
                  min={500}
                  max={5000}
                  step={250}
                  value={state.settings.coverageSampleCount}
                  onChange={(event) =>
                    dispatch({
                      type: "setSettings",
                      settings: { ...state.settings, coverageSampleCount: Number(event.target.value) }
                    })
                  }
                />
              </label>
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
          <SceneView
            mode="main"
            vehicle={state.vehicle}
            sensors={state.sensors}
            layers={state.layers}
            scenarios={state.scenarios}
            selectedSensorId={state.selectedSensorId}
            enableEdit={false}
            performanceMode={state.settings.performanceMode}
            lidarPointCount={effectiveLidarPoints}
            showLidarPoints={state.layers.lidar}
            onSelect={(id) => dispatch({ type: "selectSensor", id })}
            onUpdateSensor={handleSensorUpdate}
          />
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
            <SceneView
              mode="top"
              vehicle={state.vehicle}
              sensors={state.sensors}
              layers={state.layers}
              scenarios={state.scenarios}
              selectedSensorId={state.selectedSensorId}
              enableEdit={state.settings.enableViewEditing}
              performanceMode={state.settings.performanceMode}
              lidarPointCount={effectiveLidarPoints}
              showLidarPoints={state.layers.lidar}
              coverage={state.settings.showCoverageHeatmap ? coverage : undefined}
              onSelect={(id) => dispatch({ type: "selectSensor", id })}
              onUpdateSensor={handleSensorUpdate}
            />
            <SceneView
              mode="side"
              vehicle={state.vehicle}
              sensors={state.sensors}
              layers={state.layers}
              scenarios={state.scenarios}
              selectedSensorId={state.selectedSensorId}
              enableEdit={state.settings.enableViewEditing}
              performanceMode={state.settings.performanceMode}
              lidarPointCount={effectiveLidarPoints}
              showLidarPoints={state.layers.lidar}
              onSelect={(id) => dispatch({ type: "selectSensor", id })}
              onUpdateSensor={handleSensorUpdate}
            />
          </div>
          <div className="panel-section">
            <h3>Coverage Metrics</h3>
            <div className="metrics-grid">
              <span>Camera</span>
              <span>{coverage.total ? ((coverage.byType.camera / coverage.total) * 100).toFixed(1) : "0.0"}%</span>
              <span>Radar</span>
              <span>{coverage.total ? ((coverage.byType.radar / coverage.total) * 100).toFixed(1) : "0.0"}%</span>
              <span>Combined</span>
              <span>{coverage.total ? ((coverage.covered / coverage.total) * 100).toFixed(1) : "0.0"}%</span>
            </div>
          </div>
          <div className="panel-section">
            <h3>Scenario Coverage</h3>
            <div className="metrics-grid">
              <span>Pedestrian</span>
              <span>
                {state.scenarios.pedestrian.enabled ? (pedestrianCovered ? "Covered" : "Not covered") : "Disabled"}
              </span>
              <span>Intersection</span>
              <span>
                {state.scenarios.intersection.enabled ? (intersectionCovered ? "Covered" : "Not covered") : "Disabled"}
              </span>
            </div>
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
                const vendors = presetVendors("tesla-fsd");
                dispatch({
                  type: "importState",
                  state: { ...exportState(state), sensors, vendors }
                });
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
