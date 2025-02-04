import React from "react";
import {
  renderHook,
  act,
  render,
  screen,
  fireEvent,
} from "@testing-library/react";

import {
  usePages,
  ScoreTooLowBody,
  AddStamps,
} from "../../src/components/Body/ScoreTooLowBody";
import {
  useWidgetIsQuerying,
  useWidgetPassportScore,
  useWidgetVerifyCredentials,
} from "../../src/hooks/usePassportScore";
import { useHeaderControls } from "../../src/contexts/HeaderContext";

jest.mock("../../src/hooks/usePassportScore");
jest.mock("../../src/contexts/HeaderContext");

const mockUseWidgetPassportScore = useWidgetPassportScore as jest.Mock;
const mockUseHeaderControls = useHeaderControls as jest.Mock;

(useWidgetIsQuerying as jest.Mock).mockReturnValue(false);
(useWidgetVerifyCredentials as jest.Mock).mockReturnValue({
  verifyCredentials: jest.fn(),
});

describe("usePages Hook", () => {
  const testPages = ["page1", "page2", "page3"];

  it("should initialize with first page", () => {
    const { result } = renderHook(() => usePages(testPages));
    expect(result.current.page).toBe("page1");
    expect(result.current.isFirstPage).toBe(true);
    expect(result.current.isLastPage).toBe(false);
  });

  it("should navigate between pages correctly", () => {
    const { result } = renderHook(() => usePages(testPages));

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.page).toBe("page2");
    expect(result.current.isFirstPage).toBe(false);
    expect(result.current.isLastPage).toBe(false);

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.page).toBe("page3");
    expect(result.current.isLastPage).toBe(true);

    act(() => {
      result.current.prevPage();
    });

    expect(result.current.page).toBe("page2");
  });
});

describe("ScoreTooLowBody Component", () => {
  const mockGenerateSignature = jest.fn();

  beforeEach(() => {
    mockUseWidgetPassportScore.mockReset();
    mockUseHeaderControls.mockReset();
    mockUseHeaderControls.mockReturnValue({ setSubtitle: jest.fn() });
  });

  it("should render initial state correctly", () => {
    mockUseWidgetPassportScore.mockReturnValue({
      data: { threshold: 25 },
    });

    render(
      <ScoreTooLowBody generateSignatureCallback={mockGenerateSignature} />
    );

    expect(
      screen.getByText(/Your score is too low to participate/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Increase your score to 25\+ by verifying/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Add Stamps")).toBeInTheDocument();
  });

  it("should transition to AddStamps when continuing", () => {
    mockUseWidgetPassportScore.mockReturnValue({
      data: { threshold: 25 },
    });

    render(
      <ScoreTooLowBody generateSignatureCallback={mockGenerateSignature} />
    );

    fireEvent.click(screen.getByText("Add Stamps"));
    expect(
      screen.getByText("Choose from below and verify")
    ).toBeInTheDocument();
  });
});

describe("AddStamps Component", () => {
  const mockGenerateSignature = jest.fn();

  beforeEach(() => {
    mockUseHeaderControls.mockReset();
    mockUseWidgetPassportScore.mockReset();
    mockUseHeaderControls.mockReturnValue({ setSubtitle: jest.fn() });
  });

  describe("Platform Verification", () => {
    beforeEach(() => {
      mockUseWidgetPassportScore.mockReturnValue({
        data: { threshold: 25 },
      });
    });

    it("should render platform buttons correctly", () => {
      render(<AddStamps generateSignatureCallback={mockGenerateSignature} />);

      // Check for KYC verification section
      expect(screen.getByText("KYC verification")).toBeInTheDocument();
      expect(screen.getByText("Binance")).toBeInTheDocument();
      expect(screen.getByText("Holonym")).toBeInTheDocument();
    });

    it("should handle platform selection", () => {
      render(<AddStamps generateSignatureCallback={mockGenerateSignature} />);

      fireEvent.click(screen.getByText("Binance"));
      // Verify that platform verification view is shown
      expect(
        screen.getByText(/If you do not have the Binance Account/i)
      ).toBeInTheDocument();
    });

    it("should navigate between pages", () => {
      render(<AddStamps generateSignatureCallback={mockGenerateSignature} />);

      fireEvent.click(screen.getByText("Try another way"));
      expect(screen.getByText("Biometrics verification")).toBeInTheDocument();
    });
  });

  it("should add claimed class to verified platforms", () => {
    // Mock a verified Binance platform
    mockUseWidgetPassportScore.mockReturnValue({
      data: {
        stamps: {
          HolonymGovIdProvider: { score: 16 },
        },
      },
    });

    render(<AddStamps generateSignatureCallback={mockGenerateSignature} />);

    // Get the Binance platform button
    const holonymButton = screen.getByText("Holonym").closest("button");
    expect(holonymButton).toHaveClass("platformButtonClaimed");

    // Verify unclaimed platform doesn't have the class
    const binanceButton = screen.getByText("Binance").closest("button");
    expect(binanceButton).not.toHaveClass("platformButtonClaimed");
  });
});
