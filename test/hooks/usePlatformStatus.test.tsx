import React from "react";
import { renderHook } from "@testing-library/react";

import { usePlatformStatus } from "../../src/hooks/usePlatformStatus";
import { useWidgetPassportScore } from "../../src/hooks/usePassportScore";

jest.mock("../../src/hooks/usePassportScore");

const mockUseWidgetPassportScore = useWidgetPassportScore as jest.Mock;

describe("usePlatformStatus Hook", () => {
  const mockPlatform = {
    name: "TestPlatform",
    credentials: [
      { id: "cred1", weight: "1" },
      { id: "cred2", weight: "2" },
    ],
    description: <div>Test</div>,
    documentationLink: "test.com",
    displayWeight: "3",
  };

  beforeEach(() => {
    mockUseWidgetPassportScore.mockReset();
  });

  it("should return claimed true when platform credentials are verified", () => {
    mockUseWidgetPassportScore.mockReturnValue({
      data: {
        stamps: {
          cred1: { score: 1 },
          cred2: { score: 2 },
        },
      },
    });

    const { result } = renderHook(() => usePlatformStatus({ platform: mockPlatform }));
    expect(result.current.claimed).toBe(true);
  });

  it("should return claimed false when no platform credentials are verified", () => {
    mockUseWidgetPassportScore.mockReturnValue({
      data: {
        stamps: {
          other_cred: { score: 1 },
        },
      },
    });

    const { result } = renderHook(() => usePlatformStatus({ platform: mockPlatform }));
    expect(result.current.claimed).toBe(false);
  });
});
