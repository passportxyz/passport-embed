import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PlatformVerification } from "../../src/components/Body/PlatformVerification";
import * as usePassportScore from "../../src/hooks/usePassportScore";
import * as usePlatformStatus from "../../src/hooks/usePlatformStatus";
import * as useQueryContext from "../../src/hooks/useQueryContext";
import * as usePlatformDeduplication from "../../src/hooks/usePlatformDeduplication";
import {
  mockExpectedConsoleErrorLog,
  setupTestQueryClient,
} from "../testUtils";
import { Platform } from "../../src/hooks/useStampPages";

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
      "https://test.com/embed/challenge",
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
      (useQueryContext.useQueryContext as jest.Mock).mockReturnValue({
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

      expect(screen.getByText("⚠️ Already Claimed")).toBeInTheDocument();
      expect(
        screen.getByText(/Some stamps for this platform were already claimed by another wallet address/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/You can still verify to confirm your eligibility/)
      ).toBeInTheDocument();
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

      expect(screen.queryByText("⚠️ Already Claimed")).not.toBeInTheDocument();
      expect(
        screen.queryByText(/Some stamps for this platform were already claimed/)
      ).not.toBeInTheDocument();
    });

    it("should show deduplication notice above description section", () => {
      (usePlatformDeduplication.usePlatformDeduplication as jest.Mock).mockReturnValue(true);

      const { container } = render(
        <PlatformVerification
          platform={mockPlatform}
          onClose={mockOnClose}
          generateSignatureCallback={mockGenerateSignature}
        />
      );

      const deduplicationNotice = container.querySelector('.deduplicationNotice');
      const descriptionSection = screen.getByText("Verify your LinkedIn account").closest('div');
      
      expect(deduplicationNotice).toBeInTheDocument();
      expect(descriptionSection).toBeInTheDocument();
      
      // Check that deduplication notice appears before description in DOM order
      if (deduplicationNotice && descriptionSection) {
        expect(deduplicationNotice.compareDocumentPosition(descriptionSection))
          .toBe(Node.DOCUMENT_POSITION_FOLLOWING);
      }
    });

    it("should show deduplication notice even when platform is already claimed", () => {
      (usePlatformDeduplication.usePlatformDeduplication as jest.Mock).mockReturnValue(true);
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

      expect(screen.getByText("⚠️ Already Claimed")).toBeInTheDocument();
      expect(screen.getByText("Already Verified")).toBeInTheDocument();
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
});
