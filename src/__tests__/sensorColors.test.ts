import { describe, expect, it } from "vitest";
import { SENSOR_TYPE_COLORS } from "../theme/sensorColors";

describe("sensor color mapping", () => {
  it("provides a stable color for each sensor type", () => {
    expect(SENSOR_TYPE_COLORS.camera).toMatch(/^#/);
    expect(SENSOR_TYPE_COLORS.radar).toMatch(/^#/);
    expect(SENSOR_TYPE_COLORS.ultrasonic).toMatch(/^#/);
    expect(SENSOR_TYPE_COLORS.lidar).toMatch(/^#/);
  });
});
