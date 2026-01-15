# Architecture

## System Context
Frontend-only React + TypeScript app running in the browser. No backend or external services.

## Major Modules
- Data model & schema: typed sensor/vehicle/constraint models and JSON schema validation.
- Recommendation engine: deterministic placement rules based on vehicle length/width anchors.
- Constraint solver: boundary clamp, min-spacing separation, mirror placement.
- Renderer (3D scene): Three.js scene with extruded vehicle mesh, sensors, and frustums.
- Multi-view compositor: main interactive 3D view plus synchronized Top and Side projections.
- Interaction layer: orbit controls for the main view; fixed cameras for projections.
- UI panels: compact left configuration panel and right inspector with auxiliary views.
- Import/export + validation: JSON schemaVersion, parse/validate, user-friendly errors.

## State Management
`useReducer` with explicit actions for sensor edits, constraints, presets, and import/export. All views derive from the same state tree.

## Rendering Approach
React Three Fiber + Three.js. The same scene graph is rendered in three canvases:
- Main 3D view (perspective camera + orbit controls)
- Top view (orthographic camera, locked)
- Side view (orthographic camera, locked)

Top/Side views add world-aligned grid lines and angular rays for distance/angle references.

## Testing Strategy
- Unit tests for geometry, constraints, and recommendation engine.
- Component tests for UI toggles, import/export, and deterministic preset outputs.
- Canvas/WebGL mocked in jsdom for test stability.

## Extension Plan for 3D
- Add z-axis constraints and mount height rules.
- Extend frustum visuals with vertical FOV cut lines.
- Optional migration to Three.js post-processing for enhanced depth cues.

## Risks and Trade-offs
- WebGL rendering in tests requires mocks; mitigated with setup mocks.
- Frustum visuals are simplified pyramids; adequate for MVP but not photorealistic.
- No backend means no persistence beyond export/import.
