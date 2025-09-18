import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Header } from "../../src/components/Header";
import { useWidgetPassportScore, useWidgetIsQuerying } from "../../src/hooks/usePassportScore";
import type { PassportEmbedResult } from "../../src/hooks/usePassportScore";

// Mock the hooks
jest.mock("../../src/hooks/usePassportScore");
jest.mock("../../src/hooks/useHeaderControls", () => ({
  useHeaderControls: () => ({ subtitle: "Test Subtitle" }),
}));

const mockUseWidgetPassportScore = useWidgetPassportScore as jest.MockedFunction<typeof useWidgetPassportScore>;
const mockUseWidgetIsQuerying = useWidgetIsQuerying as jest.MockedFunction<typeof useWidgetIsQuerying>;

describe("Header Component", () => {
  const defaultScoreData = {
    score: 25,
    address: "0x123...",
    threshold: 20,
    passingScore: true,
    lastScoreTimestamp: new Date("2024-01-01"),
    expirationTimestamp: new Date("2024-12-31"),
    stamps: {},
  };

  const defaultMockResult: PassportEmbedResult = {
    data: defaultScoreData,
    isPending: false,
    isFetching: false,
    isLoading: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
  };

  const defaultHeaderProps = {
    bodyIsOpen: true,
    setBodyIsOpen: jest.fn(),
    collapsible: true,
  };

  beforeEach(() => {
    mockUseWidgetPassportScore.mockReturnValue(defaultMockResult);
    mockUseWidgetIsQuerying.mockReturnValue(false);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("ScoreIndicator", () => {
    it("renders score value correctly", () => {
      render(<Header {...defaultHeaderProps} />);
      expect(screen.getByText("25")).toBeInTheDocument();
    });

    it("has correct ARIA attributes", () => {
      render(<Header {...defaultHeaderProps} />);
      const progressbar = screen.getByRole("progressbar");
      expect(progressbar).toHaveAttribute("aria-valuenow", "25");
      expect(progressbar).toHaveAttribute("aria-valuemin", "0");
      expect(progressbar).toHaveAttribute("aria-valuemax", "20");
    });

    it("calculates fill percentage correctly when below threshold", () => {
      mockUseWidgetPassportScore.mockReturnValue({
        ...defaultMockResult,
        data: {
          ...defaultScoreData,
          score: 10,
          passingScore: false,
        },
      });

      render(<Header {...defaultHeaderProps} />);
      const progressbar = screen.getByRole("progressbar");
      const expectedAngle = (10 / 20) * 360; // 50% = 180 degrees

      expect(progressbar).toHaveStyle({
        background: expect.stringContaining(`${expectedAngle}deg`),
      });
    });

    it("calculates fill percentage correctly when at threshold", () => {
      mockUseWidgetPassportScore.mockReturnValue({
        ...defaultMockResult,
        data: {
          ...defaultScoreData,
          score: 20,
          passingScore: true,
        },
      });

      render(<Header {...defaultHeaderProps} />);
      const progressbar = screen.getByRole("progressbar");
      const expectedAngle = (20 / 20) * 360; // 100% = 360 degrees

      expect(progressbar).toHaveStyle({
        background: expect.stringContaining(`${expectedAngle}deg`),
      });
    });

    it("caps fill percentage at 100% when score exceeds threshold", () => {
      mockUseWidgetPassportScore.mockReturnValue({
        ...defaultMockResult,
        data: {
          ...defaultScoreData,
          score: 40,
          threshold: 20,
          passingScore: true,
        },
      });

      render(<Header {...defaultHeaderProps} />);
      const progressbar = screen.getByRole("progressbar");
      // Should cap at 360 degrees (100%)
      expect(progressbar).toHaveStyle({
        background: expect.stringContaining("360deg"),
      });
    });

    it("uses CSS variables for colors in conic gradient", () => {
      render(<Header {...defaultHeaderProps} />);
      const progressbar = screen.getByRole("progressbar");

      expect(progressbar).toHaveStyle({
        background: expect.stringContaining("rgba(var(--color-accent-c6dbf459), 1)"),
      });
      expect(progressbar).toHaveStyle({
        background: expect.stringContaining("rgba(var(--color-primary-c6dbf459), 1)"),
      });
    });

    it("renders zero score correctly", () => {
      mockUseWidgetPassportScore.mockReturnValue({
        ...defaultMockResult,
        data: {
          ...defaultScoreData,
          score: 0,
          passingScore: false,
        },
      });

      render(<Header {...defaultHeaderProps} />);
      expect(screen.getByText("0")).toBeInTheDocument();

      const progressbar = screen.getByRole("progressbar");
      expect(progressbar).toHaveAttribute("aria-valuenow", "0");
      expect(progressbar).toHaveStyle({
        background: expect.stringContaining("0deg"),
      });
    });

    it("handles decimal scores correctly", () => {
      mockUseWidgetPassportScore.mockReturnValue({
        ...defaultMockResult,
        data: {
          ...defaultScoreData,
          score: 15.5,
          threshold: 20,
          passingScore: false,
        },
      });

      render(<Header {...defaultHeaderProps} />);
      // displayNumber uses parseInt, so 15.5 is displayed as "15"
      expect(screen.getByText("15")).toBeInTheDocument();

      const progressbar = screen.getByRole("progressbar");
      const expectedAngle = (15.5 / 20) * 360; // 77.5% = 279 degrees
      expect(progressbar).toHaveStyle({
        background: expect.stringContaining(`${expectedAngle}deg`),
      });
    });
  });

  describe("Header Collapse Behavior", () => {
    it("renders expanded header by default", () => {
      render(<Header {...defaultHeaderProps} />);
      expect(screen.getByText("Human Passport Score")).toBeInTheDocument();
    });

    it("toggles expansion state when clicked", () => {
      const setBodyIsOpen = jest.fn();
      render(
        <Header {...defaultHeaderProps} setBodyIsOpen={setBodyIsOpen} />
      );
      const header = screen.getByRole("button");
      fireEvent.click(header);

      expect(setBodyIsOpen).toHaveBeenCalledWith(expect.any(Function));
    });

    it("shows collapsed state correctly", () => {
      render(<Header {...defaultHeaderProps} bodyIsOpen={false} />);
      // In collapsed state, the header should still show the score indicator
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });
  });

  describe("Score Display States", () => {
    it("shows passing score correctly", () => {
      mockUseWidgetPassportScore.mockReturnValue({
        ...defaultMockResult,
        data: {
          ...defaultScoreData,
          score: 25,
          passingScore: true,
        },
      });

      render(<Header {...defaultHeaderProps} />);
      expect(screen.getByText("25")).toBeInTheDocument();
    });

    it("shows failing score correctly", () => {
      mockUseWidgetPassportScore.mockReturnValue({
        ...defaultMockResult,
        data: {
          ...defaultScoreData,
          score: 15,
          passingScore: false,
        },
      });

      render(<Header {...defaultHeaderProps} />);
      expect(screen.getByText("15")).toBeInTheDocument();
    });

    it("shows loading icon when querying", () => {
      mockUseWidgetIsQuerying.mockReturnValue(true);

      render(<Header {...defaultHeaderProps} />);
      // Loading icon should be an SVG
      const loadingIcon = document.querySelector("svg");
      expect(loadingIcon).toBeInTheDocument();
    });

    it("does not show score when no data", () => {
      mockUseWidgetPassportScore.mockReturnValue({
        ...defaultMockResult,
        data: undefined,
      });

      render(<Header {...defaultHeaderProps} />);
      // Should not have progressbar when no data
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles undefined score gracefully", () => {
      mockUseWidgetPassportScore.mockReturnValue({
        ...defaultMockResult,
        data: {
          ...defaultScoreData,
          score: undefined as any,
        },
      });

      render(<Header {...defaultHeaderProps} />);
      // Should render without crashing
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("handles very large scores", () => {
      mockUseWidgetPassportScore.mockReturnValue({
        ...defaultMockResult,
        data: {
          ...defaultScoreData,
          score: 999999,
          threshold: 20,
        },
      });

      render(<Header {...defaultHeaderProps} />);
      const progressbar = screen.getByRole("progressbar");
      // Should still cap at 360 degrees
      expect(progressbar).toHaveStyle({
        background: expect.stringContaining("360deg"),
      });
    });

    it("handles negative scores", () => {
      mockUseWidgetPassportScore.mockReturnValue({
        ...defaultMockResult,
        data: {
          ...defaultScoreData,
          score: -5,
          threshold: 20,
        },
      });

      render(<Header {...defaultHeaderProps} />);
      const progressbar = screen.getByRole("progressbar");
      // Negative scores should be treated as 0
      expect(progressbar).toHaveStyle({
        background: expect.stringContaining(`0deg`),
      });
    });

    it("handles zero threshold gracefully", () => {
      mockUseWidgetPassportScore.mockReturnValue({
        ...defaultMockResult,
        data: {
          ...defaultScoreData,
          score: 10,
          threshold: 0,
        },
      });

      render(<Header {...defaultHeaderProps} />);
      // Should render without dividing by zero errors
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });
  });
});