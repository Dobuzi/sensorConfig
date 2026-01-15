import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../App";

const click = (label: RegExp) => {
  fireEvent.click(screen.getByRole("button", { name: label }));
};

describe("App interactions", () => {
  it("toggles camera layer visibility count", () => {
    render(<App />);
    click(/FSD-like/i);
    const count = screen.getByTestId("visible-fov-count");
    const initial = Number(count.textContent);
    expect(initial).toBeGreaterThan(0);

    const cameraToggle = screen.getByLabelText("camera") as HTMLInputElement;
    fireEvent.click(cameraToggle);
    const updated = Number(count.textContent);
    expect(updated).toBeLessThan(initial);
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
