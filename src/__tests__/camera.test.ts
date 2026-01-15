import { describe, expect, it } from "vitest";
import { getMainCameraPose } from "../engine/camera";
import { VEHICLES } from "../models/vehicles";

describe("main camera pose", () => {
  it("defaults to a near-side view with forward and upward bias", () => {
    const pose = getMainCameraPose(VEHICLES.sedan);
    const [x, y, z] = pose.position;
    expect(x).toBeGreaterThan(0);
    expect(z).toBeGreaterThan(0);
    expect(Math.abs(y)).toBeGreaterThan(Math.abs(x));
    expect(Math.abs(y)).toBeGreaterThan(Math.abs(z));
  });
});
