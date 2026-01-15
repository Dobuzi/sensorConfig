import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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
});
