# Gesture Mapping (Apple HIG)

## Goals
- Touch-first, predictable manipulation of the 3D scene.
- Avoid accidental edits with clear drag vs tap behavior.
- Minimum touch targets ~44px.

## Gesture Map
- Single-finger drag: orbit/rotate main 3D view.
- Two-finger drag: pan the main 3D view.
- Pinch: zoom.
- Tap: select a sensor (no movement).
- Long-press + drag (Top/Side when edit enabled): reposition sensor in that plane.

## View Switching (iPhone)
- Segmented control: 3D / Top / Side.
- Only one view is interactive at a time to avoid mis-taps.
- Bottom sheet controls stay thumb-reachable.

## Touch Mode Detection
- Uses `pointer: coarse` media query to enable touch-first spacing.
- Touch mode forces larger hit targets and compact control defaults.

## Constraints
- Drag edits obey boundary clamp, min spacing, and mirror placement.
- Touch mode does not change data model; only interaction affordances.
