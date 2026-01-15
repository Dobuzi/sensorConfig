# Architecture

## System Context
Frontend-only React + TypeScript app running in the browser. No backend or external services.

## Major Modules
- Data model & schema: typed sensor/vehicle/constraint models and JSON schema validation.
- Recommendation engine: deterministic placement rules based on vehicle length/width anchors.
- Constraint solver: boundary clamp, min-spacing separation, mirror placement.
- Renderer (canvas scene): 2D visualization of footprint, sensors, FOV, and overlap.
- Interaction layer: drag sensors, adjust yaw/FOV/range, pan/zoom.
- UI panels: left preset/vehicle selection, right inspector and layer toggles.
- Import/export + validation: JSON schemaVersion, parse/validate, user-friendly errors.

## State Management
`useReducer` with explicit actions for sensor edits, constraints, presets, and import/export. Keeps deterministic updates and easy testing.

## Rendering Approach
Pure HTML canvas (single canvas) for deterministic drawing and easy performance. Canvas is driven by state, and tests assert derived render state rather than pixel output.

## Testing Strategy
- Unit tests for geometry, constraints, and recommendation engine.
- Component tests for layer toggles and import/export interactions.

## Extension Plan for 3D
- Extend schema with pitch/roll/verticalFOV already included.
- Add z-axis constraints and migrate renderer to Three.js for true 3D visualization.
- Keep model and constraint logic reusable across 2D/3D.

## Risks and Trade-offs
- Canvas simplifies rendering but limits DOM-based assertions; mitigated by exposing render state for tests.
- Overlap detection uses a deterministic approximation; adequate for MVP but not full geometric intersection.
- No backend means no persistence beyond export/import.
