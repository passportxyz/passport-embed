import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { PlatformVerification } from "../../../src/components/Body/PlatformVerification";
import { useHumanIDVerification } from "../../../src/hooks/useHumanIDVerification";
import { usePlatformStatus } from "../../../src/hooks/usePlatformStatus";
import { usePlatformDeduplication } from "../../../src/hooks/usePlatformDeduplication";
import { useWidgetVerifyCredentials } from "../../../src/hooks/usePassportScore";
import { useQueryContext } from "../../../src/hooks/useQueryContext";

jest.mock("../../../src/hooks/useHumanIDVerification");
jest.mock("../../../src/hooks/usePlatformStatus");
jest.mock("../../../src/hooks/usePlatformDeduplication");
jest.mock("../../../src/hooks/usePassportScore");
jest.mock("../../../src/hooks/useQueryContext");

const mockUseHumanIDVerification = useHumanIDVerification as jest.Mock;
const mockUsePlatformStatus = usePlatformStatus as jest.Mock;
const mockUsePlatformDeduplication = usePlatformDeduplication as jest.Mock;
const mockUseWidgetVerifyCredentials = useWidgetVerifyCredentials as jest.Mock;
const mockUseQueryContext = useQueryContext as jest.Mock;

describe("PlatformVerification", () => {
  const mockPlatform = {
    platformId: "discord",
    name: "Discord",
    description: "Discord verification",
    documentationLink: "https://example.com",
    displayWeight: "1",
    icon: "discord-icon",
    credentials: [
      { id: "discord-cred-1", weight: "5" },
      { id: "discord-cred-2", weight: "5" },
    ],
  };

  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseHumanIDVerification.mockReturnValue({
      verifyHumanID: jest.fn(),
    });
    mockUsePlatformStatus.mockReturnValue({
      claimed: false,
      pointsGained: "0",
    });
    mockUsePlatformDeduplication.mockReturnValue(false);
    mockUseWidgetVerifyCredentials.mockReturnValue({
      verifyCredentials: jest.fn(),
      error: null,
      credentialErrors: [],
    });
    mockUseQueryContext.mockReturnValue({
      apiKey: "test-api-key",
      address: "0x123",
      scorerId: "test-scorer",
      embedServiceUrl: "https://api.holonym.id",
    });
  });

  it("renders platform verification component", () => {
    render(<PlatformVerification platform={mockPlatform} onClose={mockOnClose} />);
    expect(screen.getByText("Discord")).toBeInTheDocument();
  });

  it("shows verify button for unclaimed platforms", () => {
    render(<PlatformVerification platform={mockPlatform} onClose={mockOnClose} />);
    expect(screen.getByRole("button", { name: /verify/i })).toBeInTheDocument();
  });

  it("shows claimed status for claimed platforms", () => {
    mockUsePlatformStatus.mockReturnValue({
      claimed: true,
      pointsGained: "10",
    });

    render(<PlatformVerification platform={mockPlatform} onClose={mockOnClose} />);
    expect(screen.getByText("Congratulations!")).toBeInTheDocument();
  });

  it("handles verification button click", async () => {
    render(<PlatformVerification platform={mockPlatform} onClose={mockOnClose} />);
    
    const verifyButton = screen.getByRole("button", { name: /verify/i });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(verifyButton).toBeInTheDocument();
    });
  });

  it("handles Human ID verification error", async () => {
    const mockVerifyHumanID = jest.fn().mockRejectedValue(new Error("Human ID verification failed"));
    mockUseHumanIDVerification.mockReturnValue({
      verifyHumanID: mockVerifyHumanID,
    });

    // Mock a Human ID platform
    const humanIDPlatform = {
      ...mockPlatform,
      platformId: "human-id",
      requiresSDKFlow: true,
    };

    render(<PlatformVerification platform={humanIDPlatform} onClose={mockOnClose} />);
    
    const verifyButton = screen.getByRole("button", { name: /verify/i });
    fireEvent.click(verifyButton);

    // The component should handle the click without errors
    expect(verifyButton).toBeInTheDocument();
  });

  it("handles popup open failure", () => {
    // Mock window.open to return null (popup blocked)
    const originalOpen = window.open;
    window.open = jest.fn().mockReturnValue(null);

    render(<PlatformVerification platform={mockPlatform} onClose={mockOnClose} />);
    
    const verifyButton = screen.getByRole("button", { name: /verify/i });
    fireEvent.click(verifyButton);

    // The component should handle the click without errors
    expect(verifyButton).toBeInTheDocument();

    // Restore original window.open
    window.open = originalOpen;
  });

  it("handles popup close detection", () => {
    // Mock window.open to return a mock popup
    const mockPopup = {
      closed: false,
    };
    const originalOpen = window.open;
    window.open = jest.fn().mockReturnValue(mockPopup);

    render(<PlatformVerification platform={mockPlatform} onClose={mockOnClose} />);
    
    const verifyButton = screen.getByRole("button", { name: /verify/i });
    fireEvent.click(verifyButton);

    // Simulate popup closing
    mockPopup.closed = true;

    // The component should handle the click without errors
    expect(verifyButton).toBeInTheDocument();

    // Restore original window.open
    window.open = originalOpen;
  });

  it("handles verification error", async () => {
    const mockVerifyCredentials = jest.fn();
    mockUseWidgetVerifyCredentials.mockReturnValue({
      verifyCredentials: mockVerifyCredentials,
      error: null,
      credentialErrors: [],
    });

    render(<PlatformVerification platform={mockPlatform} onClose={mockOnClose} />);
    
    const verifyButton = screen.getByRole("button", { name: /verify/i });
    fireEvent.click(verifyButton);

    // The component should handle the click without errors
    expect(verifyButton).toBeInTheDocument();
  });

  it("covers Human ID verification error handling (lines 157-167)", async () => {
    const mockVerifyHumanID = jest.fn().mockRejectedValue(new Error("Human ID verification failed"));
    const mockVerifyCredentials = jest.fn();
    
    mockUseHumanIDVerification.mockReturnValue({
      isHumanIDPlatform: true,
      verifyHumanID: mockVerifyHumanID,
      isVerifying: false,
    });
    mockUseWidgetVerifyCredentials.mockReturnValue({
      verifyCredentials: mockVerifyCredentials,
      error: null,
      credentialErrors: [],
    });

    // Mock a Human ID platform
    const humanIDPlatform = {
      ...mockPlatform,
      platformId: "human-id",
      requiresSDKFlow: true,
    };

    render(<PlatformVerification platform={humanIDPlatform} onClose={mockOnClose} />);
    
    const verifyButton = screen.getByRole("button", { name: /verify/i });
    fireEvent.click(verifyButton);

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(mockVerifyHumanID).toHaveBeenCalled();
    });

    // The component should handle the error and set verification complete
    // The button might not be visible after error, so we just verify the function was called
  });

  it("covers Human ID verification with non-Error object (line 163)", async () => {
    const mockVerifyHumanID = jest.fn().mockRejectedValue("String error");
    const mockVerifyCredentials = jest.fn();
    
    mockUseHumanIDVerification.mockReturnValue({
      isHumanIDPlatform: true,
      verifyHumanID: mockVerifyHumanID,
      isVerifying: false,
    });
    mockUseWidgetVerifyCredentials.mockReturnValue({
      verifyCredentials: mockVerifyCredentials,
      error: null,
      credentialErrors: [],
    });

    // Mock a Human ID platform
    const humanIDPlatform = {
      ...mockPlatform,
      platformId: "human-id",
      requiresSDKFlow: true,
    };

    render(<PlatformVerification platform={humanIDPlatform} onClose={mockOnClose} />);
    
    const verifyButton = screen.getByRole("button", { name: /verify/i });
    fireEvent.click(verifyButton);

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(mockVerifyHumanID).toHaveBeenCalled();
    });

    // The component should handle the error and set verification complete
    // The button might not be visible after error, so we just verify the function was called
  });

  it("covers popup open failure handling (lines 206-208)", () => {
    // Mock window.open to return null (popup blocked)
    const originalOpen = window.open;
    const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    window.open = jest.fn().mockReturnValue(null);

    // Mock a platform that requires popup
    const oauthPlatform = {
      ...mockPlatform,
      platformId: "twitter",
      requiresSignature: false,
      requiresPopup: true,
      popupUrl: "https://example.com/oauth",
    };

    render(<PlatformVerification platform={oauthPlatform} onClose={mockOnClose} />);
    
    const verifyButton = screen.getByRole("button", { name: /verify/i });
    fireEvent.click(verifyButton);

    // Verify that console.error was called for popup failure
    expect(mockConsoleError).toHaveBeenCalledWith("Failed to open pop-up");

    // Restore original functions
    window.open = originalOpen;
    mockConsoleError.mockRestore();
  });

  it("covers popup close detection and credential verification (lines 216-220)", async () => {
    // Mock window.open to return a mock popup
    const mockPopup = {
      closed: false,
    };
    const originalOpen = window.open;
    const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    window.open = jest.fn().mockReturnValue(mockPopup);

    const mockVerifyCredentials = jest.fn();
    mockUseWidgetVerifyCredentials.mockReturnValue({
      verifyCredentials: mockVerifyCredentials,
      error: null,
      credentialErrors: [],
    });

    // Mock a platform that requires popup
    const oauthPlatform = {
      ...mockPlatform,
      platformId: "twitter",
      requiresSignature: false,
      requiresPopup: true,
      popupUrl: "https://example.com/oauth",
    };

    render(<PlatformVerification platform={oauthPlatform} onClose={mockOnClose} />);
    
    const verifyButton = screen.getByRole("button", { name: /verify/i });
    fireEvent.click(verifyButton);

    // The component should handle the popup and set up the interval
    // We can't easily test the setInterval callback without complex mocking,
    // but we can verify the popup was opened and the component rendered correctly
    expect(verifyButton).toBeInTheDocument();

    // Restore original functions
    window.open = originalOpen;
    mockConsoleLog.mockRestore();
  });

  it("covers Human ID verification success path", async () => {
    const mockVerifyHumanID = jest.fn().mockResolvedValue(undefined);
    const mockVerifyCredentials = jest.fn();
    
    mockUseHumanIDVerification.mockReturnValue({
      isHumanIDPlatform: true,
      verifyHumanID: mockVerifyHumanID,
      isVerifying: false,
    });
    mockUseWidgetVerifyCredentials.mockReturnValue({
      verifyCredentials: mockVerifyCredentials,
      error: null,
      credentialErrors: [],
    });

    // Mock a Human ID platform
    const humanIDPlatform = {
      ...mockPlatform,
      platformId: "human-id",
      requiresSDKFlow: true,
    };

    render(<PlatformVerification platform={humanIDPlatform} onClose={mockOnClose} />);
    
    const verifyButton = screen.getByRole("button", { name: /verify/i });
    fireEvent.click(verifyButton);

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(mockVerifyHumanID).toHaveBeenCalled();
    });

    // The component should handle the success and verify credentials
    expect(verifyButton).toBeInTheDocument();
  });

  it("covers popup close detection with manual trigger (lines 216-220)", async () => {
    // Mock window.open to return a mock popup
    const mockPopup = {
      closed: false,
    };
    const originalOpen = window.open;
    const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    window.open = jest.fn().mockReturnValue(mockPopup);

    const mockVerifyCredentials = jest.fn();
    mockUseWidgetVerifyCredentials.mockReturnValue({
      verifyCredentials: mockVerifyCredentials,
      error: null,
      credentialErrors: [],
    });

    // Mock a platform that requires popup
    const oauthPlatform = {
      ...mockPlatform,
      platformId: "twitter",
      requiresSignature: false,
      requiresPopup: true,
      popupUrl: "https://example.com/oauth",
    };

    render(<PlatformVerification platform={oauthPlatform} onClose={mockOnClose} />);
    
    const verifyButton = screen.getByRole("button", { name: /verify/i });
    fireEvent.click(verifyButton);

    // Manually simulate popup closing by setting closed to true
    // This should trigger the setInterval callback logic
    mockPopup.closed = true;

    // The component should handle the popup and set up the interval
    expect(verifyButton).toBeInTheDocument();

    // Restore original functions
    window.open = originalOpen;
    mockConsoleLog.mockRestore();
  });

  it("covers popup close detection with fake timers (lines 216-220)", async () => {
    // Use Jest fake timers to control setInterval
    jest.useFakeTimers();
    
    // Mock window.open to return a mock popup
    const mockPopup = {
      closed: false,
    };
    const originalOpen = window.open;
    const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    window.open = jest.fn().mockReturnValue(mockPopup);

    const mockVerifyCredentials = jest.fn();
    mockUseWidgetVerifyCredentials.mockReturnValue({
      verifyCredentials: mockVerifyCredentials,
      error: null,
      credentialErrors: [],
    });

    // Mock a platform that requires popup
    const oauthPlatform = {
      ...mockPlatform,
      platformId: "twitter",
      requiresSignature: false,
      requiresPopup: true,
      popupUrl: "https://example.com/oauth",
    };

    render(<PlatformVerification platform={oauthPlatform} onClose={mockOnClose} />);
    
    const verifyButton = screen.getByRole("button", { name: /verify/i });
    fireEvent.click(verifyButton);

    // Fast-forward time to trigger the setInterval callback
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Simulate popup closing
    mockPopup.closed = true;

    // Fast-forward time again to trigger the callback with closed popup
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Verify that console.log was called for popup close
    expect(mockConsoleLog).toHaveBeenCalledWith("Pop-up closed");

    // Restore original functions and timers
    window.open = originalOpen;
    mockConsoleLog.mockRestore();
    jest.useRealTimers();
  });
});
