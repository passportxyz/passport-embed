import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { ScoreTooLowBody, AddStamps } from "../../src/components/Body/ScoreTooLowBody";
import {
  useWidgetIsQuerying,
  useWidgetPassportScore,
  useWidgetVerifyCredentials,
} from "../../src/hooks/usePassportScore";
import { useHeaderControls } from "../../src/hooks/useHeaderControls";
import { usePaginatedStampPages } from "../../src/hooks/useStampPages";

jest.mock("../../src/hooks/usePassportScore");
jest.mock("../../src/hooks/useHeaderControls");
jest.mock("../../src/hooks/useStampPages");

const mockUsePaginatedStampPages = usePaginatedStampPages as jest.Mock;

const mockStampPagesData = [
  {
    header: "Page 1 Header",
    platforms: [
      {
        name: "Platform 1",
        description: '<p style="font-weight:700;">Test description 1</p>',
        documentationLink: "http://test1.com",
        credentials: [{ id: "cred1", weight: "10" }],
        displayWeight: "10",
      },
      {
        name: "Platform 2",
        description: "<p>Test description 2</p>",
        documentationLink: "http://test2.com",
        credentials: [
          { id: "cred2", weight: "20" },
          { id: "anotherCred", weight: "40" },
        ],
        displayWeight: "20",
      },
    ],
  },
  {
    header: "Page 2 Header",
    platforms: [
      {
        name: "Platform 3",
        description: "<p>Test description 3</p>",
        documentationLink: "http://test3.com",
        credentials: [{ id: "cred3", weight: "30" }],
        displayWeight: "30",
      },
    ],
  },
];

const mockUseWidgetPassportScore = useWidgetPassportScore as jest.Mock;
const mockUseHeaderControls = useHeaderControls as jest.Mock;

(useWidgetIsQuerying as jest.Mock).mockReturnValue(false);
(useWidgetVerifyCredentials as jest.Mock).mockReturnValue({
  verifyCredentials: jest.fn(),
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

    render(<ScoreTooLowBody generateSignatureCallback={mockGenerateSignature} />);

    expect(screen.getByText("Increase score to participate!")).toBeInTheDocument();
    expect(screen.getByText(/Raise your score to 25/i)).toBeInTheDocument();
    expect(screen.getByText("Verify Stamps")).toBeInTheDocument();
  });

  it("should transition to AddStamps when continuing", async () => {
    mockUseWidgetPassportScore.mockReturnValue({
      data: { threshold: 25 },
    });

    // Mock the usePaginatedStampPages for AddStamps component
    mockUsePaginatedStampPages.mockReturnValue({
      page: mockStampPagesData[0],
      nextPage: jest.fn(),
      prevPage: jest.fn(),
      isFirstPage: true,
      isLastPage: false,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<ScoreTooLowBody generateSignatureCallback={mockGenerateSignature} />);

    fireEvent.click(screen.getByText("Verify Stamps"));

    await waitFor(() => expect(screen.getByText("Choose from below and verify")).toBeInTheDocument());
  });
});

describe("AddStamps Component", () => {
  const mockGenerateSignature = jest.fn();
  const mockRefetch = jest.fn();

  beforeEach(() => {
    mockUseHeaderControls.mockReset();
    mockUseWidgetPassportScore.mockReset();
    mockUsePaginatedStampPages.mockReset();
    mockUseHeaderControls.mockReturnValue({ setSubtitle: jest.fn() });

    // Default mock for usePaginatedStampPages
    mockUsePaginatedStampPages.mockReturnValue({
      page: mockStampPagesData[0],
      nextPage: jest.fn(),
      prevPage: jest.fn(),
      isFirstPage: true,
      isLastPage: false,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });
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
      expect(screen.getByText("Page 1 Header")).toBeInTheDocument();
      expect(screen.getByText("Platform 1")).toBeInTheDocument();
      expect(screen.getByText("Platform 2")).toBeInTheDocument();
    });

    it("should show loading state", () => {
      mockUsePaginatedStampPages.mockReturnValue({
        page: null,
        nextPage: jest.fn(),
        prevPage: jest.fn(),
        isFirstPage: true,
        isLastPage: true,
        isLoading: true,
        error: null,
        refetch: mockRefetch,
      });

      render(<AddStamps generateSignatureCallback={mockGenerateSignature} />);

      expect(screen.getByText("Loading Stamps Metadata...")).toBeInTheDocument();
    });

    it("should show error state with refetch button", () => {
      const mockError = new Error("Failed to fetch");
      mockUsePaginatedStampPages.mockReturnValue({
        page: null,
        nextPage: jest.fn(),
        prevPage: jest.fn(),
        isFirstPage: true,
        isLastPage: true,
        isLoading: false,
        error: mockError,
        refetch: mockRefetch,
      });

      render(<AddStamps generateSignatureCallback={mockGenerateSignature} />);

      expect(screen.getByText("Failed to fetch")).toBeInTheDocument();
      expect(screen.getByText("Try Again")).toBeInTheDocument();

      // Click refetch button
      fireEvent.click(screen.getByText("Try Again"));
      expect(mockRefetch).toHaveBeenCalled();
    });

    it("should handle platform selection", () => {
      render(<AddStamps generateSignatureCallback={mockGenerateSignature} />);

      fireEvent.click(screen.getByText("Platform 1"));

      // Verify that platform verification view is shown
      expect(screen.getByText(/Test description 1/i)).toBeInTheDocument();
    });

    it("should navigate between pages", () => {
      const mockNextPage = jest.fn();
      mockUsePaginatedStampPages.mockReturnValue({
        page: mockStampPagesData[0],
        nextPage: mockNextPage,
        prevPage: jest.fn(),
        isFirstPage: true,
        isLastPage: false,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<AddStamps generateSignatureCallback={mockGenerateSignature} />);

      fireEvent.click(screen.getByText("Try another way"));
      expect(mockNextPage).toHaveBeenCalled();
    });
  });

  it("should add claimed class to verified platforms", () => {
    // Mock a verified Binance platform
    mockUseWidgetPassportScore.mockReturnValue({
      data: {
        stamps: {
          cred2: { score: 16 },
        },
      },
    });

    render(<AddStamps generateSignatureCallback={mockGenerateSignature} />);

    const p2Button = screen.getByText("Platform 2").closest("button");
    expect(p2Button).toHaveClass("platformButtonClaimed");

    const p1Button = screen.getByText("Platform 1").closest("button");
    expect(p1Button).not.toHaveClass("platformButtonClaimed");
  });

  describe("Platform Deduplication", () => {
    it("should show dedupe badge when platform has deduplicated stamps", () => {
      // Mock deduplication scenario
      mockUseWidgetPassportScore.mockReturnValue({
        data: {
          stamps: {
            cred1: { score: 0, dedup: true },
          },
        },
      });

      const { container } = render(<AddStamps generateSignatureCallback={mockGenerateSignature} />);

      // Check for dedupe badge
      expect(container.querySelector(".dedupeBadge")).toBeInTheDocument();
      expect(screen.getByText("Deduplicated")).toBeInTheDocument();
    });

    it("should not show dedupe badge when platform has no deduplicated stamps", () => {
      mockUseWidgetPassportScore.mockReturnValue({
        data: {
          stamps: {
            cred1: { score: 5, dedup: false },
          },
        },
      });

      const { container } = render(<AddStamps generateSignatureCallback={mockGenerateSignature} />);

      // Check that dedupe badge is not present
      expect(container.querySelector(".dedupeBadge")).not.toBeInTheDocument();
      expect(screen.queryByText("Dedupe")).not.toBeInTheDocument();
    });

    it("should show dedupe badge when platform has mixed credentials with one deduplicated", () => {
      // Mock platform with multiple credentials where one is deduplicated
      mockUseWidgetPassportScore.mockReturnValue({
        data: {
          stamps: {
            cred2: { score: 20, dedup: false },
            anotherCred: { score: 0, dedup: true },
          },
        },
      });

      render(<AddStamps generateSignatureCallback={mockGenerateSignature} />);

      // Find Platform 2 button which has both cred2 and anotherCred
      const platform2Button = screen.getByText("Platform 2").closest("button");

      // Check for dedupe badge on Platform 2
      expect(platform2Button?.querySelector(".dedupeBadge")).toBeInTheDocument();
    });

    it("should not show dedupe badge when dedup is true but score is not 0", () => {
      mockUseWidgetPassportScore.mockReturnValue({
        data: {
          stamps: {
            cred1: { score: 5, dedup: true },
          },
        },
      });

      const { container } = render(<AddStamps generateSignatureCallback={mockGenerateSignature} />);

      // Check that dedupe badge is not present (dedup is true but score is not 0)
      expect(container.querySelector(".dedupeBadge")).not.toBeInTheDocument();
      expect(screen.queryByText("Dedupe")).not.toBeInTheDocument();
    });
  });
});
