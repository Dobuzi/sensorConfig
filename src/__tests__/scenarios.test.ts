import { describe, expect, it } from "vitest";
import { intersectionPath, pedestrianPath } from "../engine/scenarios";


describe("scenarios", () => {
  it("creates pedestrian crossing at distance", () => {
    const scenario = pedestrianPath(25);
    expect(scenario.marker.x).toBe(25);
    expect(scenario.line[0].x).toBe(25);
  });

  it("creates intersection line at distance", () => {
    const scenario = intersectionPath(30);
    expect(scenario.marker.x).toBe(30);
    expect(scenario.line[1].x).toBe(30);
  });
});
