import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PlatformVerification } from "../../src/components/Body/PlatformVerification";
import * as usePassportScore from "../../src/hooks/usePassportScore";
import * as usePlatformStatus from "../../src/hooks/usePlatformStatus";
import * as useQueryContext from "../../src/hooks/useQueryContext";
import * as usePlatformDeduplication from "../../src/hooks/usePlatformDeduplication";
import { mockExpectedConsoleErrorLog, setupTestQueryClient } from "../testUtils";
import { Platform } from "../../src/hooks/stampTypes";

// Mock the hooks
jest.mock("../../src/hooks/usePassportScore");
jest.mock("../../src/hooks/usePlatformStatus");
jest.mock("../../src/hooks/useQueryContext");
jest.mock("../../src/hooks/usePlatformDeduplication");

// Mock fetch
global.fetch = jest.fn();

describe("PlatformVerification", () => {
  setupTestQueryClient();

  // Common test props
  const mockPlatform: Platform = {
    platformId: "LinkedIn",
    name: "LinkedIn",
    description: <div>Verify your LinkedIn account</div>,
    icon: <span>📧</span>,
    credentials: [{ id: "linkedin", weight: "1" }],
    requiresSignature: true,
    requiresPopup: true,
    popupUrl: "https://test.com/oauth",
    documentationLink: "https://docs.example.com",
    displayWeight: "1",
  };

  const mockOnClose = jest.fn();
  const mockGenerateSignature = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    (usePassportScore.useWidgetPassportScore as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });
    (usePassportScore.useWidgetVerifyCredentials as jest.Mock).mockReturnValue({
      verifyCredentials: jest.fn(),
    });
    (usePassportScore.useWidgetIsQuerying as jest.Mock).mockReturnValue(false);
    (usePlatformStatus.usePlatformStatus as jest.Mock).mockReturnValue({
      claimed: false,
    });
    (useQueryContext.useQueryContext as jest.Mock).mockReturnValue({
      address: "0x123",
      embedServiceUrl: "https://test.com",
    });
    (usePlatformDeduplication.usePlatformDeduplication as jest.Mock).mockReturnValue(false);

    // Mock window.open
    window.open = jest.fn();
  });

  it("renders platform name and description", () => {
    render(
      <PlatformVerification
        platform={mockPlatform}
        onClose={mockOnClose}
        generateSignatureCallback={mockGenerateSignature}
      />
    );

    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
    expect(screen.getByText("Verify your LinkedIn account")).toBeInTheDocument();
  });

  it("handles close button click", () => {
    render(
      <PlatformVerification
        platform={mockPlatform}
        onClose={mockOnClose}
        generateSignatureCallback={mockGenerateSignature}
      />
    );

    // The back button is rendered as a TextButton with an SVG icon
    const backButton = screen.getByRole('button', { name: '' });
    fireEvent.click(backButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("shows verification in progress state", () => {
    (usePassportScore.useWidgetIsQuerying as jest.Mock).mockReturnValue(true);

    render(
      <PlatformVerification
        platform={mockPlatform}
        onClose={mockOnClose}
        generateSignatureCallback={mockGenerateSignature}
      />
    );

    // The button shows "Verify" with a checkmark icon when not clicked
    expect(screen.getByText("Verify")).toBeInTheDocument();
    // The button is disabled when verification is pending
    const verifyButton = screen.getByRole('button', { name: /verify/i });
    expect(verifyButton).toBeDisabled();
  });

  it("shows already verified state when claimed", () => {
    (usePlatformStatus.usePlatformStatus as jest.Mock).mockReturnValue({
      claimed: true,
      pointsGained: "5",
    });

    render(
      <PlatformVerification
        platform={mockPlatform}
        onClose={mockOnClose}
        generateSignatureCallback={mockGenerateSignature}
      />
    );

    expect(screen.getByText("Congratulations!")).toBeInTheDocument();
    expect(screen.getByText(/You've verified credentials within/)).toBeInTheDocument();
  });

  it("handles OAuth popup flow", async () => {
    (window.open as jest.Mock).mockReturnValue({ closed: false });

    // Mock fetch for challenge response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          credential: {
            credentialSubject: {
              challenge: "test-challenge",
            },
          },
        }),
    });

    mockGenerateSignature.mockResolvedValueOnce("test-signature");

    render(
      <PlatformVerification
        platform={mockPlatform}
        onClose={mockOnClose}
        generateSignatureCallback={mockGenerateSignature}
      />
    );

    // Click verify button
    fireEvent.click(screen.getByRole("button", { name: /verify/i }));

    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining("https://test.com/oauth"),
        "passportPopup",
        expect.any(String)
      );
    });

    // Verify challenge fetch was called
    expect(global.fetch).toHaveBeenCalledWith("https://test.com/embed/challenge", expect.any(Object));
  });

  it("handles verification failure state", async () => {
    // Mock failing verification
    const mockVerifyCredentials = jest.fn();
    (usePassportScore.useWidgetVerifyCredentials as jest.Mock).mockReturnValue({
      verifyCredentials: mockVerifyCredentials,
    });

    // Simulate query lifecycle: false -> true -> false
    const isQueryingMock = jest.fn();
    isQueryingMock.mockReturnValueOnce(false); // Initial state
    isQueryingMock.mockReturnValueOnce(false); // After click
    isQueryingMock.mockReturnValueOnce(true); // Query starts
    isQueryingMock.mockReturnValue(false); // Query ends
    (usePassportScore.useWidgetIsQuerying as jest.Mock).mockImplementation(isQueryingMock);

    const { rerender } = render(
      <PlatformVerification
        platform={{
          ...mockPlatform,
          requiresSignature: false,
          requiresPopup: false,
        }}
        onClose={mockOnClose}
        generateSignatureCallback={mockGenerateSignature}
      />
    );

    // Click verify button
    fireEvent.click(screen.getByRole("button", { name: /verify/i }));

    // Force re-renders to trigger the useEffect with different isQuerying values
    rerender(
      <PlatformVerification
        platform={{
          ...mockPlatform,
          requiresSignature: false,
          requiresPopup: false,
        }}
        onClose={mockOnClose}
        generateSignatureCallback={mockGenerateSignature}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Stamp Verification Unsuccessful/i)).toBeInTheDocument();
      expect(screen.getByText(/Please try verifying another Stamp/i)).toBeInTheDocument();
    });
  });

  describe("Errors", () => {
    mockExpectedConsoleErrorLog();

    it("handles missing address error", async () => {
      // Mock missing address in context
      (useQueryContext.useQueryContext as jest.Mock).mockReturnValue({
        address: null,
      });

      const mockVerifyCredentials = jest.fn();
      (usePassportScore.useWidgetVerifyCredentials as jest.Mock).mockReturnValue({
        verifyCredentials: mockVerifyCredentials,
      });

      render(
        <PlatformVerification
          platform={mockPlatform}
          onClose={mockOnClose}
          generateSignatureCallback={mockGenerateSignature}
        />
      );

      // Click verify button
      fireEvent.click(screen.getByRole("button", { name: /verify/i }));

      await waitFor(() => {
        expect(screen.getByText(/Stamp Verification Unsuccessful/i)).toBeInTheDocument();
      });

      expect(mockVerifyCredentials).not.toHaveBeenCalled();
    });
  });

  describe("Configuration Error", () => {
    it("should show configuration error when signature is required but callback is not provided", () => {
      render(
        <PlatformVerification platform={mockPlatform} onClose={mockOnClose} generateSignatureCallback={undefined} />
      );

      expect(
        screen.getByText(/Something's missing! This Stamp needs an extra setup step to work properly/)
      ).toBeInTheDocument();
      expect(screen.getByText("Go Back")).toBeInTheDocument();
    });

    it("should handle Go Back button click when configuration error is shown", () => {
      render(
        <PlatformVerification platform={mockPlatform} onClose={mockOnClose} generateSignatureCallback={undefined} />
      );

      fireEvent.click(screen.getByText("Go Back"));
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should not show configuration error when signature is not required", () => {
      render(
        <PlatformVerification
          platform={{
            ...mockPlatform,
            requiresSignature: false,
          }}
          onClose={mockOnClose}
          generateSignatureCallback={undefined}
        />
      );

      expect(
        screen.queryByText(/Something's missing! This Stamp needs an extra setup step to work properly/)
      ).not.toBeInTheDocument();
      expect(screen.getByText("Verify your LinkedIn account")).toBeInTheDocument();
    });

    it("should not show configuration error when callback is provided", () => {
      render(
        <PlatformVerification
          platform={mockPlatform}
          onClose={mockOnClose}
          generateSignatureCallback={mockGenerateSignature}
        />
      );

      expect(
        screen.queryByText(/Something's missing! This Stamp needs an extra setup step to work properly/)
      ).not.toBeInTheDocument();
      expect(screen.getByText("Verify your LinkedIn account")).toBeInTheDocument();
    });
  });

  describe("Platform Deduplication", () => {
    it("should show deduplication notice when platform has deduplicated stamps", () => {
      (usePlatformDeduplication.usePlatformDeduplication as jest.Mock).mockReturnValue(true);

      render(
        <PlatformVerification
          platform={mockPlatform}
          onClose={mockOnClose}
          generateSignatureCallback={mockGenerateSignature}
        />
      );

      expect(screen.getByText("⚠️")).toBeInTheDocument();
      expect(screen.getByText("Already claimed elsewhere")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Already claimed elsewhere" })).toHaveAttribute(
        "href",
        "https://support.passport.xyz/passport-knowledge-base/common-questions/why-am-i-receiving-zero-points-for-a-verified-stamp"
      );
    });

    it("should not show deduplication notice when platform has no deduplicated stamps", () => {
      (usePlatformDeduplication.usePlatformDeduplication as jest.Mock).mockReturnValue(false);

      render(
        <PlatformVerification
          platform={mockPlatform}
          onClose={mockOnClose}
          generateSignatureCallback={mockGenerateSignature}
        />
      );

      expect(screen.queryByText("Already claimed elsewhere")).not.toBeInTheDocument();
    });

    it("should show deduplication notice in the description section", () => {
      (usePlatformDeduplication.usePlatformDeduplication as jest.Mock).mockReturnValue(true);

      render(
        <PlatformVerification
          platform={mockPlatform}
          onClose={mockOnClose}
          generateSignatureCallback={mockGenerateSignature}
        />
      );

      // Both deduplication notice and description should be in the same scrollable section
      expect(screen.getByText("⚠️")).toBeInTheDocument();
      expect(screen.getByText("Already claimed elsewhere")).toBeInTheDocument();
      expect(screen.getByText("Verify your LinkedIn account")).toBeInTheDocument();
    });

    it("should show deduplication notice even when platform is already claimed", () => {
      (usePlatformDeduplication.usePlatformDeduplication as jest.Mock).mockReturnValue(true);
      (usePlatformStatus.usePlatformStatus as jest.Mock).mockReturnValue({
        claimed: true,
        pointsGained: "5",
      });

      render(
        <PlatformVerification
          platform={mockPlatform}
          onClose={mockOnClose}
          generateSignatureCallback={mockGenerateSignature}
        />
      );

      // When claimed, it shows StampClaimResult with Congratulations
      expect(screen.getByText("Congratulations!")).toBeInTheDocument();
      expect(screen.getByText(/You've verified credentials within/)).toBeInTheDocument();

      // Note: Deduplication notice is not shown in the success state
    });

    it("should call usePlatformDeduplication with correct platform parameter", () => {
      const mockUsePlatformDeduplication = usePlatformDeduplication.usePlatformDeduplication as jest.Mock;

      render(
        <PlatformVerification
          platform={mockPlatform}
          onClose={mockOnClose}
          generateSignatureCallback={mockGenerateSignature}
        />
      );

      expect(mockUsePlatformDeduplication).toHaveBeenCalledWith({
        platform: mockPlatform,
      });
    });
  });

  describe("Credential Error Handling", () => {
    it("should pass credential errors to StampClaimResult when verification fails with errors", async () => {
      const mockCredentialErrors = [
        { provider: "LinkedIn", error: "Account not eligible" },
        { provider: "LinkedIn", error: "Verification failed" },
      ];

      const mockVerifyCredentials = jest.fn();
      (usePassportScore.useWidgetVerifyCredentials as jest.Mock).mockReturnValue({
        verifyCredentials: mockVerifyCredentials,
        credentialErrors: mockCredentialErrors,
      });

      // Simulate query lifecycle: false -> true -> false (completed)
      const isQueryingMock = jest.fn();
      isQueryingMock.mockReturnValueOnce(false);
      isQueryingMock.mockReturnValueOnce(false);
      isQueryingMock.mockReturnValueOnce(true);
      isQueryingMock.mockReturnValue(false);
      (usePassportScore.useWidgetIsQuerying as jest.Mock).mockImplementation(isQueryingMock);

      const { rerender } = render(
        <PlatformVerification
          platform={{
            ...mockPlatform,
            requiresSignature: false,
            requiresPopup: false,
          }}
          onClose={mockOnClose}
          generateSignatureCallback={mockGenerateSignature}
        />
      );

      // Click verify button
      fireEvent.click(screen.getByRole("button", { name: /verify/i }));

      // Force re-renders to simulate query completion
      rerender(
        <PlatformVerification
          platform={{
            ...mockPlatform,
            requiresSignature: false,
            requiresPopup: false,
          }}
          onClose={mockOnClose}
          generateSignatureCallback={mockGenerateSignature}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Stamp Verification Unsuccessful/)).toBeInTheDocument();
      });
    });

    it("should display generic error when verification fails without credential errors", async () => {
      const mockVerifyCredentials = jest.fn();
      const mockError = new Error("Network error");
      (usePassportScore.useWidgetVerifyCredentials as jest.Mock).mockReturnValue({
        verifyCredentials: mockVerifyCredentials,
        error: mockError,
        credentialErrors: undefined,
      });

      // Simulate query lifecycle
      const isQueryingMock = jest.fn();
      isQueryingMock.mockReturnValueOnce(false);
      isQueryingMock.mockReturnValueOnce(false);
      isQueryingMock.mockReturnValueOnce(true);
      isQueryingMock.mockReturnValue(false);
      (usePassportScore.useWidgetIsQuerying as jest.Mock).mockImplementation(isQueryingMock);

      const { rerender } = render(
        <PlatformVerification
          platform={{
            ...mockPlatform,
            requiresSignature: false,
            requiresPopup: false,
          }}
          onClose={mockOnClose}
          generateSignatureCallback={mockGenerateSignature}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: /verify/i }));

      rerender(
        <PlatformVerification
          platform={{
            ...mockPlatform,
            requiresSignature: false,
            requiresPopup: false,
          }}
          onClose={mockOnClose}
          generateSignatureCallback={mockGenerateSignature}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Stamp Verification Unsuccessful/)).toBeInTheDocument();
      });
    });

    it("should pass pre-verification error when validation fails", async () => {
      // Mock missing address to trigger pre-verification error
      (useQueryContext.useQueryContext as jest.Mock).mockReturnValue({
        address: null,
        embedServiceUrl: "https://test.com",
      });

      const mockVerifyCredentials = jest.fn();
      (usePassportScore.useWidgetVerifyCredentials as jest.Mock).mockReturnValue({
        verifyCredentials: mockVerifyCredentials,
        credentialErrors: undefined,
      });

      render(
        <PlatformVerification
          platform={{
            ...mockPlatform,
            requiresSignature: false,
            requiresPopup: false,
          }}
          onClose={mockOnClose}
          generateSignatureCallback={mockGenerateSignature}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: /verify/i }));

      // With requiresSignature false and requiresPopup false, it calls verifyCredentials directly
      // even with no address (the API will handle the error)
      expect(mockVerifyCredentials).toHaveBeenCalledWith(["linkedin"]);

      // Since there's no verification result, it stays in the initial state
      expect(screen.getByRole("button", { name: /verify/i })).toBeInTheDocument();
    });
  });
});
