import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { SceneView, SceneViewMode } from "./components/SceneView";
import { SensorLegend } from "./components/SensorLegend";
import { computeCoverage, scenarioCovered } from "./engine/coverage";
import { scenarioMarkers } from "./engine/scenarios";
import { exportState, importState } from "./engine/serialization";
import { detectOverlaps } from "./engine/overlap";
import { PresetId, presetSensors, presetVendors } from "./engine/presets";
import { createInitialState, reducer } from "./engine/state";
import { VEHICLES } from "./models/vehicles";
import { Sensor, SensorType } from "./models/types";
import { vendorOptions } from "./specs/sensorVendors";
import { useResponsiveLayout } from "./hooks/useResponsiveLayout";

const presetOptions: { id: PresetId; label: string; sublabel: string }[] = [
  { id: "tesla-fsd", label: "Tesla FSD", sublabel: "8 cameras (approx)" },
  { id: "ncap", label: "NCAP", sublabel: "7 cams, 3 radars, 12 ultrasonics" },
  { id: "robotaxi", label: "Robotaxi", sublabel: "7 cams, 3 radars, 12 ultrasonics, 1 lidar" }
];

export const App = () => {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const [importText, setImportText] = useState("");
  const [inspectorTab, setInspectorTab] = useState<"pose" | "fov" | "advanced">("pose");
  const [resetViewToken, setResetViewToken] = useState(0);
  const [activeView, setActiveView] = useState<SceneViewMode>("main");
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const autoTunedRef = useRef(false);
  const { layout, isTouch } = useResponsiveLayout();

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

  const presentTypes = useMemo(() => {
    const types: SensorType[] = [];
    (["camera", "radar", "ultrasonic", "lidar"] as const).forEach((type) => {
      if (countsByType[type] > 0) {
        types.push(type);
      }
    });
    return types;
  }, [countsByType]);

  const visibleSensors = useMemo(
    () => state.sensors.filter((sensor) => sensor.enabled && state.layers[sensor.type]),
    [state.sensors, state.layers]
  );
  const cameraVendors = useMemo(() => vendorOptions("camera"), []);
  const radarVendors = useMemo(() => vendorOptions("radar"), []);
  const ultrasonicVendors = useMemo(() => vendorOptions("ultrasonic"), []);
  const lidarVendors = useMemo(() => vendorOptions("lidar"), []);

  useEffect(() => {
    if (layout === "desktop") {
      setSidebarOpen(true);
    }
    if (layout === "tablet") {
      setSidebarOpen(false);
    }
    if (layout === "phone") {
      setBottomSheetOpen(false);
      setActiveView("main");
    }
  }, [layout]);

  useEffect(() => {
    if (layout !== "phone" || autoTunedRef.current) return;
    autoTunedRef.current = true;
    dispatch({
      type: "setSettings",
      settings: {
        ...state.settings,
        performanceMode: true,
        lidarPointCount: Math.min(state.settings.lidarPointCount, 1500),
        coverageSampleCount: Math.min(state.settings.coverageSampleCount, 600),
        vehicleDetail: "low",
        compactMode: true
      }
    });
  }, [layout, state.settings]);

  const isCompact = state.settings.compactMode;
  const isPhone = layout === "phone";
  const isTablet = layout === "tablet";
  const isDesktop = layout === "desktop";
  const appClass = `app ${isCompact ? "compact" : ""} ${isTouch ? "touch" : ""}`;

  const sceneOverlay = (mode: SceneViewMode) => (
    <div className="scene-overlay">
      {mode === "main" && (
        <button
          type="button"
          className="ghost"
          onClick={() => setResetViewToken((value) => value + 1)}
        >
          Reset View
        </button>
      )}
      <SensorLegend
        presentTypes={presentTypes}
        layers={state.layers}
        onToggle={(type, enabled) =>
          dispatch({ type: "setLayers", layers: { ...state.layers, [type]: enabled } })
        }
      />
    </div>
  );

  const metricsContent = (
    <div className="metrics-grid">
      <span>Camera</span>
      <span>{coverage.total ? ((coverage.byType.camera / coverage.total) * 100).toFixed(1) : "0.0"}%</span>
      <span>Radar</span>
      <span>{coverage.total ? ((coverage.byType.radar / coverage.total) * 100).toFixed(1) : "0.0"}%</span>
      <span>Combined</span>
      <span>{coverage.total ? ((coverage.covered / coverage.total) * 100).toFixed(1) : "0.0"}%</span>
    </div>
  );

  const scenarioContent = (
    <div className="metrics-grid">
      <span>Pedestrian</span>
      <span>{state.scenarios.pedestrian.enabled ? (pedestrianCovered ? "Covered" : "Not covered") : "Disabled"}</span>
      <span>Intersection</span>
      <span>
        {state.scenarios.intersection.enabled ? (intersectionCovered ? "Covered" : "Not covered") : "Disabled"}
      </span>
    </div>
  );

  const inspectorContent = selectedSensor ? (
    <div className="inspector">
      <div className="inspector-header">
        <span>{selectedSensor.label}</span>
        <small>{selectedSensor.type}</small>
      </div>
      <label>
        Sensor
        <select
          value={state.selectedSensorId ?? ""}
          onChange={(event) => dispatch({ type: "selectSensor", id: event.target.value || null })}
        >
          <option value="">None</option>
          {state.sensors.map((sensor) => (
            <option key={sensor.id} value={sensor.id}>
              {sensor.label}
            </option>
          ))}
        </select>
      </label>
      <div className="inspector-tabs">
        {(["pose", "fov", "advanced"] as const).map((tab) => (
          <button
            key={tab}
            className={inspectorTab === tab ? "active" : ""}
            onClick={() => setInspectorTab(tab)}
            type="button"
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>
      {inspectorTab === "pose" && (
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
                  pose: { ...selectedSensor.pose, position: { ...selectedSensor.pose.position, x: Number(event.target.value) } }
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
                  pose: { ...selectedSensor.pose, position: { ...selectedSensor.pose.position, y: Number(event.target.value) } }
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
                  pose: { ...selectedSensor.pose, position: { ...selectedSensor.pose.position, z: Number(event.target.value) } }
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
                    orientation: { ...selectedSensor.pose.orientation, yawDeg: Number(event.target.value) }
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
                    orientation: { ...selectedSensor.pose.orientation, pitchDeg: Number(event.target.value) }
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
                    orientation: { ...selectedSensor.pose.orientation, rollDeg: Number(event.target.value) }
                  }
                })
              }
            />
          </label>
        </div>
      )}
      {inspectorTab === "fov" && (
        <div className="inspector-grid">
          <label>
            HFOV
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
            VFOV
            <input
              type="number"
              step={1}
              value={selectedSensor.fov.verticalDeg ?? ""}
              onChange={(event) =>
                handleSensorUpdate({
                  ...selectedSensor,
                  fov: {
                    ...selectedSensor.fov,
                    verticalDeg: event.target.value === "" ? null : Number(event.target.value)
                  }
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
              onChange={(event) => handleSensorUpdate({ ...selectedSensor, rangeM: Number(event.target.value) })}
            />
          </label>
        </div>
      )}
      {inspectorTab === "advanced" && (
        <div className="inspector-advanced">
          <div>
            <span>Spec Category</span>
            <strong>{selectedSensor.specCategory}</strong>
          </div>
          <div>
            <span>Mirror Group</span>
            <strong>{selectedSensor.mirrorGroup ?? "None"}</strong>
          </div>
          <div>
            <span>Vendor Profile</span>
            <strong>{state.vendors[selectedSensor.type]}</strong>
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className="inspector">
      <label>
        Sensor
        <select
          value={state.selectedSensorId ?? ""}
          onChange={(event) => dispatch({ type: "selectSensor", id: event.target.value || null })}
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
  );

  const presetUtilitiesContent = (
    <>
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
    </>
  );

  const controlsSections = (
    <>
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
      <details open={!isCompact && !isPhone}>
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
      <details open={!isPhone}>
        <summary>Display</summary>
        <div className="inline-grid">
          <label className="toggle">
            <input
              type="checkbox"
              checked={state.settings.compactMode}
              onChange={(event) =>
                dispatch({
                  type: "setSettings",
                  settings: { ...state.settings, compactMode: event.target.checked }
                })
              }
            />
            Compact Mode
          </label>
        </div>
      </details>
      <details open={!isCompact && !isPhone}>
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
      <details open={!isCompact && !isPhone}>
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
      <details open={!isCompact && !isPhone}>
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
                dispatch({ type: "setVendors", vendors: { ...state.vendors, ultrasonic: event.target.value } })
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
      <details open={!isCompact && !isPhone}>
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
      <details open={!isCompact && !isPhone}>
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
      <details open={!isCompact && !isPhone}>
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
            Vehicle Detail
            <select
              value={state.settings.vehicleDetail}
              onChange={(event) =>
                dispatch({
                  type: "setSettings",
                  settings: { ...state.settings, vehicleDetail: event.target.value as "low" | "high" }
                })
              }
            >
              <option value="high">High</option>
              <option value="low">Low</option>
            </select>
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
    </>
  );

  const viewTabs = (
    <div className="view-tabs" role="tablist" aria-label="View selector">
      {(["main", "top", "side"] as const).map((mode) => (
        <button
          key={mode}
          type="button"
          role="tab"
          aria-selected={activeView === mode}
          className={activeView === mode ? "active" : ""}
          onClick={() => setActiveView(mode)}
        >
          {mode === "main" ? "3D" : mode === "top" ? "Top" : "Side"}
        </button>
      ))}
    </div>
  );

  return (
    <div className={appClass}>
      <header className="header">
        <div>
          <h1>Sensor Configuration Studio</h1>
          <p>Design autonomous-driving sensor layouts with 3D constraints and presets.</p>
        </div>
        <div className="meta">
          <span>Overlaps: {overlaps.length}</span>
          <span>Preset: {state.meta.presetId || "custom"}</span>
        </div>
        {isTablet && (
          <div className="header-actions">
            <button type="button" className="ghost" onClick={() => setSidebarOpen((value) => !value)}>
              Controls
            </button>
          </div>
        )}
      </header>

      {isDesktop && (
        <div className={`layout ${isCompact ? "compact" : ""} desktop`}>
          <aside className={`panel left ${isCompact ? "compact" : ""}`}>{controlsSections}</aside>
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
              vehicleDetail={state.settings.vehicleDetail}
              resetKey={resetViewToken}
              onSelect={(id) => dispatch({ type: "selectSensor", id })}
              onUpdateSensor={handleSensorUpdate}
            >
              {sceneOverlay("main")}
            </SceneView>
            <div className="stats" data-testid="visible-sensor-count">
              <span>Cameras: {countsByType.camera}</span>
              <span>Radar: {countsByType.radar}</span>
              <span>Ultrasonic: {countsByType.ultrasonic}</span>
              <span>Lidar: {countsByType.lidar}</span>
              <span>Visible: {visibleSensors.length}</span>
            </div>
          </main>
          <aside className={`panel right ${isCompact ? "compact" : ""}`}>
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
                vehicleDetail={state.settings.vehicleDetail}
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
                vehicleDetail={state.settings.vehicleDetail}
                onSelect={(id) => dispatch({ type: "selectSensor", id })}
                onUpdateSensor={handleSensorUpdate}
              />
            </div>
            <details open={!isCompact}>
              <summary>Coverage Metrics</summary>
              {metricsContent}
            </details>
            <details open={!isCompact}>
              <summary>Scenario Coverage</summary>
              {scenarioContent}
            </details>
            <details open>
              <summary>Inspector</summary>
              {inspectorContent}
            </details>
            <details open={!isCompact}>
              <summary>Preset Utilities</summary>
              {presetUtilitiesContent}
            </details>
          </aside>
        </div>
      )}

      {isTablet && (
        <div className={`layout ${isCompact ? "compact" : ""} tablet`} data-sidebar-open={sidebarOpen}>
          <aside className={`panel left ${isCompact ? "compact" : ""} ${sidebarOpen ? "open" : "collapsed"}`}>
            {controlsSections}
          </aside>
          <main className="viewport tablet">
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
              vehicleDetail={state.settings.vehicleDetail}
              resetKey={resetViewToken}
              onSelect={(id) => dispatch({ type: "selectSensor", id })}
              onUpdateSensor={handleSensorUpdate}
            >
              {sceneOverlay("main")}
            </SceneView>
            <div className="aux-row">
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
                vehicleDetail={state.settings.vehicleDetail}
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
                vehicleDetail={state.settings.vehicleDetail}
                onSelect={(id) => dispatch({ type: "selectSensor", id })}
                onUpdateSensor={handleSensorUpdate}
              />
            </div>
            <div className="stats" data-testid="visible-sensor-count">
              <span>Cameras: {countsByType.camera}</span>
              <span>Radar: {countsByType.radar}</span>
              <span>Ultrasonic: {countsByType.ultrasonic}</span>
              <span>Lidar: {countsByType.lidar}</span>
              <span>Visible: {visibleSensors.length}</span>
            </div>
            <details open={!isCompact}>
              <summary>Coverage Metrics</summary>
              {metricsContent}
            </details>
            <details open={!isCompact}>
              <summary>Scenario Coverage</summary>
              {scenarioContent}
            </details>
            <details open>
              <summary>Inspector</summary>
              {inspectorContent}
            </details>
          </main>
        </div>
      )}

      {isPhone && (
        <div className={`layout ${isCompact ? "compact" : ""} phone`}>
          <main className="viewport phone">
            {viewTabs}
            <div className="phone-view-stack">
              {(["main", "top", "side"] as const).map((mode) => (
                <div key={mode} className={`phone-view ${activeView === mode ? "active" : ""}`}>
                  <SceneView
                    mode={mode}
                    vehicle={state.vehicle}
                    sensors={state.sensors}
                    layers={state.layers}
                    scenarios={state.scenarios}
                    selectedSensorId={state.selectedSensorId}
                    enableEdit={mode !== "main" && state.settings.enableViewEditing}
                    performanceMode={state.settings.performanceMode}
                    lidarPointCount={effectiveLidarPoints}
                    showLidarPoints={state.layers.lidar}
                    vehicleDetail={state.settings.vehicleDetail}
                    coverage={mode === "top" && state.settings.showCoverageHeatmap ? coverage : undefined}
                    resetKey={mode === "main" ? resetViewToken : undefined}
                    onSelect={(id) => dispatch({ type: "selectSensor", id })}
                    onUpdateSensor={handleSensorUpdate}
                  >
                    {sceneOverlay(mode)}
                  </SceneView>
                </div>
              ))}
            </div>
            <div className="stats" data-testid="visible-sensor-count">
              <span>Cameras: {countsByType.camera}</span>
              <span>Radar: {countsByType.radar}</span>
              <span>Ultrasonic: {countsByType.ultrasonic}</span>
              <span>Lidar: {countsByType.lidar}</span>
              <span>Visible: {visibleSensors.length}</span>
            </div>
          </main>
          <div className={`bottom-sheet ${bottomSheetOpen ? "open" : ""}`}>
            <button type="button" className="sheet-handle" onClick={() => setBottomSheetOpen((value) => !value)}>
              {bottomSheetOpen ? "Close Controls" : "Open Controls"}
            </button>
            <div className="bottom-sheet-content">
              {controlsSections}
              <details open={!isCompact}>
                <summary>Coverage Metrics</summary>
                {metricsContent}
              </details>
              <details open={!isCompact}>
                <summary>Scenario Coverage</summary>
                {scenarioContent}
              </details>
              <details open>
                <summary>Inspector</summary>
                {inspectorContent}
              </details>
              <details open={!isCompact}>
                <summary>Preset Utilities</summary>
                {presetUtilitiesContent}
              </details>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
