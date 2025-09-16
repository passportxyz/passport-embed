import { renderHook, act, waitFor } from "@testing-library/react";
import { usePaginatedStampPages } from "../../src/hooks/useStampPages";
import { fetchStampPages } from "../../src/utils/stampDataApi";
import { setupTestQueryClient } from "../testUtils";

jest.mock("../../src/utils/stampDataApi");

const mockFetchStampPages = fetchStampPages as jest.MockedFunction<typeof fetchStampPages>;

describe("usePaginatedStampPages", () => {
  setupTestQueryClient();

  const mockProps = {
    apiKey: "test-api-key",
    scorerId: "test-scorer-id",
    embedServiceUrl: "https://test.com",
  };

  const mockRawStampPages = [
    {
      header: "Page 1 Header",
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
          credentials: [{ id: "cred2", weight: "20" }],
          displayWeight: "20",
        },
      ],
    },
    {
      header: "Page 2 Header",
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
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with loading state and fetch data", async () => {
    mockFetchStampPages.mockResolvedValueOnce(mockRawStampPages);

    const { result } = renderHook(() => usePaginatedStampPages(mockProps));

    // Initial state
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.page).toBeNull();
    expect(result.current.isFirstPage).toBe(true);
    expect(result.current.isLastPage).toBe(true); // Before data loads, we assume 1 page

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // State after data load
    expect(result.current.error).toBeNull();
    expect(result.current.page).toEqual({
      header: "Page 1 Header",
      platforms: expect.arrayContaining([
        expect.objectContaining({
          name: "Platform 1",
        }),
      ]),
    });
    expect(result.current.isLastPage).toBe(false); // Now we know there are 3 pages (2 + More Options)
  });

  it("should handle pagination correctly", async () => {
    mockFetchStampPages.mockResolvedValueOnce(mockRawStampPages);

    const { result } = renderHook(() => usePaginatedStampPages(mockProps));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Test next page
    act(() => {
      result.current.nextPage();
    });

    expect(result.current.page?.header).toBe("Page 2 Header");
    expect(result.current.isFirstPage).toBe(false);
    expect(result.current.isLastPage).toBe(false); // Now there's a "More Options" page after this

    // Test next page again to reach "More Options"
    act(() => {
      result.current.nextPage();
    });

    expect(result.current.page?.header).toBe("More Options");
    expect(result.current.isFirstPage).toBe(false);
    expect(result.current.isLastPage).toBe(true);

    // Test prev page
    act(() => {
      result.current.prevPage();
    });

    expect(result.current.page?.header).toBe("Page 2 Header");
    expect(result.current.isFirstPage).toBe(false);
    expect(result.current.isLastPage).toBe(false);

    // Test prev page again
    act(() => {
      result.current.prevPage();
    });

    expect(result.current.page?.header).toBe("Page 1 Header");
    expect(result.current.isFirstPage).toBe(true);
    expect(result.current.isLastPage).toBe(false);
  });

  it("should handle edge cases in pagination", async () => {
    mockFetchStampPages.mockResolvedValueOnce(mockRawStampPages);

    const { result } = renderHook(() => usePaginatedStampPages(mockProps));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Try to go past the last page (now includes "More Options")
    act(() => {
      result.current.nextPage(); // To Page 2
      result.current.nextPage(); // To More Options
      result.current.nextPage(); // Should stay on More Options
    });

    expect(result.current.isLastPage).toBe(true);
    expect(result.current.page?.header).toBe("More Options");

    // Try to go before the first page
    act(() => {
      result.current.prevPage(); // To Page 2
      result.current.prevPage(); // To Page 1
      result.current.prevPage(); // Should stay on Page 1
    });

    expect(result.current.isFirstPage).toBe(true);
    expect(result.current.page?.header).toBe("Page 1 Header");
  });

  it("should pass custom IAM URL to fetchStampPages", async () => {
    const propsWithIamUrl = {
      ...mockProps,
      embedServiceUrl: "https://custom-iam.example.com",
    };

    mockFetchStampPages.mockResolvedValueOnce(mockRawStampPages);

    const { result } = renderHook(() => usePaginatedStampPages(propsWithIamUrl));

    expect(mockFetchStampPages).toHaveBeenCalledWith(propsWithIamUrl);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it("should provide refetch function", async () => {
    mockFetchStampPages.mockResolvedValueOnce(mockRawStampPages);

    const { result } = renderHook(() => usePaginatedStampPages(mockProps));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.refetch).toBeDefined();
    expect(typeof result.current.refetch).toBe("function");

    // Mock a new response for refetch
    const updatedMockPages = [
      {
        header: "Updated Page Header",
        platforms: [
          {
            platformId: "UpdatedPlatform",
            name: "Updated Platform",
            description: "<p>Updated description</p>",
            documentationLink: "http://updated.com",
            credentials: [{ id: "updated-cred", weight: "50" }],
            displayWeight: "50",
          },
        ],
      },
    ];

    mockFetchStampPages.mockResolvedValueOnce(updatedMockPages);

    // Call refetch
    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.page?.header).toBe("Updated Page Header");
    });
  });

  it("should cache data according to staleTime and gcTime settings", async () => {
    mockFetchStampPages.mockResolvedValueOnce(mockRawStampPages);

    const { result: result1 } = renderHook(() => usePaginatedStampPages(mockProps));

    await waitFor(() => expect(result1.current.isLoading).toBe(false));

    // Unmount and remount the hook immediately - should use cached data
    const { result: result2 } = renderHook(() => usePaginatedStampPages(mockProps));

    // Should not be loading since data is cached
    expect(result2.current.isLoading).toBe(false);
    expect(result2.current.page?.header).toBe("Page 1 Header");

    // fetchStampPages should only have been called once
    expect(mockFetchStampPages).toHaveBeenCalledTimes(1);
  });

  it("should include 'More Options' page as the last page", async () => {
    mockFetchStampPages.mockResolvedValueOnce(mockRawStampPages);

    const { result } = renderHook(() => usePaginatedStampPages(mockProps));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Navigate to the last page
    act(() => {
      result.current.nextPage(); // To Page 2
      result.current.nextPage(); // To More Options
    });

    expect(result.current.page?.header).toBe("More Options");
    expect(result.current.page?.platforms).toEqual([]);
    expect(result.current.isLastPage).toBe(true);
  });

  it("should handle platform with undefined description", async () => {
    // This test covers line 65: description: <SanitizedHTMLComponent html={platform.description || ""} />
    const mockPagesWithUndefinedDescription = [
      {
        header: "Test Page",
        platforms: [
          {
            name: "Test Platform",
            platformId: "test-platform",
            description: "", // Use empty string instead of undefined to match type
            documentationLink: "http://test.com",
            credentials: [{ id: "test-cred", weight: "10" }],
            displayWeight: "10",
          },
        ],
      },
    ];

    mockFetchStampPages.mockResolvedValueOnce(mockPagesWithUndefinedDescription);

    const { result } = renderHook(() => usePaginatedStampPages(mockProps));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.page?.platforms[0].description).toBeDefined();
    // The description should be a SanitizedHTMLComponent with empty string
  });

  it("should handle pagination with undefined stampPages length", async () => {
    // This test covers line 87: const nextPage = () => setIdx((prev) => Math.min(prev + 1, (stampPages?.length ?? 1) - 1));
    mockFetchStampPages.mockResolvedValueOnce([]); // Empty array to test edge case

    const { result } = renderHook(() => usePaginatedStampPages(mockProps));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Test nextPage when stampPages is empty
    act(() => {
      result.current.nextPage();
    });

    // Should handle gracefully without crashing
    expect(result.current.isFirstPage).toBe(true);
  });

  it("should handle nextPage with single page (covers line 87)", async () => {
    // This test covers line 87: const nextPage = () => setIdx((prev) => Math.min(prev + 1, (stampPages?.length ?? 1) - 1));
    const singlePageData = [
      {
        header: "Single Page",
        platforms: [
        {
          name: "Single Platform",
          platformId: "single-platform",
          description: "<p>Single platform description</p>",
          documentationLink: "http://single.com",
          credentials: [{ id: "single-cred", weight: "10" }],
          displayWeight: "10",
        },
        ],
      },
    ];

    mockFetchStampPages.mockResolvedValueOnce(singlePageData);

    const { result } = renderHook(() => usePaginatedStampPages(mockProps));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Verify we have the single page loaded (the hook adds a "More Options" page automatically)
    expect(result.current.page?.header).toBe("Single Page");
    expect(result.current.isFirstPage).toBe(true);
    expect(result.current.isLastPage).toBe(false); // Because there's also a "More Options" page

    // Call nextPage - this should move to the "More Options" page
    // This tests the Math.min logic in line 87: Math.min(prev + 1, (stampPages?.length ?? 1) - 1)
    act(() => {
      result.current.nextPage();
    });

    // Should now be on the "More Options" page
    expect(result.current.page?.header).toBe("More Options");
    expect(result.current.isFirstPage).toBe(false);
    expect(result.current.isLastPage).toBe(true);
  });

  it("should handle nextPage with multiple pages (covers line 54)", async () => {
    const multiPageData = [
      {
        header: "Page 1",
        platforms: [
          {
            name: "Platform 1",
            platformId: "platform-1",
            description: "<p>Platform 1 description</p>",
            documentationLink: "http://platform1.com",
            credentials: [{ id: "cred1", weight: "10" }],
            displayWeight: "10",
          },
        ],
      },
      {
        header: "Page 2",
        platforms: [
          {
            name: "Platform 2",
            platformId: "platform-2",
            description: "<p>Platform 2 description</p>",
            documentationLink: "http://platform2.com",
            credentials: [{ id: "cred2", weight: "20" }],
            displayWeight: "20",
          },
        ],
      },
    ];

    mockFetchStampPages.mockResolvedValueOnce(multiPageData);

    const { result } = renderHook(() => usePaginatedStampPages(mockProps));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Should be on first page initially
    expect(result.current.page?.header).toBe("Page 1");
    expect(result.current.isFirstPage).toBe(true);
    expect(result.current.isLastPage).toBe(false);

    // Call nextPage - this tests line 54: Math.min(prev + 1, (stampPages?.length ?? 1) - 1)
    act(() => {
      result.current.nextPage();
    });

    // Should move to second page
    expect(result.current.page?.header).toBe("Page 2");
    expect(result.current.isFirstPage).toBe(false);
    expect(result.current.isLastPage).toBe(false);

    // Call nextPage again to go to "More Options" page
    act(() => {
      result.current.nextPage();
    });

    // Should be on "More Options" page (last page)
    expect(result.current.page?.header).toBe("More Options");
    expect(result.current.isFirstPage).toBe(false);
    expect(result.current.isLastPage).toBe(true);
  });

  describe("Errors", () => {
    it("should handle error cases", async () => {
      const errorMessage = "Network error";
      mockFetchStampPages.mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => usePaginatedStampPages(mockProps));

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toBe(errorMessage);
      expect(result.current.page).toBeNull();
    });

    it("should be able to refetch after error", async () => {
      const errorMessage = "Network error";
      mockFetchStampPages.mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => usePaginatedStampPages(mockProps));

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.error).toBeDefined();

      // Now mock a successful response
      mockFetchStampPages.mockResolvedValueOnce(mockRawStampPages);

      // Call refetch
      act(() => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.page?.header).toBe("Page 1 Header");
      });
    });
  });
});
