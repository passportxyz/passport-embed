import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Body } from "../../src/components/Body";
import {
  useResetWidgetPassportScore,
  useWidgetPassportScore,
} from "../../src/hooks/usePassportScore";

// Mock the custom hook
jest.mock("../../src/hooks/usePassportScore");
const mockUseWidgetPassportScore = useWidgetPassportScore as jest.Mock;
const mockUseResetWidgetPassportScore =
  useResetWidgetPassportScore as jest.Mock;

describe("Body Routing", () => {
  const defaultProps = {
    connectWalletCallback: jest.fn(),
    generateSignatureCallback: jest.fn(),
    isOpen: true,
    collapseMode: "off" as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders ErrorBody when there is an error", () => {
    mockUseWidgetPassportScore.mockReturnValue({
      isError: true,
      error: new Error("Test error"),
      isLoading: false,
      data: null,
    });

    const mockResetPassportScore = jest.fn();
    mockUseResetWidgetPassportScore.mockReturnValue({
      resetPassportScore: mockResetPassportScore,
    });

    render(<Body {...defaultProps} />);
    expect(screen.getByText("Test error")).toBeInTheDocument();

    const button = screen.getByRole("button", { name: "Try Again" });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    waitFor(() => expect(mockResetPassportScore).toHaveBeenCalled());
  });

  it("renders CongratsBody when score is passing", () => {
    mockUseWidgetPassportScore.mockReturnValue({
      isError: false,
      error: null,
      isLoading: false,
      data: { passingScore: true },
    });

    render(<Body {...defaultProps} />);
    expect(
      screen.getByText("You have proven your unique humanity. Please proceed!")
    ).toBeInTheDocument();
  });

  it("renders ScoreTooLowBody when score is not passing", () => {
    mockUseWidgetPassportScore.mockReturnValue({
      isError: false,
      error: null,
      isLoading: false,
      data: { passingScore: false },
    });

    render(<Body {...defaultProps} />);
    expect(
      screen.getByText("Your score is too low to participate.")
    ).toBeInTheDocument();
  });

  it("renders CheckingBody when showLoading is true", () => {
    mockUseWidgetPassportScore.mockReturnValue({
      isError: false,
      error: null,
      isLoading: false,
      data: null,
    });

    render(<Body {...defaultProps} showLoading={true} />);
    expect(
      screen.getByRole("button", { name: "Verifying..." })
    ).toBeInTheDocument();
  });

  describe("renders ConnectWalletBody by default", () => {
    it("allows connect when connectWalletCallback defined", () => {
      mockUseWidgetPassportScore.mockReturnValue({
        isError: false,
        error: null,
        isLoading: false,
        data: null,
      });

      render(<Body {...defaultProps} connectWalletCallback={async () => {}} />);

      expect(
        screen.getByText("Connect your wallet", { exact: false })
      ).toBeInTheDocument();

      const button = screen.getByRole("button", { name: "Connect Wallet" });
      expect(button).toBeInTheDocument();

      fireEvent.click(button);

      waitFor(() =>
        expect(
          screen.getByRole("button", { name: "Connecting..." })
        ).toBeInTheDocument()
      );
    });

    it("requests connect when connectWalletCallback undefined", async () => {
      mockUseWidgetPassportScore.mockReturnValue({
        isError: false,
        error: null,
        isLoading: false,
        data: null,
      });

      render(<Body {...defaultProps} connectWalletCallback={undefined} />);

      expect(
        screen.getByText("Connect to the dapp", { exact: false })
      ).toBeInTheDocument();

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });
});

describe("Body", () => {
  const defaultProps = {
    isOpen: true,
    collapseMode: "off" as const,
    connectWalletCallback: jest.fn(),
    generateSignatureCallback: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseWidgetPassportScore.mockReturnValue({
      isError: false,
      error: null,
      isLoading: false,
      data: null,
    });
  });

  it("applies correct classes when expanded", () => {
    const { container } = render(<Body {...defaultProps} />);
    expect(container.firstChild).toHaveClass("expanded");
    expect(container.firstChild).not.toHaveClass("collapsed");
  });

  it("applies correct classes when collapsed", async () => {
    const { container } = render(
      <Body {...defaultProps} isOpen={false} collapseMode="shift" />
    );
    expect(container.firstChild).toHaveClass("collapsed");
    expect(container.firstChild).not.toHaveClass("expanded");
  });

  it("applies overlay class when collapseMode is overlay", () => {
    const { container } = render(
      <Body {...defaultProps} collapseMode="overlay" />
    );
    expect(container.firstChild).toHaveClass("overlay");
  });

  it("applies custom className when provided", () => {
    const { container } = render(
      <Body {...defaultProps} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
