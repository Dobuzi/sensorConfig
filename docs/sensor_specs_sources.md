# Sensor Spec Sources

All values are based on publicly discussed vendor families or datasheet references and approximated for visualization. Dates reflect when values were curated for this MVP.

## Cameras

### Mobileye (EyeQ camera references)
- Category: Narrow
  - HFOV 45°, VFOV 30°, Range 200m
  - Source: https://www.mobileye.com/
  - Accessed: 2026-01-15
  - Note: Narrow tier values approximated from public summaries.
- Category: Main
  - HFOV 80°, VFOV 45°, Range 140m
  - Source: https://www.mobileye.com/
  - Accessed: 2026-01-15
  - Note: Main tier values approximated.
- Category: Wide
  - HFOV 140°, VFOV 60°, Range 100m
  - Source: https://www.mobileye.com/
  - Accessed: 2026-01-15
  - Note: Wide tier values approximated.

### onsemi (AR-series proxy modules)
- Category: Narrow (AR0234 ref)
  - HFOV 55°, VFOV 35°, Range 180m
  - Source: https://www.onsemi.com/
  - Accessed: 2026-01-15
  - Note: Module-level optics vary; values approximated.
- Category: Main (AR0820 ref)
  - HFOV 90°, VFOV 50°, Range 140m
  - Source: https://www.onsemi.com/
  - Accessed: 2026-01-15
  - Note: Module-level optics vary; values approximated.
- Category: Wide (AR0144 ref)
  - HFOV 120°, VFOV 60°, Range 110m
  - Source: https://www.onsemi.com/
  - Accessed: 2026-01-15
  - Note: Module-level optics vary; values approximated.

## Radar

### Continental
- SRR
  - HFOV 120°, VFOV 20°, Range 50m
  - Source: https://www.continental-automotive.com/
  - Accessed: 2026-01-15
  - Note: Family references; approximated.
- MRR
  - HFOV 60°, VFOV 12°, Range 120m
  - Source: https://www.continental-automotive.com/
  - Accessed: 2026-01-15
  - Note: Family references; approximated.
- LRR
  - HFOV 20°, VFOV 6°, Range 250m
  - Source: https://www.continental-automotive.com/
  - Accessed: 2026-01-15
  - Note: Family references; approximated.

### Bosch
- SRR
  - HFOV 110°, VFOV 20°, Range 45m
  - Source: https://www.bosch-mobility.com/
  - Accessed: 2026-01-15
  - Note: Family references; approximated.
- MRR
  - HFOV 50°, VFOV 10°, Range 130m
  - Source: https://www.bosch-mobility.com/
  - Accessed: 2026-01-15
  - Note: Family references; approximated.
- LRR
  - HFOV 18°, VFOV 6°, Range 220m
  - Source: https://www.bosch-mobility.com/
  - Accessed: 2026-01-15
  - Note: Family references; approximated.

## Ultrasonic

### Bosch
- Parking ultrasonic
  - HFOV 120°, VFOV 60°, Range 5m
  - Source: https://www.bosch-mobility.com/
  - Accessed: 2026-01-15
  - Note: Approximate cone FOV for parking sensors.

### Continental
- Parking ultrasonic
  - HFOV 120°, VFOV 60°, Range 5.5m
  - Source: https://www.continental-automotive.com/
  - Accessed: 2026-01-15
  - Note: Approximate cone FOV for parking sensors.

## LiDAR

### Luminar
- Long-range (Iris ref)
  - HFOV 120°, VFOV 30°, Range 250m, Point rate 300 kpps
  - Source: https://www.luminartech.com/
  - Accessed: 2026-01-15
  - Note: Public references; approximated.

### Innoviz
- Mid-range (InnovizTwo ref)
  - HFOV 120°, VFOV 40°, Range 200m, Point rate 200 kpps
  - Source: https://innoviz.tech/
  - Accessed: 2026-01-15
  - Note: Public references; approximated.

## Visualization Assumptions
- Camera FOVs render as frustums; wide cameras trade range for field coverage.
- Radar FOVs render as fan-shaped sectors (not camera cones).
- Ultrasonic FOVs render as short, wide cones.
- LiDAR point clouds respect the registry range cutoff.
