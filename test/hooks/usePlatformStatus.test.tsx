import React from "react";
import { renderHook } from "@testing-library/react";
import { usePlatformStatus } from "../../src/hooks/usePlatformStatus";
import { useWidgetPassportScore } from "../../src/hooks/usePassportScore";

// Mock the useWidgetPassportScore hook
jest.mock("../../src/hooks/usePassportScore");
const mockUseWidgetPassportScore = useWidgetPassportScore as jest.Mock;

describe("usePlatformStatus", () => {
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

  it("returns not claimed when no stamps data", () => {
    mockUseWidgetPassportScore.mockReturnValue({
      data: null,
    });

    const { result } = renderHook(() => usePlatformStatus({ platform: mockPlatform }));
    expect(result.current.claimed).toBe(false);
    expect(result.current.pointsGained).toBe("0");
  });

  it("returns not claimed when no stamps object", () => {
    mockUseWidgetPassportScore.mockReturnValue({
      data: {},
    });

    const { result } = renderHook(() => usePlatformStatus({ platform: mockPlatform }));
    expect(result.current.claimed).toBe(false);
    expect(result.current.pointsGained).toBe("0");
  });

  it("returns not claimed when platform has no credentials", () => {
    const platformWithoutCredentials = {
      ...mockPlatform,
      credentials: [],
    };

    mockUseWidgetPassportScore.mockReturnValue({
      data: {
        stamps: {
          "other-cred": { score: 10 },
        },
      },
    });

    const { result } = renderHook(() => usePlatformStatus({ platform: platformWithoutCredentials }));
    expect(result.current.claimed).toBe(false);
    expect(result.current.pointsGained).toBe("0");
  });

  it("returns not claimed when no platform credentials have positive scores", () => {
    mockUseWidgetPassportScore.mockReturnValue({
      data: {
        stamps: {
          "discord-cred-1": { score: 0 },
          "discord-cred-2": { score: 0 },
          "other-cred": { score: 10 },
        },
      },
    });

    const { result } = renderHook(() => usePlatformStatus({ platform: mockPlatform }));
    expect(result.current.claimed).toBe(false);
    expect(result.current.pointsGained).toBe("0");
  });

  it("returns claimed when any platform credential has positive score", () => {
    mockUseWidgetPassportScore.mockReturnValue({
      data: {
        stamps: {
          "discord-cred-1": { score: 5 },
          "discord-cred-2": { score: 0 },
        },
      },
    });

    const { result } = renderHook(() => usePlatformStatus({ platform: mockPlatform }));
    expect(result.current.claimed).toBe(true);
    expect(result.current.pointsGained).toBe("5");
  });

  it("returns claimed with correct points when multiple credentials have positive scores", () => {
    mockUseWidgetPassportScore.mockReturnValue({
      data: {
        stamps: {
          "discord-cred-1": { score: 5 },
          "discord-cred-2": { score: 3 },
        },
      },
    });

    const { result } = renderHook(() => usePlatformStatus({ platform: mockPlatform }));
    expect(result.current.claimed).toBe(true);
    expect(result.current.pointsGained).toBe("8");
  });

  it("handles platform with single credential", () => {
    const singleCredPlatform = {
      ...mockPlatform,
      credentials: [{ id: "discord-cred-1", weight: "10" }],
    };

    mockUseWidgetPassportScore.mockReturnValue({
      data: {
        stamps: {
          "discord-cred-1": { score: 10 },
        },
      },
    });

    const { result } = renderHook(() => usePlatformStatus({ platform: singleCredPlatform }));
    expect(result.current.claimed).toBe(true);
    expect(result.current.pointsGained).toBe("10");
  });

  it("handles platform with credentials that don't exist in stamps", () => {
    mockUseWidgetPassportScore.mockReturnValue({
      data: {
        stamps: {
          "other-cred": { score: 10 },
        },
      },
    });

    const { result } = renderHook(() => usePlatformStatus({ platform: mockPlatform }));
    expect(result.current.claimed).toBe(false);
    expect(result.current.pointsGained).toBe("0");
  });

  it("handles platform with mixed existing and non-existing credentials", () => {
    mockUseWidgetPassportScore.mockReturnValue({
      data: {
        stamps: {
          "discord-cred-1": { score: 5 },
          // discord-cred-2 is missing from stamps
          "other-cred": { score: 10 },
        },
      },
    });

    const { result } = renderHook(() => usePlatformStatus({ platform: mockPlatform }));
    expect(result.current.claimed).toBe(true);
    expect(result.current.pointsGained).toBe("5");
  });

  it("handles decimal scores correctly", () => {
    mockUseWidgetPassportScore.mockReturnValue({
      data: {
        stamps: {
          "discord-cred-1": { score: 2.5 },
          "discord-cred-2": { score: 1.5 },
        },
      },
    });

    const { result } = renderHook(() => usePlatformStatus({ platform: mockPlatform }));
    expect(result.current.claimed).toBe(true);
    expect(result.current.pointsGained).toBe("4");
  });

  it("handles negative scores correctly", () => {
    mockUseWidgetPassportScore.mockReturnValue({
      data: {
        stamps: {
          "discord-cred-1": { score: -5 },
          "discord-cred-2": { score: 3 },
        },
      },
    });

    const { result } = renderHook(() => usePlatformStatus({ platform: mockPlatform }));
    expect(result.current.claimed).toBe(true);
    expect(result.current.pointsGained).toBe("3");
  });
});