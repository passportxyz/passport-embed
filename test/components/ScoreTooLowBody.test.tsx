import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { ScoreTooLowBody, AddStamps } from "../../src/components/Body/ScoreTooLowBody";
import {
  useWidgetIsQuerying,
  useWidgetPassportScore,
  useWidgetVerifyCredentials,
} from "../../src/hooks/usePassportScore";
import { useHeaderControls } from "../../src/hooks/useHeaderControls";
import { useStampPages } from "../../src/hooks/useStampPages";

jest.mock("../../src/hooks/usePassportScore");
jest.mock("../../src/hooks/useHeaderControls");
jest.mock("../../src/hooks/useStampPages");

const mockUseStampPages = useStampPages as jest.Mock;

const mockStampPagesData = [
  {
    header: "Web3 & DeFi",
    platforms: [
      {
        platformId: "Platform1",
        name: "Platform 1",
        description: '<p style="font-weight:700;">Test description 1</p>',
        documentationLink: "http://test1.com",
        credentials: [{ id: "cred1", weight: "10" }],
        displayWeight: "10",
      },
      {
        platformId: "Platform2",
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
    header: "Social & Community",
    platforms: [
      {
        platformId: "Platform3",
        name: "Platform 3",
        description: "<p>Test description 3</p>",
        documentationLink: "http://test3.com",
        credentials: [{ id: "cred3", weight: "30" }],
        displayWeight: "30",
      },
    ],
  },
  {
    header: "More Options",
    platforms: [],
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

    expect(screen.getByText(/Your score is too low to participate/i)).toBeInTheDocument();
    expect(screen.getByText(/Increase your score to 25\+ by verifying/i)).toBeInTheDocument();
    expect(screen.getByText("Add Stamps")).toBeInTheDocument();
  });

  it("should transition to AddStamps when clicking Add Stamps button", async () => {
    mockUseWidgetPassportScore.mockReturnValue({
      data: { threshold: 25 },
    });

    // Mock the useStampPages for AddStamps component
    mockUseStampPages.mockReturnValue({
      stampPages: mockStampPagesData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<ScoreTooLowBody generateSignatureCallback={mockGenerateSignature} />);

    fireEvent.click(screen.getByText("Add Stamps"));

    // Should now show all stamp sections
    await waitFor(() => expect(screen.getByText("Web3 & DeFi")).toBeInTheDocument());
    expect(screen.getByText("Social & Community")).toBeInTheDocument();
  });
});

describe("AddStamps Component", () => {
  const mockGenerateSignature = jest.fn();
  const mockRefetch = jest.fn();

  beforeEach(() => {
    mockUseHeaderControls.mockReset();
    mockUseWidgetPassportScore.mockReset();
    mockUseStampPages.mockReset();
    mockUseHeaderControls.mockReturnValue({ setSubtitle: jest.fn() });

    // Default mock for useStampPages
    mockUseStampPages.mockReturnValue({
      stampPages: mockStampPagesData,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });
  });

  describe("Stamp Sections Display", () => {
    beforeEach(() => {
      mockUseWidgetPassportScore.mockReturnValue({
        data: { threshold: 25 },
      });
    });

    it("should render all stamp sections with headers", () => {
      render(<AddStamps generateSignatureCallback={mockGenerateSignature} />);

      // Check for section headers
      expect(screen.getByText("Web3 & DeFi")).toBeInTheDocument();
      expect(screen.getByText("Social & Community")).toBeInTheDocument();
    });

    it("should render all platform buttons across sections", () => {
      render(<AddStamps generateSignatureCallback={mockGenerateSignature} />);

      expect(screen.getByText("Platform 1")).toBeInTheDocument();
      expect(screen.getByText("Platform 2")).toBeInTheDocument();
      expect(screen.getByText("Platform 3")).toBeInTheDocument();
    });

    it("should show More Options link", () => {
      render(<AddStamps generateSignatureCallback={mockGenerateSignature} />);

      expect(screen.getByText(/Visit/)).toBeInTheDocument();
      expect(screen.getByText("Human Passport")).toBeInTheDocument();
      expect(screen.getByText(/for more options/)).toBeInTheDocument();
    });

    it("should show loading state", () => {
      mockUseStampPages.mockReturnValue({
        stampPages: [],
        isLoading: true,
        error: null,
        refetch: mockRefetch,
      });

      render(<AddStamps generateSignatureCallback={mockGenerateSignature} />);

      expect(screen.getByText("Loading Stamps...")).toBeInTheDocument();
    });

    it("should show error state with refetch button", () => {
      const mockError = new Error("Failed to fetch");
      mockUseStampPages.mockReturnValue({
        stampPages: [],
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

    it("should show no stamps available when stampPages is empty", () => {
      mockUseStampPages.mockReturnValue({
        stampPages: [],
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<AddStamps generateSignatureCallback={mockGenerateSignature} />);

      expect(screen.getByText("No Stamps Available")).toBeInTheDocument();
    });

    it("should handle platform selection", () => {
      render(<AddStamps generateSignatureCallback={mockGenerateSignature} />);

      fireEvent.click(screen.getByText("Platform 1"));

      // Verify that platform verification view is shown
      expect(screen.getByText(/Test description 1/i)).toBeInTheDocument();
    });
  });

  describe("Platform Claimed Status", () => {
    it("should add claimed class to verified platforms", () => {
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
  });

  describe("Platform Deduplication", () => {
    it("should show dedupe badge when platform has deduplicated stamps", () => {
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
