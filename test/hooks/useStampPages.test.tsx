import { renderHook, waitFor } from "@testing-library/react";
import { useStampPages } from "../../src/hooks/useStampPages";
import { fetchStampPages } from "../../src/utils/stampDataApi";
import { setupTestQueryClient } from "../testUtils";

jest.mock("../../src/utils/stampDataApi");

const mockFetchStampPages = fetchStampPages as jest.MockedFunction<typeof fetchStampPages>;

describe("useStampPages", () => {
  setupTestQueryClient();

  const mockProps = {
    apiKey: "test-api-key",
    scorerId: "test-scorer-id",
    embedServiceUrl: "https://test.com",
  };

  const mockRawStampPages = [
    {
      header: "Web3 & DeFi",
      platforms: [
        {
          platformId: "ETH",
          name: "ETH",
          description: '<p style="font-weight:700;">Hold at least 0.01 ETH</p>',
          documentationLink: "http://test1.com",
          credentials: [{ id: "eth-balance", weight: "10" }],
          displayWeight: "10",
        },
        {
          platformId: "NFT",
          name: "NFT",
          description: "<p>Own an NFT</p>",
          documentationLink: "http://test2.com",
          credentials: [{ id: "nft-holder", weight: "20" }],
          displayWeight: "20",
        },
      ],
    },
    {
      header: "Social & Community",
      platforms: [
        {
          platformId: "Discord",
          name: "Discord",
          description: "<p>Active Discord member</p>",
          documentationLink: "http://test3.com",
          credentials: [{ id: "discord-member", weight: "30" }],
          displayWeight: "30",
        },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with loading state and fetch all stamp pages", async () => {
    mockFetchStampPages.mockResolvedValueOnce(mockRawStampPages);

    const { result } = renderHook(() => useStampPages(mockProps));

    // Initial state
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.stampPages).toEqual([]);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // State after data load - should have all pages including "More Options"
    expect(result.current.error).toBeNull();
    expect(result.current.stampPages).toHaveLength(3); // 2 pages + More Options
    expect(result.current.stampPages[0].header).toBe("Web3 & DeFi");
    expect(result.current.stampPages[1].header).toBe("Social & Community");
    expect(result.current.stampPages[2].header).toBe("More Options");
  });

  it("should return all platforms from all pages", async () => {
    mockFetchStampPages.mockResolvedValueOnce(mockRawStampPages);

    const { result } = renderHook(() => useStampPages(mockProps));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Check first page platforms
    expect(result.current.stampPages[0].platforms).toHaveLength(2);
    expect(result.current.stampPages[0].platforms[0]).toEqual(
      expect.objectContaining({
        platformId: "ETH",
        name: "ETH",
      })
    );
    expect(result.current.stampPages[0].platforms[1]).toEqual(
      expect.objectContaining({
        platformId: "NFT",
        name: "NFT",
      })
    );

    // Check second page platforms
    expect(result.current.stampPages[1].platforms).toHaveLength(1);
    expect(result.current.stampPages[1].platforms[0]).toEqual(
      expect.objectContaining({
        platformId: "Discord",
        name: "Discord",
      })
    );

    // Check "More Options" page has no platforms
    expect(result.current.stampPages[2].platforms).toEqual([]);
  });

  it("should pass embedServiceUrl to fetchStampPages", async () => {
    const propsWithCustomUrl = {
      ...mockProps,
      embedServiceUrl: "https://custom-api.example.com",
    };

    mockFetchStampPages.mockResolvedValueOnce(mockRawStampPages);

    const { result } = renderHook(() => useStampPages(propsWithCustomUrl));

    expect(mockFetchStampPages).toHaveBeenCalledWith(propsWithCustomUrl);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it("should provide refetch function that updates data", async () => {
    mockFetchStampPages.mockResolvedValueOnce(mockRawStampPages);

    const { result } = renderHook(() => useStampPages(mockProps));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.refetch).toBeDefined();
    expect(typeof result.current.refetch).toBe("function");

    // Mock updated response
    const updatedMockPages = [
      {
        header: "Updated Section",
        platforms: [
          {
            platformId: "NewPlatform",
            name: "New Platform",
            description: "<p>Updated description</p>",
            documentationLink: "http://updated.com",
            credentials: [{ id: "new-cred", weight: "50" }],
            displayWeight: "50",
          },
        ],
      },
    ];

    mockFetchStampPages.mockResolvedValueOnce(updatedMockPages);

    // Call refetch
    result.current.refetch();

    await waitFor(() => {
      expect(result.current.stampPages[0].header).toBe("Updated Section");
    });
  });

  it("should cache data according to staleTime settings", async () => {
    mockFetchStampPages.mockResolvedValueOnce(mockRawStampPages);

    const { result: result1 } = renderHook(() => useStampPages(mockProps));

    await waitFor(() => expect(result1.current.isLoading).toBe(false));

    // Mount another hook - should use cached data
    const { result: result2 } = renderHook(() => useStampPages(mockProps));

    // Should not be loading since data is cached
    expect(result2.current.isLoading).toBe(false);
    expect(result2.current.stampPages[0].header).toBe("Web3 & DeFi");

    // fetchStampPages should only have been called once
    expect(mockFetchStampPages).toHaveBeenCalledTimes(1);
  });

  it("should include 'More Options' page at the end", async () => {
    mockFetchStampPages.mockResolvedValueOnce(mockRawStampPages);

    const { result } = renderHook(() => useStampPages(mockProps));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const lastPage = result.current.stampPages[result.current.stampPages.length - 1];
    expect(lastPage.header).toBe("More Options");
    expect(lastPage.platforms).toEqual([]);
  });

  it("should return empty array when no data", async () => {
    mockFetchStampPages.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useStampPages(mockProps));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Should still have "More Options" page even with no data
    expect(result.current.stampPages).toHaveLength(1);
    expect(result.current.stampPages[0].header).toBe("More Options");
  });

  describe("Error handling", () => {
    it("should handle network errors", async () => {
      const errorMessage = "Network error";
      mockFetchStampPages.mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useStampPages(mockProps));

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toBe(errorMessage);
      expect(result.current.stampPages).toEqual([]);
    });

    it("should recover from error on refetch", async () => {
      const errorMessage = "Network error";
      mockFetchStampPages.mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useStampPages(mockProps));

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.error).toBeDefined();

      // Mock successful response for refetch
      mockFetchStampPages.mockResolvedValueOnce(mockRawStampPages);

      result.current.refetch();

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.stampPages[0].header).toBe("Web3 & DeFi");
      });
    });
  });
});
