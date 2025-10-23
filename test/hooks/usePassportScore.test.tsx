import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import axios from "axios";
import {
  usePassportScore,
  useWidgetVerifyCredentials,
  useWidgetIsQuerying,
  useWidgetPassportScore,
  useResetWidgetPassportScore,
  useVerifyCredentials,
  RateLimitError,
} from "../../src/hooks/usePassportScore";
import { QueryContext } from "../../src/contexts/QueryContext";
import { setupTestQueryClient } from "../testUtils";
import { usePassportQueryClient } from "../../src/hooks/usePassportQueryClient";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock response data
const mockScoreData = {
  address: "0x123",
  score: "75.5",
  passing_score: true,
  last_score_timestamp: "2024-01-30T12:00:00Z",
  expiration_timestamp: "2024-02-30T12:00:00Z",
  threshold: "70",
  stamps: {
    credential1: {
      score: "25.5",
      expiration_date: "2024-02-30T12:00:00Z",
      dedup: false,
    },
  },
};

const mockQueryContextValue = {
  apiKey: "test-api-key",
  address: "0x123",
  scorerId: "test-scorer",
  embedServiceUrl: "https://test.com",
};

// Test wrapper setup
const createWidgetWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryContext.Provider value={mockQueryContextValue}>{children}</QueryContext.Provider>
  );
};

describe("Passport Score Hooks", () => {
  setupTestQueryClient();

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe("usePassportScore", () => {
    it("should fetch and transform passport score data", async () => {
      mockedAxios.get.mockImplementationOnce(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return { data: mockScoreData };
      });

      const { result } = renderHook(() =>
        usePassportScore({
          apiKey: "test-api-key",
          address: "0x123",
          scorerId: "test-scorer",
          embedServiceUrl: "https://test.com",
        })
      );

      // Initial state should be loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();

      // Wait for the query to complete
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
      });

      // Verify transformed data
      expect(result.current.data).toEqual({
        address: "0x123",
        score: 75.5,
        passingScore: true,
        lastScoreTimestamp: new Date("2024-01-30T12:00:00Z"),
        expirationTimestamp: new Date("2024-02-30T12:00:00Z"),
        threshold: 70,
        stamps: {
          credential1: {
            score: 25.5,
            dedup: false,
            expirationDate: new Date("2024-02-30T12:00:00Z"),
          },
        },
      });
    });

    it("should not fetch when address is undefined", () => {
      const { result } = renderHook(() =>
        usePassportScore({
          apiKey: "test-api-key",
          address: undefined,
          scorerId: "test-scorer",
          embedServiceUrl: "https://test.com",
        })
      );

      expect(result.current.isLoading).toBe(false);
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it("should handle error states", async () => {
      const errorMessage = "API Error";
      mockedAxios.post.mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() =>
        usePassportScore({
          apiKey: "test-api-key",
          address: "0x123",
          scorerId: "test-scorer",
          embedServiceUrl: "https://test.com",
        })
      );

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeDefined();
    });
  });

  describe("useWidgetVerifyCredentials", () => {
    it("should verify credentials and call API with correct parameters", async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: mockScoreData });

      const { result } = renderHook(() => useWidgetVerifyCredentials(), {
        wrapper: createWidgetWrapper(),
      });

      await act(async () => {
        result.current.verifyCredentials(["credential1"]);
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          credentialIds: ["credential1"],
        }),
        expect.any(Object)
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });

    it("should return credential errors from the API response", async () => {
      const mockCredentialErrors = [
        { provider: "Discord", error: "User not found in Discord" },
        { provider: "GitHub", error: "Account does not meet requirements" },
      ];

      const mockScoreWithErrors = {
        ...mockScoreData,
        credentialErrors: mockCredentialErrors,
      };

      mockedAxios.post.mockResolvedValueOnce({ data: mockScoreWithErrors });

      const { result } = renderHook(() => useWidgetVerifyCredentials(), {
        wrapper: createWidgetWrapper(),
      });

      await act(async () => {
        result.current.verifyCredentials(["discord", "github"]);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Check credentialErrors after mutation is successful
      expect(result.current.credentialErrors).toEqual(mockCredentialErrors);
    });

    it("should return undefined credential errors when response has no errors", async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: mockScoreData });

      const { result } = renderHook(() => useWidgetVerifyCredentials(), {
        wrapper: createWidgetWrapper(),
      });

      await act(async () => {
        result.current.verifyCredentials(["credential1"]);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Check credentialErrors after mutation is successful
      expect(result.current.credentialErrors).toBeUndefined();
    });

    it("should return empty array when credentialErrors is empty in response", async () => {
      const mockScoreWithEmptyErrors = {
        ...mockScoreData,
        credentialErrors: [],
      };

      mockedAxios.post.mockResolvedValueOnce({ data: mockScoreWithEmptyErrors });

      const { result } = renderHook(() => useWidgetVerifyCredentials(), {
        wrapper: createWidgetWrapper(),
      });

      await act(async () => {
        result.current.verifyCredentials(["credential1"]);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Check credentialErrors after mutation is successful
      expect(result.current.credentialErrors).toEqual([]);
    });

    it("should handle API errors properly while returning undefined credentialErrors", async () => {
      const errorMessage = "Network error";
      mockedAxios.post.mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useWidgetVerifyCredentials(), {
        wrapper: createWidgetWrapper(),
      });

      await act(async () => {
        result.current.verifyCredentials(["credential1"]);
      });

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
        expect(result.current.credentialErrors).toBeUndefined();
      });
    });
  });

  describe("useWidgetIsQuerying", () => {
    it("should return true when queries are in progress", async () => {
      mockedAxios.post.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: mockScoreData }), 100))
      );

      const { result } = renderHook(() => ({
        useScore: usePassportScore({
          apiKey: "test-api-key",
          address: "0x123",
          scorerId: "test-scorer",
          embedServiceUrl: "https://test.com",
        }),
        useIsQuerying: useWidgetIsQuerying(),
      }));

      expect(result.current.useIsQuerying).toBe(true);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
      });

      expect(result.current.useIsQuerying).toBe(false);
    });
  });

  describe("useResetWidgetPassportScore", () => {
    it("should invalidate passport score query", async () => {
      const { result } = renderHook(
        () => ({
          useClient: usePassportQueryClient(),
          useReset: useResetWidgetPassportScore(),
        }),
        {
          wrapper: createWidgetWrapper(),
        }
      );

      const spy = jest.spyOn(result.current.useClient, "invalidateQueries");

      act(() => {
        result.current.useReset.resetPassportScore();
      });

      expect(spy).toHaveBeenCalledWith({
        queryKey: ["passportScore", "0x123", "test-scorer", "https://test.com"],
      });
    });
  });

  it("should share a client between the widget and non-widget hook", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockScoreData });

    const { result } = renderHook(
      () => ({
        useScore: usePassportScore(mockQueryContextValue),
        useWidgetScore: useWidgetPassportScore(),
      }),
      {
        wrapper: createWidgetWrapper(),
      }
    );

    await waitFor(() => expect(result.current.useScore.isLoading).toBe(false));
    await waitFor(() => expect(result.current.useWidgetScore.isLoading).toBe(false));

    expect(result.current.useScore.data).toEqual(result.current.useWidgetScore.data);

    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  describe("RateLimitError", () => {
    it("should create RateLimitError with correct name and message", () => {
      const errorMessage = "Rate limit exceeded";
      const error = new RateLimitError(errorMessage);
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(RateLimitError);
      expect(error.name).toBe("RateLimitError");
      expect(error.message).toBe(errorMessage);
    });
  });

  describe("useVerifyCredentials", () => {
    it("should use default embed service URL when not provided", async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: mockScoreData });

      const { result } = renderHook(() =>
        useVerifyCredentials({
          apiKey: "test-api-key",
          address: "0x123",
          scorerId: "test-scorer",
          embedServiceUrl: undefined, // This should trigger the default URL fallback
        })
      );

      await act(async () => {
        result.current.verifyCredentials(["credential1"]);
      });

      // Verify that the API was called with the default URL
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining("https://embed.passport.xyz"), // Default URL
        expect.objectContaining({
          credentialIds: ["credential1"],
        }),
        expect.any(Object)
      );
    });

    it("should use provided embed service URL when available", async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: mockScoreData });

      const customUrl = "https://custom-api.com";
      const { result } = renderHook(() =>
        useVerifyCredentials({
          apiKey: "test-api-key",
          address: "0x123",
          scorerId: "test-scorer",
          embedServiceUrl: customUrl,
        })
      );

      await act(async () => {
        result.current.verifyCredentials(["credential1"]);
      });

      // Verify that the API was called with the custom URL
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining(customUrl),
        expect.objectContaining({
          credentialIds: ["credential1"],
        }),
        expect.any(Object)
      );
    });
  });

  describe("Rate limit error handling", () => {
    describe("processScoreResponseError mapping for GET (lines 250-253)", () => {
      it("maps 429 with x-ratelimit-limit=0 to permission RateLimitError", async () => {
        const rateLimitError = Object.assign(new Error("Rate limit exceeded"), {
          response: { status: 429, headers: { "x-ratelimit-limit": "0" } },
        });

        (mockedAxios.isAxiosError as unknown as jest.Mock) = jest.fn(() => true);
        mockedAxios.get.mockRejectedValueOnce(rateLimitError);

        const { result } = renderHook(() =>
          usePassportScore({
            apiKey: "test-api-key",
            address: "0x123",
            scorerId: "test-scorer",
            embedServiceUrl: "https://test.com",
          })
        );

        await waitFor(() => {
          expect(result.current.isError).toBe(true);
        });

        expect(result.current.error).toBeInstanceOf(RateLimitError);
        expect((result.current.error as RateLimitError).message).toBe(
          "This API key does not have permission to access the Embed API."
        );
      });

      it("maps 429 without x-ratelimit-limit to generic RateLimitError", async () => {
        const rateLimitError = Object.assign(new Error("Rate limit exceeded"), {
          response: { status: 429, headers: {} },
        });

        (mockedAxios.isAxiosError as unknown as jest.Mock) = jest.fn(() => true);
        mockedAxios.get.mockRejectedValueOnce(rateLimitError);

        const { result } = renderHook(() =>
          usePassportScore({
            apiKey: "test-api-key",
            address: "0x123",
            scorerId: "test-scorer",
            embedServiceUrl: "https://test.com",
          })
        );

        await waitFor(() => {
          expect(result.current.isError).toBe(true);
        });

        expect(result.current.error).toBeInstanceOf(RateLimitError);
        expect((result.current.error as RateLimitError).message).toBe("Rate limit exceeded.");
      });

      it("maps 429 with non-zero x-ratelimit-limit to generic RateLimitError", async () => {
        const rateLimitError = Object.assign(new Error("Rate limit exceeded"), {
          response: { status: 429, headers: { "x-ratelimit-limit": "100" } },
        });

        (mockedAxios.isAxiosError as unknown as jest.Mock) = jest.fn(() => true);
        mockedAxios.get.mockRejectedValueOnce(rateLimitError);

        const { result } = renderHook(() =>
          usePassportScore({
            apiKey: "test-api-key",
            address: "0x123",
            scorerId: "test-scorer",
            embedServiceUrl: "https://test.com",
          })
        );

        await waitFor(() => {
          expect(result.current.isError).toBe(true);
        });

        expect(result.current.error).toBeInstanceOf(RateLimitError);
        expect((result.current.error as RateLimitError).message).toBe("Rate limit exceeded.");
      });
    });
    it("should handle 429 rate limit error with x-ratelimit-limit header set to 0 in usePassportScore", async () => {
      // Create a proper axios error that will be recognized by isAxiosError
      const rateLimitError = new Error("Rate limit exceeded");
      Object.assign(rateLimitError, {
        response: {
          status: 429,
          headers: {
            "x-ratelimit-limit": "0",
          },
        },
        isAxiosError: true,
        config: {},
        code: "ECONNABORTED",
        request: {},
      });

      mockedAxios.post.mockRejectedValueOnce(rateLimitError);

      const { result } = renderHook(() =>
        usePassportScore({
          apiKey: "test-api-key",
          address: "0x123",
          scorerId: "test-scorer",
          embedServiceUrl: "https://test.com",
        })
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // The error should be processed and potentially transformed
      expect(result.current.error).toBeDefined();
    });

    it("should handle 429 rate limit error without x-ratelimit-limit header in usePassportScore", async () => {
      // Create a proper axios error that will be recognized by isAxiosError
      const rateLimitError = new Error("Rate limit exceeded");
      Object.assign(rateLimitError, {
        response: {
          status: 429,
          headers: {},
        },
        isAxiosError: true,
        config: {},
        code: "ECONNABORTED",
        request: {},
      });

      mockedAxios.post.mockRejectedValueOnce(rateLimitError);

      const { result } = renderHook(() =>
        usePassportScore({
          apiKey: "test-api-key",
          address: "0x123",
          scorerId: "test-scorer",
          embedServiceUrl: "https://test.com",
        })
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // The error should be processed and potentially transformed
      expect(result.current.error).toBeDefined();
    });

    it("should handle 429 rate limit error with non-zero x-ratelimit-limit header in usePassportScore", async () => {
      // Create a proper axios error that will be recognized by isAxiosError
      const rateLimitError = new Error("Rate limit exceeded");
      Object.assign(rateLimitError, {
        response: {
          status: 429,
          headers: {
            "x-ratelimit-limit": "100",
          },
        },
        isAxiosError: true,
        config: {},
        code: "ECONNABORTED",
        request: {},
      });

      mockedAxios.post.mockRejectedValueOnce(rateLimitError);

      const { result } = renderHook(() =>
        usePassportScore({
          apiKey: "test-api-key",
          address: "0x123",
          scorerId: "test-scorer",
          embedServiceUrl: "https://test.com",
        })
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // The error should be processed and potentially transformed
      expect(result.current.error).toBeDefined();
    });

    it("should handle 429 rate limit error with x-ratelimit-limit header set to 0 in useWidgetVerifyCredentials", async () => {
      // Create a proper axios error that will be recognized by isAxiosError
      const rateLimitError = new Error("Rate limit exceeded");
      Object.assign(rateLimitError, {
        response: {
          status: 429,
          headers: {
            "x-ratelimit-limit": "0",
          },
        },
        isAxiosError: true,
        config: {},
        code: "ECONNABORTED",
        request: {},
      });

      mockedAxios.post.mockRejectedValueOnce(rateLimitError);

      const { result } = renderHook(() => useWidgetVerifyCredentials(), {
        wrapper: createWidgetWrapper(),
      });

      await act(async () => {
        result.current.verifyCredentials(["credential1"]);
      });

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });

      // The error should be processed and potentially transformed
      expect(result.current.error).toBeDefined();
    });

    it("should handle 429 rate limit error without x-ratelimit-limit header in useWidgetVerifyCredentials", async () => {
      // Create a proper axios error that will be recognized by isAxiosError
      const rateLimitError = new Error("Rate limit exceeded");
      Object.assign(rateLimitError, {
        response: {
          status: 429,
          headers: {},
        },
        isAxiosError: true,
        config: {},
        code: "ECONNABORTED",
        request: {},
      });

      mockedAxios.post.mockRejectedValueOnce(rateLimitError);

      const { result } = renderHook(() => useWidgetVerifyCredentials(), {
        wrapper: createWidgetWrapper(),
      });

      await act(async () => {
        result.current.verifyCredentials(["credential1"]);
      });

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });

      // The error should be processed and potentially transformed
      expect(result.current.error).toBeDefined();
    });

    it("should handle 429 rate limit error with non-zero x-ratelimit-limit header in useWidgetVerifyCredentials", async () => {
      // Create a proper axios error that will be recognized by isAxiosError
      const rateLimitError = new Error("Rate limit exceeded");
      Object.assign(rateLimitError, {
        response: {
          status: 429,
          headers: {
            "x-ratelimit-limit": "100",
          },
        },
        isAxiosError: true,
        config: {},
        code: "ECONNABORTED",
        request: {},
      });

      mockedAxios.post.mockRejectedValueOnce(rateLimitError);

      const { result } = renderHook(() => useWidgetVerifyCredentials(), {
        wrapper: createWidgetWrapper(),
      });

      await act(async () => {
        result.current.verifyCredentials(["credential1"]);
      });

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });

      // The error should be processed and potentially transformed
      expect(result.current.error).toBeDefined();
    });
  });

});
