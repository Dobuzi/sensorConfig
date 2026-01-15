import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../App";

const click = (label: RegExp) => {
  const buttons = screen.getAllByRole("button", { name: label });
  fireEvent.click(buttons[0]);
};

describe("App interactions", () => {
  it("toggles camera layer visibility count", async () => {
    render(<App />);
    click(/Tesla FSD/i);
    const count = screen.getByTestId("visible-sensor-count");
    let initial = 0;
    await waitFor(() => {
      const initialMatch = count.textContent?.match(/Visible:\s*(\d+)/);
      initial = initialMatch ? Number(initialMatch[1]) : 0;
      expect(initial).toBeGreaterThan(0);
    });

    const cameraToggle = screen.getByLabelText("camera") as HTMLInputElement;
    fireEvent.click(cameraToggle);
    await waitFor(() => {
      const updatedMatch = count.textContent?.match(/Visible:\s*(\d+)/);
      const updated = updatedMatch ? Number(updatedMatch[1]) : 0;
      expect(updated).toBeLessThan(initial);
    });
  });

  it("shows error on invalid import", () => {
    render(<App />);
    const textarea = screen.getByPlaceholderText(/Paste JSON/i);
    fireEvent.change(textarea, { target: { value: "{ not json" } });
    click(/Import/i);
    expect(screen.getByText(/Invalid JSON format/i)).toBeInTheDocument();
  });

  it("handles empty selection without crashing", () => {
    render(<App />);
    expect(screen.getByText(/Select a sensor to edit/i)).toBeInTheDocument();
  });

  it("toggles top/side edit mode attribute", () => {
    render(<App />);
    const topView = screen.getByTestId("top-view");
    expect(topView.getAttribute("data-edit-enabled")).toBe("false");
    const toggle = screen.getByLabelText(/Edit Top\/Side/i);
    fireEvent.click(toggle);
    expect(topView.getAttribute("data-edit-enabled")).toBe("true");
  });

  it("renders legend entries for active sensor types", async () => {
    render(<App />);
    click(/Robotaxi/i);
    await waitFor(() => {
      expect(screen.getByTestId("sensor-legend")).toBeInTheDocument();
    });
    const legend = within(screen.getByTestId("sensor-legend"));
    expect(legend.getByText(/Camera/i)).toBeInTheDocument();
    expect(legend.getByText(/Radar/i)).toBeInTheDocument();
    expect(legend.getByText(/Ultrasonic/i)).toBeInTheDocument();
    expect(legend.getByText(/LiDAR/i)).toBeInTheDocument();
  });

  it("legend toggles update layer visibility", async () => {
    render(<App />);
    click(/Tesla FSD/i);
    const count = screen.getByTestId("visible-sensor-count");
    await waitFor(() => {
      expect(count.textContent).toMatch(/Visible:\s*\d+/);
    });
    const legend = within(screen.getByTestId("sensor-legend"));
    const legendToggle = legend.getByLabelText("Camera") as HTMLInputElement;
    fireEvent.click(legendToggle);
    await waitFor(() => {
      const updatedMatch = count.textContent?.match(/Visible:\s*(\d+)/);
      const updated = updatedMatch ? Number(updatedMatch[1]) : 0;
      expect(updated).toBe(0);
    });
  });

  it("toggles compact mode class", () => {
    render(<App />);
    const app = document.querySelector(".app");
    expect(app?.classList.contains("compact")).toBe(true);
    const compactToggle = screen.getByLabelText(/Compact Mode/i);
    fireEvent.click(compactToggle);
    expect(app?.classList.contains("compact")).toBe(false);
  });
});
