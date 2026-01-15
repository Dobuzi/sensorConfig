# Sensor Configuration Studio

A production-ready MVP for designing autonomous-driving sensor configurations with presets, constraints, and JSON import/export. Built with React + TypeScript + Vite and deployed via GitHub Pages.

## Features
- Vehicle templates: sedan, hatchback, SUV
- Deterministic presets (FSD-like, ADAS/NCAP, Robotaxi/AV, Tesla HW4 approx)
- Constraint enforcement: boundary clamp, min spacing, mirror placement
- 2D canvas visualization with FOV wedges, boresight, overlap highlight
- Import/export with 3D-ready schema and validation

## Project Structure
- `docs/requirements.md` Requirements specification
- `docs/architecture.md` System architecture
- `src/engine/` Presets, constraints, overlap, serialization, state
- `src/components/` Canvas renderer
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
- Select a vehicle template (sedan, hatchback, SUV) from the left panel.
- Apply a preset to generate a baseline sensor layout.
- Drag sensors in the canvas to reposition them inside the footprint.
- Use the inspector to adjust yaw, FOV, and range.
- Toggle layers to show/hide sensor types and overlap highlights.
- Export JSON to capture the current configuration, or import JSON to restore it.

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
