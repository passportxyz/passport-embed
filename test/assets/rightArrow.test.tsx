import React from "react";
import { render, screen } from "@testing-library/react";
import { RightArrow } from "../../src/assets/rightArrow";

describe("RightArrow", () => {
  it("renders without crashing", () => {
    const { container } = render(<RightArrow />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("applies invertColors prop correctly", () => {
    const { rerender, container } = render(<RightArrow invertColors={true} />);
    let path = container.querySelector("path");
    expect(path).toHaveAttribute("stroke", "rgb(var(--color-background-c6dbf459))");

    rerender(<RightArrow invertColors={false} />);
    path = container.querySelector("path");
    expect(path).toHaveAttribute("stroke", "rgb(var(--color-primary-c6dbf459))");
  });

  it("defaults invertColors to false when not provided", () => {
    const { container } = render(<RightArrow />);
    const path = container.querySelector("path");
    expect(path).toHaveAttribute("stroke", "rgb(var(--color-primary-c6dbf459))");
  });
});
