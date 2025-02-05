import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PlatformVerification } from "../../src/components/Body/PlatformVerification";
import * as usePassportScore from "../../src/hooks/usePassportScore";
import * as usePlatformStatus from "../../src/hooks/usePlatformStatus";
import * as QueryContext from "../../src/contexts/QueryContext";
import {
  mockExpectedConsoleErrorLog,
  setupTestQueryClient,
} from "../testUtils";
import { Platform } from "../../src/hooks/useStampPages";

// Mock the hooks
jest.mock("../../src/hooks/usePassportScore");
jest.mock("../../src/hooks/usePlatformStatus");
jest.mock("../../src/contexts/QueryContext");

// Mock fetch
global.fetch = jest.fn();

describe("PlatformVerification", () => {
  setupTestQueryClient();

  // Common test props
  const mockPlatform: Platform = {
    name: "LinkedIn",
    description: <div>Verify your LinkedIn account</div>,
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
    (usePassportScore.useWidgetVerifyCredentials as jest.Mock).mockReturnValue({
      verifyCredentials: jest.fn(),
    });
    (usePassportScore.useWidgetIsQuerying as jest.Mock).mockReturnValue(false);
    (usePlatformStatus.usePlatformStatus as jest.Mock).mockReturnValue({
      claimed: false,
    });
    (QueryContext.useQueryContext as jest.Mock).mockReturnValue({
      address: "0x123",
      challengeSignatureUrl: "https://test.com/challenge",
      oAuthPopUpUrl: "https://test.com/oauth",
    });

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
    expect(
      screen.getByText("Verify your LinkedIn account")
    ).toBeInTheDocument();
  });

  it("handles close button click", () => {
    render(
      <PlatformVerification
        platform={mockPlatform}
        onClose={mockOnClose}
        generateSignatureCallback={mockGenerateSignature}
      />
    );

    fireEvent.click(screen.getByTestId("close-platform-button"));
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

    expect(screen.getByText("Verifying...")).toBeInTheDocument();
  });

  it("shows already verified state when claimed", () => {
    (usePlatformStatus.usePlatformStatus as jest.Mock).mockReturnValue({
      claimed: true,
    });

    render(
      <PlatformVerification
        platform={mockPlatform}
        onClose={mockOnClose}
        generateSignatureCallback={mockGenerateSignature}
      />
    );

    expect(screen.getByText("Already Verified")).toBeInTheDocument();
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
    expect(global.fetch).toHaveBeenCalledWith(
      "https://test.com/challenge",
      expect.any(Object)
    );
  });

  it("handles verification failure state", async () => {
    // Mock failing verification
    const mockVerifyCredentials = jest.fn();
    (usePassportScore.useWidgetVerifyCredentials as jest.Mock).mockReturnValue({
      verifyCredentials: mockVerifyCredentials,
    });
    (usePassportScore.useWidgetIsQuerying as jest.Mock).mockReturnValueOnce(
      false
    );

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

    // Click verify button
    fireEvent.click(screen.getByRole("button", { name: /verify/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Unable to claim this Stamp/i)
      ).toBeInTheDocument();
      expect(screen.getByText("Try Again")).toBeInTheDocument();
    });
  });

  describe("Errors", () => {
    mockExpectedConsoleErrorLog();

    it("handles missing address error", async () => {
      // Mock missing address in context
      (QueryContext.useQueryContext as jest.Mock).mockReturnValue({
        address: null,
      });

      const mockVerifyCredentials = jest.fn();
      (
        usePassportScore.useWidgetVerifyCredentials as jest.Mock
      ).mockReturnValue({
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
        expect(
          screen.getByText(/Unable to claim this Stamp/i)
        ).toBeInTheDocument();
      });

      expect(mockVerifyCredentials).not.toHaveBeenCalled();
    });
  });
});
