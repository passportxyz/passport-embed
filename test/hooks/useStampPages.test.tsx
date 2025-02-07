import { renderHook, act, waitFor } from "@testing-library/react";
import { usePaginatedStampPages } from "../../src/hooks/useStampPages";
import { fetchStampPages } from "../../src/utils/stampDataApi";
import { mockExpectedConsoleErrorLog } from "../testUtils";

jest.mock("../../src/utils/stampDataApi");

const mockFetchStampPages = fetchStampPages as jest.MockedFunction<
  typeof fetchStampPages
>;

describe("usePaginatedStampPages", () => {
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
          credentials: [{ id: "cred2", weight: "20" }],
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with loading state and fetch data", async () => {
    mockFetchStampPages.mockResolvedValueOnce(mockRawStampPages);

    const { result } = renderHook(() => usePaginatedStampPages(mockProps));

    // Initial state
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.page).toBeNull();
    expect(result.current.isFirstPage).toBe(true);
    expect(result.current.isLastPage).toBe(false);

    await waitFor(() => expect(result.current.loading).toBe(false));

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
  });

  it("should handle pagination correctly", async () => {
    mockFetchStampPages.mockResolvedValueOnce(mockRawStampPages);

    const { result } = renderHook(() => usePaginatedStampPages(mockProps));

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Test next page
    act(() => {
      result.current.nextPage();
    });

    expect(result.current.page?.header).toBe("Page 2 Header");
    expect(result.current.isFirstPage).toBe(false);
    expect(result.current.isLastPage).toBe(true);

    // Test prev page
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

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Try to go past the last page
    act(() => {
      result.current.nextPage();
      result.current.nextPage();
    });

    expect(result.current.isLastPage).toBe(true);
    expect(result.current.page?.header).toBe("Page 2 Header");

    // Try to go before the first page
    act(() => {
      result.current.prevPage();
      result.current.prevPage();
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

    const { result } = renderHook(() =>
      usePaginatedStampPages(propsWithIamUrl)
    );

    expect(mockFetchStampPages).toHaveBeenCalledWith(propsWithIamUrl);

    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  describe("Errors", () => {
    mockExpectedConsoleErrorLog();

    it("should handle error cases", async () => {
      const errorMessage = "Network error";
      mockFetchStampPages.mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => usePaginatedStampPages(mockProps));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toBe("Failed to load stamp pages");
      expect(result.current.page).toBeNull();
    });
  });
});
