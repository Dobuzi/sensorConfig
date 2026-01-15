# Repository Guidelines

## Project Structure & Module Organization
This repository is currently empty. Add source code and supporting files under clearly named top-level folders (for example, `src/` for application code, `tests/` for test suites, and `assets/` for static files). Keep new modules cohesive and place shared utilities in a dedicated folder such as `src/lib/`.

## Build, Test, and Development Commands
No build or test tooling is configured yet. When adding tooling, document the exact commands here (for example, `npm run build`, `npm test`, or `make dev`) and include a one-line description of what each command does.

## Coding Style & Naming Conventions
No repository-wide conventions are defined yet. When code is added, prefer:
- Consistent indentation (2 or 4 spaces, no tabs) across all files.
- Descriptive, lowercase directory names (for example, `src/sensors/`).
- Predictable file naming patterns (for example, `sensor-config.ts`, `sensor-config.test.ts`).
If you introduce a formatter or linter (for example, Prettier, ESLint, Black, or gofmt), list the command to run it and apply it consistently.

## Testing Guidelines
No testing framework is set up. When tests are introduced, specify:
- The testing framework and how to run it.
- Test file naming conventions (for example, `*.test.ts` or `test_*.py`).
- Any coverage expectations or required test tiers (unit, integration).

## Commit & Pull Request Guidelines
This repository has no commit history yet, so no conventions are established. When creating a history, adopt a clear commit style (for example, `type: short summary` or Conventional Commits) and document it here. For pull requests, include a brief description of changes, relevant issue links, and any required screenshots or logs.

## Configuration & Security Notes
If you add configuration files or secrets, document their locations (for example, `.env.example`) and keep secrets out of version control. Store environment-specific values in local, untracked files and reference them in this guide.
