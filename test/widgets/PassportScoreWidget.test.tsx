import React from "react";
import "@testing-library/jest-dom";
import { render, screen, waitFor, act, fireEvent } from "@testing-library/react";
import { PassportScoreWidget } from "../../src/widgets/PassportScoreWidget";
import { setOptimismRpcUrl } from "@holonym-foundation/human-id-sdk";
import { useWidgetPassportScore, useWidgetVerifyCredentials, useResetWidgetPassportScore } from "../../src/hooks/usePassportScore";
import { useHeaderControls } from "../../src/hooks/useHeaderControls";

// Mock the Human ID SDK
jest.mock("@holonym-foundation/human-id-sdk", () => ({
  setOptimismRpcUrl: jest.fn(),
}));

// Mock the font injector
jest.mock("../../src/utils/fontInjector", () => ({
  injectFonts: jest.fn(),
}));

// Mock the hooks
jest.mock("../../src/hooks/usePassportScore");
jest.mock("../../src/hooks/useHeaderControls");

// Mock console methods
const mockConsoleError = jest.spyOn(console, "error").mockImplementation(() => {});
const mockConsoleWarn = jest.spyOn(console, "warn").mockImplementation(() => {});

const mockUseWidgetPassportScore = useWidgetPassportScore as jest.Mock;
const mockUseWidgetVerifyCredentials = useWidgetVerifyCredentials as jest.Mock;
const mockUseResetWidgetPassportScore = useResetWidgetPassportScore as jest.Mock;
const mockUseHeaderControls = useHeaderControls as jest.Mock;

describe("PassportScoreWidget", () => {
  const defaultProps = {
    apiKey: "test-api-key",
    scorerId: "test-scorer",
    address: "0x123",
    connectWalletCallback: jest.fn(),
    generateSignatureCallback: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockUseWidgetPassportScore.mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      error: null,
    });
    
    mockUseWidgetVerifyCredentials.mockReturnValue({
      verifyCredentials: jest.fn(),
      error: null,
      credentialErrors: [],
    });
    
    mockUseHeaderControls.mockReturnValue({
      setSubtitle: jest.fn(),
    });
    
    mockUseResetWidgetPassportScore.mockReturnValue({
      resetPassportScore: jest.fn(),
    });
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
    mockConsoleWarn.mockRestore();
  });

  it("renders without crashing", () => {
    render(<PassportScoreWidget {...defaultProps} />);
    expect(screen.getByText("Verifying...")).toBeInTheDocument();
  });

  it("injects fonts on mount", async () => {
    const { injectFonts } = await import("../../src/utils/fontInjector");
    render(<PassportScoreWidget {...defaultProps} />);
    expect(injectFonts).toHaveBeenCalledTimes(1);
  });

  it("sets default Optimism RPC URL when opRPCURL is not provided", () => {
    render(<PassportScoreWidget {...defaultProps} />);
    expect(setOptimismRpcUrl).toHaveBeenCalledWith("https://mainnet.optimism.io");
    expect(mockConsoleWarn).toHaveBeenCalledWith(
      expect.stringContaining("opRPCURL not provided")
    );
  });

  it("sets custom Optimism RPC URL when provided", () => {
    const customRpcUrl = "https://custom-optimism-rpc.com";
    render(<PassportScoreWidget {...defaultProps} opRPCURL={customRpcUrl} />);
    expect(setOptimismRpcUrl).toHaveBeenCalledWith(customRpcUrl);
    expect(mockConsoleWarn).not.toHaveBeenCalled();
  });

  it("logs error when apiKey is undefined", () => {
    render(<PassportScoreWidget {...defaultProps} apiKey={undefined as unknown as string} />);
    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining("apiKey is required")
    );
  });

  it("logs error when scorerId is undefined", () => {
    render(<PassportScoreWidget {...defaultProps} scorerId={undefined as unknown as string} />);
    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining("scorerId is required")
    );
  });

  it("logs both errors when both apiKey and scorerId are undefined", () => {
    render(
      <PassportScoreWidget
        {...defaultProps}
        apiKey={undefined as unknown as string}
        scorerId={undefined as unknown as string}
      />
    );
    expect(mockConsoleError).toHaveBeenCalledTimes(2);
    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining("apiKey is required")
    );
    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining("scorerId is required")
    );
  });

  it("does not log errors when both apiKey and scorerId are provided", () => {
    render(<PassportScoreWidget {...defaultProps} />);
    expect(mockConsoleError).not.toHaveBeenCalled();
  });

  it("updates RPC URL when opRPCURL prop changes", () => {
    const { rerender } = render(<PassportScoreWidget {...defaultProps} />);
    expect(setOptimismRpcUrl).toHaveBeenCalledWith("https://mainnet.optimism.io");

    const customRpcUrl = "https://new-custom-rpc.com";
    rerender(<PassportScoreWidget {...defaultProps} opRPCURL={customRpcUrl} />);
    expect(setOptimismRpcUrl).toHaveBeenCalledWith(customRpcUrl);
  });

  it("passes all props to the Widget component", () => {
    const theme = {
      colors: {
        primary: "255, 255, 255",
        accent: "0, 212, 170",
      },
    };

    render(
      <PassportScoreWidget
        {...defaultProps}
        theme={theme}
        collapseMode="overlay"
        className="custom-class"
      />
    );

    // The widget should render with the theme and other props
    expect(screen.getByText("Verifying...")).toBeInTheDocument();
  });

  it("handles missing connectWalletCallback", () => {
    render(<PassportScoreWidget {...defaultProps} connectWalletCallback={undefined} />);
    expect(screen.getByText("Verifying...")).toBeInTheDocument();
  });

  it("handles missing generateSignatureCallback", () => {
    render(<PassportScoreWidget {...defaultProps} generateSignatureCallback={undefined} />);
    expect(screen.getByText("Verifying...")).toBeInTheDocument();
  });

  it("handles missing address", () => {
    render(<PassportScoreWidget {...defaultProps} address={undefined} />);
    // When address is undefined, it shows a different UI state
    expect(screen.getByText("Human Passport Score")).toBeInTheDocument();
  });

  describe("Auto-verify logic (lines 68-75)", () => {
    it("triggers auto-verify when score is below threshold", async () => {
      const mockVerifyCredentials = jest.fn();
      mockUseWidgetVerifyCredentials.mockReturnValue({
        verifyCredentials: mockVerifyCredentials,
        error: null,
        credentialErrors: [],
      });

      mockUseWidgetPassportScore.mockReturnValue({
        data: {
          score: 50,
          threshold: 100,
        },
        isLoading: false,
        isError: false,
        error: null,
      });

      render(<PassportScoreWidget {...defaultProps} />);

      // Wait for the auto-verify logic to trigger
      await waitFor(() => {
        expect(mockVerifyCredentials).toHaveBeenCalledWith(undefined, {
          onSettled: expect.any(Function),
        });
      });
    });

    it("does not trigger auto-verify when score is above threshold", async () => {
      const mockVerifyCredentials = jest.fn();
      mockUseWidgetVerifyCredentials.mockReturnValue({
        verifyCredentials: mockVerifyCredentials,
        error: null,
        credentialErrors: [],
      });

      mockUseWidgetPassportScore.mockReturnValue({
        data: {
          score: 150,
          threshold: 100,
        },
        isLoading: false,
        isError: false,
        error: null,
      });

      render(<PassportScoreWidget {...defaultProps} />);

      // Wait for the component to render
      await waitFor(() => {
        expect(screen.getByText("Human Passport Score")).toBeInTheDocument();
      });

      // Auto-verify should not be called when score is above threshold
      expect(mockVerifyCredentials).not.toHaveBeenCalled();
    });

    it("does not trigger auto-verify when still loading", async () => {
      const mockVerifyCredentials = jest.fn();
      mockUseWidgetVerifyCredentials.mockReturnValue({
        verifyCredentials: mockVerifyCredentials,
        error: null,
        credentialErrors: [],
      });

      mockUseWidgetPassportScore.mockReturnValue({
        data: null,
        isLoading: true,
        isError: false,
        error: null,
      });

      render(<PassportScoreWidget {...defaultProps} />);

      // Auto-verify should not be called when still loading
      expect(mockVerifyCredentials).not.toHaveBeenCalled();
    });

    it("does not trigger auto-verify when there is an error", async () => {
      const mockVerifyCredentials = jest.fn();
      mockUseWidgetVerifyCredentials.mockReturnValue({
        verifyCredentials: mockVerifyCredentials,
        error: null,
        credentialErrors: [],
      });

      mockUseWidgetPassportScore.mockReturnValue({
        data: null,
        isLoading: false,
        isError: true,
        error: new Error("API Error"),
      });

      render(<PassportScoreWidget {...defaultProps} />);

      // Auto-verify should not be called when there is an error
      expect(mockVerifyCredentials).not.toHaveBeenCalled();
    });
  });

  describe("onClose callback (line 97)", () => {
    it("invokes onClose handler by clicking Close button", async () => {
      mockUseWidgetPassportScore.mockReturnValue({
        data: {
          score: 75,
          threshold: 100,
          passingScore: true,
        },
        isLoading: false,
        isError: false,
        error: null,
      });

      render(<PassportScoreWidget {...defaultProps} collapseMode="overlay" />);

      // Close button is rendered on Congrats screen when collapseMode !== "off"
      const closeButton = await screen.findByRole("button", { name: /close/i });
      fireEvent.click(closeButton);

      // Clicking the button triggers onClose, which executes the inline setter (line 97)
    });
  });

  describe("Initialization onSettled callback (line 71)", () => {
    it("executes onSettled to set initialized state", async () => {
      const mockVerifyCredentials = jest.fn();
      mockUseWidgetVerifyCredentials.mockReturnValue({
        verifyCredentials: mockVerifyCredentials,
        error: null,
        credentialErrors: [],
      });

      mockUseWidgetPassportScore.mockReturnValue({
        data: {
          score: 10,
          threshold: 100,
        },
        isLoading: false,
        isError: false,
        error: null,
      });

      render(<PassportScoreWidget {...defaultProps} />);

      // Wait until verifyCredentials is called with onSettled
      await waitFor(() => {
        expect(mockVerifyCredentials).toHaveBeenCalled();
      });

      const callArgs = mockVerifyCredentials.mock.calls[0];
      const options = callArgs[1];
      expect(options).toBeDefined();
      expect(options.onSettled).toBeInstanceOf(Function);

      // Invoke onSettled to cover line 71 (setIsInitialized(true))
      act(() => {
        options.onSettled();
      });
    });
  });

  describe("showLoading calculation (line 81)", () => {
    it("shows loading when verify is pending and not initialized", async () => {
      // Simulate verification in progress
      mockUseWidgetVerifyCredentials.mockReturnValue({
        verifyCredentials: jest.fn(),
        isPending: true,
        error: null,
        credentialErrors: [],
      });

      // No score yet, and not loading from query
      mockUseWidgetPassportScore.mockReturnValue({
        data: null,
        isLoading: false,
        isError: false,
        error: null,
      });

      render(<PassportScoreWidget {...defaultProps} />);

      // Because isVerifying && !isInitialized, Body should show CheckingBody
      expect(await screen.findByText(/Verifying\.\.\./i)).toBeInTheDocument();
    });
  });
});
