import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBody } from "../../../src/components/Body/ErrorBody";
import { useResetWidgetPassportScore } from "../../../src/hooks/usePassportScore";

// Mock the useResetWidgetPassportScore hook
jest.mock("../../../src/hooks/usePassportScore");
const mockUseResetWidgetPassportScore = useResetWidgetPassportScore as jest.Mock;

describe("ErrorBody", () => {
  const mockResetPassportScore = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseResetWidgetPassportScore.mockReturnValue({
      resetPassportScore: mockResetPassportScore,
    });
  });

  it("renders error message", () => {
    const error = new Error("Test error message");
    render(<ErrorBody error={error} />);
    expect(screen.getByText("Test error message")).toBeInTheDocument();
  });

  it("renders string error message", () => {
    render(<ErrorBody error="String error message" />);
    expect(screen.getByText("An error occurred")).toBeInTheDocument();
  });

  it("renders try again button", () => {
    const error = new Error("Test error");
    render(<ErrorBody error={error} />);
    expect(screen.getByRole("button", { name: "Try Again" })).toBeInTheDocument();
  });

  it("calls resetPassportScore when try again button is clicked", () => {
    const error = new Error("Test error");
    render(<ErrorBody error={error} />);
    
    const tryAgainButton = screen.getByRole("button", { name: "Try Again" });
    fireEvent.click(tryAgainButton);
    
    expect(mockResetPassportScore).toHaveBeenCalledTimes(1);
  });

  it("handles error with message property", () => {
    const error = { message: "Error with message property" };
    render(<ErrorBody error={error} />);
    expect(screen.getByText("An error occurred")).toBeInTheDocument();
  });

  it("handles error without message property", () => {
    const error = { toString: () => "Error without message" };
    render(<ErrorBody error={error} />);
    expect(screen.getByText("An error occurred")).toBeInTheDocument();
  });

  it("handles null error gracefully", () => {
    render(<ErrorBody error={null} />);
    expect(screen.getByRole("button", { name: "Try Again" })).toBeInTheDocument();
  });

  it("handles undefined error gracefully", () => {
    render(<ErrorBody error={undefined} />);
    expect(screen.getByRole("button", { name: "Try Again" })).toBeInTheDocument();
  });
});
