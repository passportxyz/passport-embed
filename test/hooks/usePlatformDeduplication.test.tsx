import { renderHook } from "@testing-library/react";
import { usePlatformDeduplication } from "../../src/hooks/usePlatformDeduplication";
import { useWidgetPassportScore } from "../../src/hooks/usePassportScore";

// Mock the useWidgetPassportScore hook
jest.mock("../../src/hooks/usePassportScore");
const mockUseWidgetPassportScore = useWidgetPassportScore as jest.Mock;

describe("usePlatformDeduplication", () => {
  const mockPlatform = {
    platformId: "discord",
    name: "Discord",
    description: "Connect your Discord account",
    documentationLink: "https://docs.example.com/discord",
    credentials: [
      { id: "discord-cred-1", weight: "5" },
      { id: "discord-cred-2", weight: "5" },
    ],
    displayWeight: "10",
    icon: "🎮",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns false when no stamps data", () => {
    mockUseWidgetPassportScore.mockReturnValue({
      data: null,
    });

    const { result } = renderHook(() => usePlatformDeduplication({ platform: mockPlatform }));
    expect(result.current).toBe(false);
  });

  it("returns false when no stamps object", () => {
    mockUseWidgetPassportScore.mockReturnValue({
      data: {},
    });

    const { result } = renderHook(() => usePlatformDeduplication({ platform: mockPlatform }));
    expect(result.current).toBe(false);
  });

  it("returns false when platform has no credentials", () => {
    const platformWithoutCredentials = {
      ...mockPlatform,
      credentials: [],
    };

    mockUseWidgetPassportScore.mockReturnValue({
      data: {
        stamps: {
          "other-cred": { score: 10, dedup: true },
        },
      },
    });

    const { result } = renderHook(() => usePlatformDeduplication({ platform: platformWithoutCredentials }));
    expect(result.current).toBe(false);
  });

  it("returns false when no platform credentials are deduplicated", () => {
    mockUseWidgetPassportScore.mockReturnValue({
      data: {
        stamps: {
          "discord-cred-1": { score: 5, dedup: false },
          "discord-cred-2": { score: 5, dedup: false },
          "other-cred": { score: 10, dedup: true },
        },
      },
    });

    const { result } = renderHook(() => usePlatformDeduplication({ platform: mockPlatform }));
    expect(result.current).toBe(false);
  });

  it("returns true when any platform credential is deduplicated", () => {
    mockUseWidgetPassportScore.mockReturnValue({
      data: {
        stamps: {
          "discord-cred-1": { score: 0, dedup: true },
          "discord-cred-2": { score: 5, dedup: false },
        },
      },
    });

    const { result } = renderHook(() => usePlatformDeduplication({ platform: mockPlatform }));
    expect(result.current).toBe(true);
  });

  it("returns true when all platform credentials are deduplicated", () => {
    mockUseWidgetPassportScore.mockReturnValue({
      data: {
        stamps: {
          "discord-cred-1": { score: 0, dedup: true },
          "discord-cred-2": { score: 0, dedup: true },
        },
      },
    });

    const { result } = renderHook(() => usePlatformDeduplication({ platform: mockPlatform }));
    expect(result.current).toBe(true);
  });

  it("handles platform with single credential", () => {
    const singleCredPlatform = {
      ...mockPlatform,
      credentials: [{ id: "discord-cred-1", weight: "10" }],
    };

    mockUseWidgetPassportScore.mockReturnValue({
      data: {
        stamps: {
          "discord-cred-1": { score: 0, dedup: true },
        },
      },
    });

    const { result } = renderHook(() => usePlatformDeduplication({ platform: singleCredPlatform }));
    expect(result.current).toBe(true);
  });

  it("handles platform with multiple credentials where some don't exist in stamps", () => {
    mockUseWidgetPassportScore.mockReturnValue({
      data: {
        stamps: {
          "discord-cred-1": { score: 0, dedup: true },
          // discord-cred-2 is missing from stamps
        },
      },
    });

    const { result } = renderHook(() => usePlatformDeduplication({ platform: mockPlatform }));
    expect(result.current).toBe(true);
  });

  it("handles platform with credentials that don't exist in stamps", () => {
    mockUseWidgetPassportScore.mockReturnValue({
      data: {
        stamps: {
          "other-cred": { score: 10, dedup: true },
        },
      },
    });

    const { result } = renderHook(() => usePlatformDeduplication({ platform: mockPlatform }));
    expect(result.current).toBe(false);
  });
});