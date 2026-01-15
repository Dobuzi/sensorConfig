# Sensor Configuration Studio

A production-ready MVP for designing autonomous-driving sensor configurations with presets, constraints, and JSON import/export. Built with React + TypeScript + Vite and deployed via GitHub Pages.

## Features
- 3D visualization with main view plus Top/Side projections
- Scenario overlays (pedestrian crossing, intersection) with coverage checks
- Vehicle templates: sedan, hatchback, SUV
- Deterministic presets (Tesla FSD, NCAP, Robotaxi)
- Vendor-based sensor specs with selectable modules
- Constraint enforcement: boundary clamp, min spacing, mirror placement
- FOV frustums, overlap highlights, and layer toggles
- Coverage metrics and optional heatmap overlay
- Import/export with 3D-ready schema and validation

## Project Structure
- `docs/requirements.md` Requirements specification
- `docs/architecture.md` System architecture
- `src/engine/` Presets, constraints, overlap, serialization, state
- `src/components/` Three.js views and UI
- `src/__tests__/` Vitest + Testing Library tests

## Scripts
- `npm run dev` Start local dev server
- `npm run build` Build production assets to `dist`
- `npm run preview` Preview production build
- `npm test` Run tests (Vitest)
- `npm run lint` Lint source

## Install & Run
```sh
npm install
npm test
npm run dev
```

## Usage
- Select a vehicle template and preset from the left panel.
- Inspect the 3D view (center) and Top/Side views (right).
- Adjust pose, orientation, FOV, and range in the inspector.
- Toggle layers to show/hide sensor types and overlap highlights.
- Export JSON to capture the configuration, or import JSON to restore it.

## GitHub Pages Deployment
The workflow at `.github/workflows/deploy.yml` builds and deploys on `main`.

Vite base path is set using `GITHUB_REPO_NAME`:
- `vite.config.ts` uses `base: /<repo-name>/`
- GitHub Actions sets `GITHUB_REPO_NAME` automatically

For local build with a custom repo name:
```sh
GITHUB_REPO_NAME=sensorConfig npm run build
```

## JSON Schema (3D-ready)
See `docs/requirements.md` for the full schema definition and acceptance criteria.

## Sensor Spec Sources
See `docs/sensor_specs_sources.md` for vendor/module references and notes.
