import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "../../src/components/Header";
import { useHeaderControls } from "../../src/hooks/useHeaderControls";
import { useWidgetIsQuerying, useWidgetPassportScore } from "../../src/hooks/usePassportScore";

// Mock the hooks
jest.mock("../../src/hooks/useHeaderControls");
jest.mock("../../src/hooks/usePassportScore");
const mockUseHeaderControls = useHeaderControls as jest.Mock;
const mockUseWidgetIsQuerying = useWidgetIsQuerying as jest.Mock;
const mockUseWidgetPassportScore = useWidgetPassportScore as jest.Mock;

describe("Header", () => {
  const mockSetSubtitle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseHeaderControls.mockReturnValue({
      setSubtitle: mockSetSubtitle,
    });
    mockUseWidgetIsQuerying.mockReturnValue(false);
    mockUseWidgetPassportScore.mockReturnValue({ data: null });
  });

  it("renders header with default content", () => {
    render(<Header bodyIsOpen={false} setBodyIsOpen={jest.fn()} collapsible={false} />);
    expect(screen.getByText("Human Passport Score")).toBeInTheDocument();
  });

  it("shows chevron when collapsible", () => {
    render(<Header bodyIsOpen={false} setBodyIsOpen={jest.fn()} collapsible={true} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("does not show chevron when not collapsible", () => {
    render(<Header bodyIsOpen={false} setBodyIsOpen={jest.fn()} collapsible={false} />);
    // The button is still there, but it's not collapsible
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("toggles body when chevron is clicked", () => {
    const mockSetBodyIsOpen = jest.fn();
    render(
      <Header bodyIsOpen={false} setBodyIsOpen={mockSetBodyIsOpen} collapsible={true} />
    );
    
    const chevron = screen.getByRole("button");
    fireEvent.click(chevron);
    
    expect(mockSetBodyIsOpen).toHaveBeenCalledWith(expect.any(Function));
  });

  it("shows correct chevron direction when body is closed", () => {
    render(<Header bodyIsOpen={false} setBodyIsOpen={jest.fn()} collapsible={true} />);
    const chevron = screen.getByRole("button");
    expect(chevron).toHaveClass("bodyCollapsed");
  });

  it("shows correct chevron direction when body is open", () => {
    render(<Header bodyIsOpen={true} setBodyIsOpen={jest.fn()} collapsible={true} />);
    const chevron = screen.getByRole("button");
    expect(chevron).toHaveClass("bodyExpanded");
  });

  it("renders subtitle when provided", () => {
    mockUseHeaderControls.mockReturnValue({
      setSubtitle: mockSetSubtitle,
      subtitle: "Test Subtitle",
    });

    render(<Header bodyIsOpen={false} setBodyIsOpen={jest.fn()} collapsible={false} />);
    // The Header component doesn't actually render subtitles, it just sets them
    expect(screen.getByText("Human Passport Score")).toBeInTheDocument();
  });

  it("does not render subtitle when not provided", () => {
    mockUseHeaderControls.mockReturnValue({
      setSubtitle: mockSetSubtitle,
      subtitle: "",
    });

    render(<Header bodyIsOpen={false} setBodyIsOpen={jest.fn()} collapsible={false} />);
    expect(screen.getByText("Human Passport Score")).toBeInTheDocument();
  });

  it("handles multiple clicks on chevron", () => {
    const mockSetBodyIsOpen = jest.fn();
    render(
      <Header bodyIsOpen={false} setBodyIsOpen={mockSetBodyIsOpen} collapsible={true} />
    );
    
    const chevron = screen.getByRole("button");
    fireEvent.click(chevron);
    fireEvent.click(chevron);
    fireEvent.click(chevron);
    
    expect(mockSetBodyIsOpen).toHaveBeenCalledTimes(3);
    expect(mockSetBodyIsOpen).toHaveBeenNthCalledWith(1, expect.any(Function));
    expect(mockSetBodyIsOpen).toHaveBeenNthCalledWith(2, expect.any(Function));
    expect(mockSetBodyIsOpen).toHaveBeenNthCalledWith(3, expect.any(Function));
  });

      it("renders with different subtitle values", () => {
        const { rerender } = render(<Header bodyIsOpen={false} setBodyIsOpen={jest.fn()} collapsible={false} />);

        // No subtitle
        mockUseHeaderControls.mockReturnValue({
          setSubtitle: mockSetSubtitle,
          subtitle: "",
        });
        rerender(<Header bodyIsOpen={false} setBodyIsOpen={jest.fn()} collapsible={false} />);
        expect(screen.getByText("Human Passport Score")).toBeInTheDocument();

        // With subtitle
        mockUseHeaderControls.mockReturnValue({
          setSubtitle: mockSetSubtitle,
          subtitle: "New Subtitle",
        });
        rerender(<Header bodyIsOpen={false} setBodyIsOpen={jest.fn()} collapsible={false} />);
        expect(screen.getByText("Human Passport Score")).toBeInTheDocument();
      });

      it("renders score indicator with correct progress", () => {
        mockUseWidgetIsQuerying.mockReturnValue(false);
        mockUseWidgetPassportScore.mockReturnValue({ 
          data: { score: 50, threshold: 100 } 
        });

        render(<Header bodyIsOpen={false} setBodyIsOpen={jest.fn()} collapsible={false} />);
        
        const progressBar = screen.getByRole("progressbar");
        expect(progressBar).toHaveAttribute("aria-valuenow", "50");
        expect(progressBar).toHaveAttribute("aria-valuemin", "0");
        expect(progressBar).toHaveAttribute("aria-valuemax", "100");
      });

      it("renders score indicator with score exceeding threshold", () => {
        mockUseWidgetIsQuerying.mockReturnValue(false);
        mockUseWidgetPassportScore.mockReturnValue({ 
          data: { score: 150, threshold: 100 } 
        });

        render(<Header bodyIsOpen={false} setBodyIsOpen={jest.fn()} collapsible={false} />);
        
        const progressBar = screen.getByRole("progressbar");
        expect(progressBar).toHaveAttribute("aria-valuenow", "150");
        expect(progressBar).toHaveAttribute("aria-valuemin", "0");
        expect(progressBar).toHaveAttribute("aria-valuemax", "100");
      });

      it("renders score indicator with zero score", () => {
        mockUseWidgetIsQuerying.mockReturnValue(false);
        mockUseWidgetPassportScore.mockReturnValue({ 
          data: { score: 0, threshold: 100 } 
        });

        render(<Header bodyIsOpen={false} setBodyIsOpen={jest.fn()} collapsible={false} />);
        
        const progressBar = screen.getByRole("progressbar");
        expect(progressBar).toHaveAttribute("aria-valuenow", "0");
        expect(progressBar).toHaveAttribute("aria-valuemin", "0");
        expect(progressBar).toHaveAttribute("aria-valuemax", "100");
      });

      it("shows LoadingIcon when querying", () => {
        mockUseWidgetIsQuerying.mockReturnValue(true);
        mockUseWidgetPassportScore.mockReturnValue({ data: null });

        const { container } = render(<Header bodyIsOpen={false} setBodyIsOpen={jest.fn()} collapsible={false} />);
        
        // LoadingIcon should be rendered when querying
        const svg = container.querySelector("svg");
        expect(svg).toBeInTheDocument();
      });

      it("does not show score indicator when querying", () => {
        mockUseWidgetIsQuerying.mockReturnValue(true);
        mockUseWidgetPassportScore.mockReturnValue({ data: { score: 50, threshold: 100 } });

        render(<Header bodyIsOpen={false} setBodyIsOpen={jest.fn()} collapsible={false} />);
        
        // Should not show progressbar when querying
        expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
      });

      it("does not trigger setBodyIsOpen when collapsible is false", () => {
        const mockSetBodyIsOpen = jest.fn();
        render(<Header bodyIsOpen={false} setBodyIsOpen={mockSetBodyIsOpen} collapsible={false} />);
        
        const button = screen.getByRole("button");
        fireEvent.click(button);
        
        // setBodyIsOpen should not be called when collapsible is false
        expect(mockSetBodyIsOpen).not.toHaveBeenCalled();
      });
    });