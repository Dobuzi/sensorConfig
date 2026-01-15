# Requirements Specification

## Problem Statement
Designers need a fast, visual way to configure autonomous-driving sensors on vehicle footprints, validate constraints (boundary, spacing, mirroring), and export/import 3D-ready configuration data.

## Goals
- Provide a browser-based 3D tool to place sensors on vehicle templates.
- Offer deterministic preset configurations and constraint enforcement.
- Support JSON import/export with 3D-ready pose data.
- Provide multi-view projections for spatial comprehension.

## Non-goals
- No backend services or multi-user collaboration.
- No photorealistic 3D rendering.
- No real-world sensor calibration or certification workflows.

## User Stories
- As a designer, I can apply a Tesla FSD preset to start from a known layout.
- As a tester, I can adjust pitch/roll/yaw and verify 3D alignment.
- As an integrator, I can export/import JSON and keep states identical.
- As a reviewer, I can toggle layers and see overlap highlights.

## Functional Requirements
- Vehicle templates: sedan, hatchback, SUV (with polygon footprints).
- Sensor model: position and orientation (yaw/pitch/roll), FOV, range, enabled.
- Recommendation engine: deterministic placements for three presets.
- Constraints: boundary clamp, min spacing (0.1–0.2m), mirror placement.
- Rendering: 3D vehicle mesh, sensors, FOV frustums, overlap highlight.
- Multi-view: main 3D view plus locked Top (XY) and Side (XZ) views.
- Import/export: schema versioning, validation, friendly errors.

## Non-functional Requirements
- Performance: smooth interaction on typical laptops for <50 sensors.
- Usability: compact controls, clear error messages, simple presets.
- Maintainability: modular engine, test coverage for geometry/constraints.

## Constraints
- Boundary clamp projects to nearest polygon edge when outside.
- Min spacing maintains Dmin between sensor positions.
- Mirror placement creates/updates mirrored sensor on -Y with mirrored yaw.

## Visualization Requirements
- 3D frustums for FOV visualization.
- Top/Side views must show world-aligned grids and angular rays.
- Overlap detection for FOV volumes, deterministic and testable.

## Presets Requirements
- Tesla FSD: 8 cameras, no radar/ultrasonic/lidar (approximate layout).
- NCAP: 7 cameras (4 wide), 3 radars, 12 ultrasonics.
- Robotaxi: 7 cameras (4 wide), 3 radars, 12 ultrasonics, 1 lidar.

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
- Layer toggles hide matching sensors in all views.
