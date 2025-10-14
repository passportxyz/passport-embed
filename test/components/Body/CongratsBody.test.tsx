import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CongratsBody } from "../../../src/components/Body/CongratsBody";
import { useHeaderControls } from "../../../src/hooks/useHeaderControls";

// Mock the useHeaderControls hook
jest.mock("../../../src/hooks/useHeaderControls");
const mockUseHeaderControls = useHeaderControls as jest.Mock;

describe("CongratsBody", () => {
  const mockSetSubtitle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseHeaderControls.mockReturnValue({
      setSubtitle: mockSetSubtitle,
    });
  });

  it("renders congratulations message", () => {
    render(<CongratsBody />);
    expect(screen.getByText("Human Verification Complete!")).toBeInTheDocument();
    expect(screen.getByText("You can now participate")).toBeInTheDocument();
  });

  it("sets subtitle on mount", () => {
    render(<CongratsBody />);
    expect(mockSetSubtitle).toHaveBeenCalledWith("CONGRATULATIONS");
  });

  it("shows close button when collapseMode is not 'off'", () => {
    render(<CongratsBody collapseMode="overlay" onClose={jest.fn()} />);
    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
  });

  it("shows close button when collapseMode is 'shift'", () => {
    render(<CongratsBody collapseMode="shift" onClose={jest.fn()} />);
    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
  });

  it("does not show close button when collapseMode is 'off'", () => {
    render(<CongratsBody collapseMode="off" onClose={jest.fn()} />);
    expect(screen.queryByRole("button", { name: /close/i })).not.toBeInTheDocument();
  });

  it("does not show close button when collapseMode is undefined", () => {
    render(<CongratsBody onClose={jest.fn()} />);
    expect(screen.queryByRole("button", { name: /close/i })).not.toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const mockOnClose = jest.fn();
    render(<CongratsBody collapseMode="overlay" onClose={mockOnClose} />);
    
    const closeButton = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("applies extra bottom margin when no close button is shown", () => {
    const { container } = render(<CongratsBody collapseMode="off" />);
    const textBlock = container.querySelector('[class*="textBlock"]');
    expect(textBlock).toHaveClass("extraBottomMarginForBodyWithoutButton");
  });

  it("does not apply extra bottom margin when close button is shown", () => {
    const { container } = render(<CongratsBody collapseMode="overlay" onClose={jest.fn()} />);
    const textBlock = container.querySelector('[class*="textBlock"]');
    expect(textBlock).not.toHaveClass("extraBottomMarginForBodyWithoutButton");
  });

  it("renders without onClose prop", () => {
    render(<CongratsBody collapseMode="overlay" />);
    expect(screen.getByText("Human Verification Complete!")).toBeInTheDocument();
  });
});
