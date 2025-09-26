import { renderHook } from "@testing-library/react";
import { usePlatformDeduplication } from "../../src/hooks/usePlatformDeduplication";
import { Platform } from "../../src/hooks/stampTypes";
import { useWidgetPassportScore } from "../../src/hooks/usePassportScore";

// Mock the useWidgetPassportScore hook
jest.mock("../../src/hooks/usePassportScore", () => ({
  useWidgetPassportScore: jest.fn(),
}));

const mockUseWidgetPassportScore = useWidgetPassportScore as jest.MockedFunction<typeof useWidgetPassportScore>;

// Helper function to create mock passport score data
const createMockPassportScore = (
  stamps: Record<string, { score: number; dedup?: boolean; expiration_date?: string }>
) => ({
  address: "0x123",
  score: 10,
  passingScore: false,
  lastScoreTimestamp: new Date(),
  expirationTimestamp: new Date(),
  threshold: 20,
  stamps: Object.fromEntries(
    Object.entries(stamps).map(([key, value]) => [
      key,
      {
        score: value.score,
        dedup: value.dedup ?? false,
        expirationDate: new Date(value.expiration_date || "2024-12-31T00:00:00Z"),
      },
    ])
  ),
});

// Helper function to create complete mock PassportEmbedResult
const createMockPassportEmbedResult = (
  stamps: Record<string, { score: number; dedup?: boolean; expiration_date?: string }> | undefined = {}
) => ({
  data: stamps === undefined ? undefined : createMockPassportScore(stamps),
  isPending: false,
  isFetching: false,
  isLoading: false,
  isError: false,
  error: null,
  refetch: jest.fn(),
});

describe("usePlatformDeduplication", () => {
  const mockPlatform: Platform = {
    platformId: "Twitter",
    name: "Twitter",
    description: "Connect your Twitter account",
    documentationLink: "https://docs.example.com",
    icon: null,
    credentials: [{ id: "Twitter", weight: "1.0" }],
    displayWeight: "1.0",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return true when platform has deduplicated stamps", () => {
    const mockResult = createMockPassportEmbedResult({
      Twitter: {
        score: 0,
        dedup: true,
        expiration_date: "2024-12-31T00:00:00Z",
      },
    });

    mockUseWidgetPassportScore.mockReturnValue(mockResult);

    const { result } = renderHook(() => usePlatformDeduplication({ platform: mockPlatform }));
    expect(result.current).toBe(true);
  });

  it("should return false when platform has no deduplicated stamps", () => {
    const mockResult = createMockPassportEmbedResult({
      Twitter: {
        score: 5,
        dedup: false,
        expiration_date: "2024-12-31T00:00:00Z",
      },
    });

    mockUseWidgetPassportScore.mockReturnValue(mockResult);

    const { result } = renderHook(() => usePlatformDeduplication({ platform: mockPlatform }));
    expect(result.current).toBe(false);
  });

  it("should return false when stamp has dedup true but score is not 0", () => {
    const mockResult = createMockPassportEmbedResult({
      Twitter: {
        score: 5,
        dedup: true,
        expiration_date: "2024-12-31T00:00:00Z",
      },
    });

    mockUseWidgetPassportScore.mockReturnValue(mockResult);

    const { result } = renderHook(() => usePlatformDeduplication({ platform: mockPlatform }));
    expect(result.current).toBe(false);
  });

  it("should return false when stamp has score 0 but dedup is false", () => {
    const mockResult = createMockPassportEmbedResult({
      Twitter: {
        score: 0,
        dedup: false,
        expiration_date: "2024-12-31T00:00:00Z",
      },
    });

    mockUseWidgetPassportScore.mockReturnValue(mockResult);

    const { result } = renderHook(() => usePlatformDeduplication({ platform: mockPlatform }));
    expect(result.current).toBe(false);
  });

  it("should return false when no data is available", () => {
    const mockResult = createMockPassportEmbedResult(undefined);
    mockUseWidgetPassportScore.mockReturnValue(mockResult);

    const { result } = renderHook(() => usePlatformDeduplication({ platform: mockPlatform }));
    expect(result.current).toBe(false);
  });

  it("should return false when no stamps data is available", () => {
    const mockResult = createMockPassportEmbedResult({});
    mockUseWidgetPassportScore.mockReturnValue(mockResult);

    const { result } = renderHook(() => usePlatformDeduplication({ platform: mockPlatform }));
    expect(result.current).toBe(false);
  });

  it("should return false when credential is not found in stamps", () => {
    const mockResult = createMockPassportEmbedResult({
      Discord: {
        score: 0,
        dedup: true,
        expiration_date: "2024-12-31T00:00:00Z",
      },
    });

    mockUseWidgetPassportScore.mockReturnValue(mockResult);

    const { result } = renderHook(() => usePlatformDeduplication({ platform: mockPlatform }));
    expect(result.current).toBe(false);
  });

  it("should return true when platform has multiple credentials and one is deduplicated", () => {
    const platformWithMultipleCredentials: Platform = {
      platformId: "MultiPlatform",
      name: "Multi Platform",
      description: "Platform with multiple credentials",
      documentationLink: "https://docs.example.com",
      icon: null,
      credentials: [
        { id: "Twitter", weight: "1.0" },
        { id: "Discord", weight: "1.0" },
      ],
      displayWeight: "2.0",
    };

    const mockResult = createMockPassportEmbedResult({
      Twitter: {
        score: 5,
        dedup: false,
        expiration_date: "2024-12-31T00:00:00Z",
      },
      Discord: {
        score: 0,
        dedup: true,
        expiration_date: "2024-12-31T00:00:00Z",
      },
    });

    mockUseWidgetPassportScore.mockReturnValue(mockResult);

    const { result } = renderHook(() => usePlatformDeduplication({ platform: platformWithMultipleCredentials }));
    expect(result.current).toBe(true);
  });

  it("should handle missing dedup property gracefully", () => {
    const mockResult = createMockPassportEmbedResult({
      Twitter: {
        score: 0,
        expiration_date: "2024-12-31T00:00:00Z",
      },
    });

    mockUseWidgetPassportScore.mockReturnValue(mockResult);

    const { result } = renderHook(() => usePlatformDeduplication({ platform: mockPlatform }));
    expect(result.current).toBe(false);
  });
});
