import React from "react";
import { render } from "@testing-library/react";
import { LoadingIcon } from "../../src/assets/loadingIcon";

describe("LoadingIcon", () => {
  it("renders without crashing", () => {
    const { container } = render(<LoadingIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders with correct dimensions", () => {
    const { container } = render(<LoadingIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "40");
    expect(svg).toHaveAttribute("height", "31");
  });

  it("renders three animated circles", () => {
    const { container } = render(<LoadingIcon />);
    const circles = container.querySelectorAll("circle");
    expect(circles).toHaveLength(3);
  });

  it("has animated opacity values", () => {
    const { container } = render(<LoadingIcon />);
    const animateElements = container.querySelectorAll("animate");
    expect(animateElements).toHaveLength(3);
    
    animateElements.forEach((animate) => {
      expect(animate).toHaveAttribute("attributeName", "opacity");
      expect(animate).toHaveAttribute("values", "1;0.3;1");
      expect(animate).toHaveAttribute("dur", "1.5s");
      expect(animate).toHaveAttribute("repeatCount", "indefinite");
    });
  });

  it("has staggered animation timing", () => {
    const { container } = render(<LoadingIcon />);
    const animateElements = container.querySelectorAll("animate");
    
    expect(animateElements[0]).toHaveAttribute("begin", "0s");
    expect(animateElements[1]).toHaveAttribute("begin", "0.5s");
    expect(animateElements[2]).toHaveAttribute("begin", "1s");
  });
});
