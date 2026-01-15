# Requirements Specification

## Problem Statement
Designers need a fast, visual way to configure autonomous-driving sensors on vehicle footprints, validate constraints (boundary, spacing, mirroring), and export/import 3D-ready configuration data.

## Goals
- Provide a browser-based canvas tool to place sensors on vehicle templates.
- Offer deterministic preset configurations and constraint enforcement.
- Support JSON import/export with 3D-ready pose data.
- Highlight field-of-view (FOV) overlap and enable layer toggles.

## Non-goals
- No backend services or multi-user collaboration.
- No full 3D rendering in MVP.
- No real-world sensor calibration or certification workflows.

## User Stories
- As a designer, I can apply an FSD-like preset to start from a known layout.
- As a tester, I can drag sensors and see clamps and spacing fixes.
- As an integrator, I can export/import JSON and keep states identical.
- As a reviewer, I can toggle layers and see overlap highlights.

## Functional Requirements
- Vehicle templates: sedan, hatchback, SUV (with polygon footprints).
- Sensor model: position and orientation (yaw/pitch/roll), FOV, range, enabled.
- Recommendation engine: deterministic placements for four presets.
- Constraints: boundary clamp, min spacing (0.1–0.2m), mirror placement.
- Rendering: vehicle polygon, sensors, FOV wedges, boresight, overlap highlight.
- Interaction: drag sensors, adjust yaw/FOV/range, pan/zoom canvas.
- Import/export: schema versioning, validation, friendly errors.

## Non-functional Requirements
- Performance: smooth interaction on typical laptops for <50 sensors.
- Usability: controls visible, clear error messages, simple presets.
- Maintainability: modular engine, test coverage for geometry/constraints.

## Constraints
- Boundary clamp projects to nearest polygon edge when outside.
- Min spacing maintains Dmin between sensor positions.
- Mirror placement creates/updates mirrored sensor on -Y with mirrored yaw.

## Visualization Requirements
- Boresight line per sensor aligned to yaw.
- Layer toggles by sensor type and overlap highlighting.
- Overlap detection for FOV wedges, deterministic and testable.

## Presets Requirements
- FSD-like (camera-only)
- ADAS/NCAP-oriented
- Robotaxi/AV-oriented
- Tesla FSD HW4 (approx) camera preset

## Import/Export JSON Schema Requirements
- Schema version string.
- 3D-ready pose: position (x,y,z) and orientation (yaw,pitch,roll).
- Round-trip integrity for all fields.

## Acceptance Criteria
- Presets generate deterministic placements per vehicle template.
- Sensors cannot end outside the footprint when boundary clamp is enabled.
- Sensors closer than Dmin are separated and remain inside footprint.
- Mirror placement keeps paired sensors symmetric across Y=0.
- Import/export round-trip matches original state (no loss of fields).
- Overlap detection flags a known overlapping FOV case.
- Layer toggles hide matching FOV render elements.
