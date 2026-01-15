# Vehicle Reference (Tesla-Inspired)

This project uses a low-poly, Tesla-referenced body profile to make the vehicle shape recognizable while keeping performance stable.

## Reference Basis
- Tesla Model 3 / Model Y external dimensions (publicly available specs).
- Approximate body proportions:
  - Length-to-height ratio targets sedan/suv silhouettes.
  - Roofline slope and rear taper modeled for Tesla-style fastback.

## Implementation Notes
- Geometry is procedural (no assets) for GitHub Pages compatibility.
- Body uses an extruded profile with beveling to suggest curved surfaces.
- Wheels, mirrors, and glass are added at high detail only.
- Detail level is toggleable (high/low) for performance on mobile.

## Geometry Validation
- Checked wheel alignment to ground plane (Z = 0) and wheel axis orientation.
- Verified body center alignment to the X/Y axes and symmetry about Y.
- Adjusted wheelbase placement to match vehicle `wheelbase` dimension.
- Updated body/roof extrusion to ensure Z is up and footprint matches the XY plane.

## Sources (Public Specs)
- Tesla Model 3 dimensions (approx): https://www.tesla.com/model3
- Tesla Model Y dimensions (approx): https://www.tesla.com/modely

Values are approximations and used for visualization only.
