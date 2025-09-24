import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { StampClaimResult } from "../../src/components/Body/StampClaimResult";
import * as usePlatformStatus from "../../src/hooks/usePlatformStatus";
import { Platform } from "../../src/hooks/stampTypes";
import { CredentialError } from "../../src/hooks/usePassportScore";

jest.mock("../../src/hooks/usePlatformStatus");

jest.mock("../../src/components/Tooltip", () => ({
  Tooltip: ({ children, content }: { children: React.ReactNode; content: string }) => (
    <div>
      {children}
      <span>{content}</span>
    </div>
  ),
}));

describe("StampClaimResult", () => {
  const mockPlatform: Platform = {
    platformId: "Google",
    name: "Google",
    description: <div>Verify your Google account</div>,
    documentationLink: "https://docs.example.com/google",
    icon: <span>📧</span>,
    credentials: [{ id: "google", weight: "1" }],
    requiresSignature: false,
    requiresPopup: true,
    popupUrl: "https://test.com/oauth",
    displayWeight: "1",
  };

  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Success state", () => {
    beforeEach(() => {
      (usePlatformStatus.usePlatformStatus as jest.Mock).mockReturnValue({
        claimed: true,
      });
    });

    it("renders success message when stamp is claimed", () => {
      render(<StampClaimResult platform={mockPlatform} onBack={mockOnBack} />);

      expect(screen.getByText("Congratulations!")).toBeInTheDocument();
      expect(screen.getByText(/You've verified credentials within/)).toBeInTheDocument();
      expect(screen.getByText(/the Google Stamp/)).toBeInTheDocument();
    });

    it("shows happy human icon when claimed", () => {
      render(<StampClaimResult platform={mockPlatform} onBack={mockOnBack} />);

      const svgElement = screen.getByTestId("happy-human-icon");
      expect(svgElement).toBeInTheDocument();
    });

    it("does not show learn more link when claimed", () => {
      render(<StampClaimResult platform={mockPlatform} onBack={mockOnBack} />);

      expect(screen.queryByText("Learn more")).not.toBeInTheDocument();
    });
  });

  describe("Failure state", () => {
    beforeEach(() => {
      (usePlatformStatus.usePlatformStatus as jest.Mock).mockReturnValue({
        claimed: false,
      });
    });

    it("renders failure message when stamp is not claimed", () => {
      render(<StampClaimResult platform={mockPlatform} onBack={mockOnBack} />);

      expect(screen.getByText("Stamp Verification Unsuccessful")).toBeInTheDocument();
      expect(screen.getByText("Please try verifying another Stamp")).toBeInTheDocument();
    });

    it("shows ambivalent human icon when not claimed", () => {
      render(<StampClaimResult platform={mockPlatform} onBack={mockOnBack} />);

      const svgElement = screen.getByTestId("ambivalent-human-icon");
      expect(svgElement).toBeInTheDocument();
    });

    it("shows learn more with tooltip icon when not claimed and no errors", () => {
      render(<StampClaimResult platform={mockPlatform} onBack={mockOnBack} />);

      expect(screen.getByText("Learn more")).toBeInTheDocument();
      const tooltipIcon = screen.getByTestId("tooltip-icon");
      expect(tooltipIcon).toBeInTheDocument();
    });

    it("shows credential errors when errors are provided", () => {
      // Mock as not claimed to show error state
      (usePlatformStatus.usePlatformStatus as jest.Mock).mockReturnValue({
        claimed: false,
        pointsGained: "0",
      });

      const credentialErrors: CredentialError[] = [
        { provider: "Google", error: "Account not eligible" },
        { provider: "Google", error: "Verification timeout" },
      ];

      render(<StampClaimResult platform={mockPlatform} onBack={mockOnBack} errors={credentialErrors} />);

      // Should show "See Details" button
      const seeDetailsButton = screen.getByText("See Details ➜");
      expect(seeDetailsButton).toBeInTheDocument();

      // Click to see error details
      fireEvent.click(seeDetailsButton);

      // Should show error section with counter
      expect(screen.getByText(/Errors/)).toBeInTheDocument();
      expect(screen.getByText("1/2")).toBeInTheDocument();  // Error counter

      // Should display first error by default - wrapped in Tooltip which shows it twice (once as child, once as content)
      const errorTexts = screen.getAllByText("Account not eligible");
      expect(errorTexts.length).toBeGreaterThan(0);
    });

    it("shows empty tooltip when not claimed and empty errors array", () => {
      const credentialErrors: CredentialError[] = [];

      render(<StampClaimResult platform={mockPlatform} onBack={mockOnBack} errors={credentialErrors} />);

      expect(screen.getByText("Learn more")).toBeInTheDocument();
      const tooltipIcon = screen.getByTestId("tooltip-icon");
      expect(tooltipIcon).toBeInTheDocument();
    });
  });

  describe("Back button", () => {
    it("renders back to stamps button", () => {
      (usePlatformStatus.usePlatformStatus as jest.Mock).mockReturnValue({
        claimed: true,
      });

      render(<StampClaimResult platform={mockPlatform} onBack={mockOnBack} />);

      expect(screen.getByText("Back to Stamps")).toBeInTheDocument();
    });

    it("calls onBack when back button is clicked", () => {
      (usePlatformStatus.usePlatformStatus as jest.Mock).mockReturnValue({
        claimed: true,
      });

      render(<StampClaimResult platform={mockPlatform} onBack={mockOnBack} />);

      fireEvent.click(screen.getByText("Back to Stamps"));
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe("Platform header", () => {
    it("renders platform header with platform name", () => {
      (usePlatformStatus.usePlatformStatus as jest.Mock).mockReturnValue({
        claimed: true,
      });

      render(<StampClaimResult platform={mockPlatform} onBack={mockOnBack} />);

      expect(screen.getByText("Google")).toBeInTheDocument();
    });
  });

  describe("Blur effect", () => {
    it("applies different blur color based on claimed status", () => {
      const { rerender } = render(<StampClaimResult platform={mockPlatform} onBack={mockOnBack} />);

      (usePlatformStatus.usePlatformStatus as jest.Mock).mockReturnValue({
        claimed: false,
      });
      rerender(<StampClaimResult platform={mockPlatform} onBack={mockOnBack} />);

      const blurElement = document.querySelector('.blurEffect');
      expect(blurElement).toHaveClass('altBlurColor');

      (usePlatformStatus.usePlatformStatus as jest.Mock).mockReturnValue({
        claimed: true,
      });
      rerender(<StampClaimResult platform={mockPlatform} onBack={mockOnBack} />);

      const blurElementSuccess = document.querySelector('.blurEffect');
      expect(blurElementSuccess).not.toHaveClass('altBlurColor');
    });
  });
});