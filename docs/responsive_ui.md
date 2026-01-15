# Responsive UI Tiers

## Breakpoints and Input Detection
- Pointer detection: `pointer: coarse` enables touch mode.
- Layout tiers:
  - Phone: width <= 768px, or touch + width <= 900px
  - Tablet: width <= 1200px, or any touch device above phone threshold
  - Desktop: width > 1200px and non-touch

## Phone (iPhone)
- Single primary view with segmented tabs: 3D / Top / Side.
- Only one large view is interactive at a time.
- Controls live in a bottom sheet (presets, vendors, layers, sensors).
- Right-fixed Top/Side panels are intentionally forbidden to avoid tiny tap targets.

## Tablet (iPad)
- 3D view stays primary.
- Top/Side views are stacked beneath the main view.
- Controls in a collapsible left sidebar to preserve canvas space.
- Touch-first sizing and hit targets are enforced.

## Desktop (MacBook)
- Engineering layout: left controls, center 3D, right fixed Top/Side views.
- This is the only tier with right-fixed auxiliary views.

## Why iPhone Forbids Right Panels
Small screens + touch input create mis-taps and unreadable micro-panels. A single large view with tab switching preserves clarity while keeping the scene interactive.
