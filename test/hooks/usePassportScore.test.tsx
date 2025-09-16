import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import axios, { isAxiosError } from "axios";
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
const mockIsAxiosError = isAxiosError as jest.MockedFunction<typeof isAxiosError>;

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
    // Reset isAxiosError mock to default behavior
    mockIsAxiosError.mockReturnValue(false);
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
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it("should handle error states", async () => {
      const errorMessage = "API Error";
      mockedAxios.get.mockRejectedValueOnce(new Error(errorMessage));

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
      const message = "Rate limit exceeded";
      const error = new RateLimitError(message);
      
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("RateLimitError");
      expect(error.message).toBe(message);
    });
  });

  describe("processScoreResponseError", () => {
    it("should handle non-axios errors (covers line 231)", async () => {
      const nonAxiosError = new Error("Network error");
      mockIsAxiosError.mockReturnValue(false);
      mockedAxios.get.mockRejectedValueOnce(nonAxiosError);

      const { result } = renderHook(() =>
        usePassportScore({
          apiKey: "test-api-key",
          address: "0x123",
          scorerId: "test-scorer",
          embedServiceUrl: "https://test.com",
        })
      );

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBe(nonAxiosError);
    });

    it("should handle axios errors that are not 429 (covers line 231)", async () => {
      const axiosError = {
        name: "AxiosError",
        message: "Request failed with status code 500",
        code: "ERR_BAD_REQUEST",
        config: {},
        request: {},
        response: {
          status: 500,
          statusText: "Internal Server Error",
          headers: {},
          data: {},
          config: {},
        },
        isAxiosError: true,
        toJSON: () => ({}),
      };

      mockIsAxiosError.mockReturnValue(true);
      mockedAxios.get.mockRejectedValueOnce(axiosError);

      const { result } = renderHook(() =>
        usePassportScore({
          apiKey: "test-api-key",
          address: "0x123",
          scorerId: "test-scorer",
          embedServiceUrl: "https://test.com",
        })
      );

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBe(axiosError);
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
          embedServiceUrl: undefined,
        })
      );

      await act(async () => {
        result.current.verifyCredentials(["credential1"]);
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining("https://embed.passport.xyz/embed/auto-verify"),
        expect.any(Object),
        expect.any(Object)
      );
    });
  });

  describe("Error handling", () => {
    it("should handle 429 rate limit error with x-ratelimit-limit header", async () => {
      const rateLimitError = {
        name: "AxiosError",
        message: "Request failed with status code 429",
        code: "ERR_BAD_REQUEST",
        config: {},
        request: {},
        response: {
          status: 429,
          statusText: "Too Many Requests",
          headers: {
            "x-ratelimit-limit": "0",
          },
          data: {},
          config: {},
        },
        isAxiosError: true,
        toJSON: () => ({}),
      };

      // Mock isAxiosError to return true for this error
      mockIsAxiosError.mockReturnValue(true);

      mockedAxios.get.mockRejectedValueOnce(rateLimitError);

      const { result } = renderHook(() =>
        usePassportScore({
          apiKey: "test-api-key",
          address: "0x123",
          scorerId: "test-scorer",
          embedServiceUrl: "https://test.com",
        })
      );

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeInstanceOf(RateLimitError);
      expect(result.current.error.message).toBe(
        "This API key does not have permission to access the Embed API."
      );
    });

    it("should handle 429 rate limit error without x-ratelimit-limit header", async () => {
      const rateLimitError = {
        name: "AxiosError",
        message: "Request failed with status code 429",
        code: "ERR_BAD_REQUEST",
        config: {},
        request: {},
        response: {
          status: 429,
          statusText: "Too Many Requests",
          headers: {},
          data: {},
          config: {},
        },
        isAxiosError: true,
        toJSON: () => ({}),
      };

      // Mock isAxiosError to return true for this error
      mockIsAxiosError.mockReturnValue(true);

      mockedAxios.get.mockRejectedValueOnce(rateLimitError);

      const { result } = renderHook(() =>
        usePassportScore({
          apiKey: "test-api-key",
          address: "0x123",
          scorerId: "test-scorer",
          embedServiceUrl: "https://test.com",
        })
      );

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeInstanceOf(RateLimitError);
      expect(result.current.error.message).toBe("Rate limit exceeded.");
    });

    it("should handle error in verifyStampsForPassport function", async () => {
      const rateLimitError = {
        name: "AxiosError",
        message: "Request failed with status code 429",
        code: "ERR_BAD_REQUEST",
        config: {},
        request: {},
        response: {
          status: 429,
          statusText: "Too Many Requests",
          headers: {
            "x-ratelimit-limit": "0",
          },
          data: {},
          config: {},
        },
        isAxiosError: true,
        toJSON: () => ({}),
      };

      // Mock isAxiosError to return true for this error
      mockIsAxiosError.mockReturnValue(true);

      // Mock the POST request to fail (this covers line 267 in verifyStampsForPassport)
      mockedAxios.post.mockRejectedValueOnce(rateLimitError);

      const { result } = renderHook(
        () => useWidgetVerifyCredentials(),
        {
          wrapper: createWidgetWrapper(),
        }
      );

      await act(async () => {
        try {
          await result.current.verifyCredentials(["credential1"]);
        } catch (error) {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it("should handle non-axios errors in processScoreResponseError", async () => {
      // This test covers line 230: if (isAxiosError(error) && error.response?.status === 429)
      const nonAxiosError = new Error("Network error");
      
      // Mock isAxiosError to return false for this error
      mockIsAxiosError.mockReturnValue(false);

      mockedAxios.get.mockRejectedValueOnce(nonAxiosError);

      const { result } = renderHook(() =>
        usePassportScore({
          apiKey: "test-api-key",
          address: "0x123",
          scorerId: "test-scorer",
          embedServiceUrl: "https://test.com",
        })
      );

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBe(nonAxiosError); // Should return original error
    });

    it("should use default embed service URL when none provided", async () => {
      // This test covers line 278: const verifiedEmbedServiceUrl = embedServiceUrl || DEFAULT_EMBED_SERVICE_URL;
      mockedAxios.get.mockResolvedValueOnce({ data: mockScoreData });

      const { result } = renderHook(() =>
        usePassportScore({
          apiKey: "test-api-key",
          address: "0x123",
          scorerId: "test-scorer",
          // No embedServiceUrl provided - should use default
        })
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.data).toEqual(expect.objectContaining({
        address: "0x123",
        score: 75.5,
        passingScore: true,
      }));

      // Verify the default URL was used
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("https://embed.passport.xyz"),
        expect.any(Object)
      );
    });
  });

  describe("mutation onSuccess callback", () => {
    it("should update query cache on successful verification", async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: mockScoreData });

      const { result } = renderHook(
        () => ({
          useClient: usePassportQueryClient(),
          useVerify: useWidgetVerifyCredentials(),
        }),
        {
          wrapper: createWidgetWrapper(),
        }
      );

      const setQueryDataSpy = jest.spyOn(result.current.useClient, "setQueryData");

      await act(async () => {
        result.current.useVerify.verifyCredentials(["credential1"]);
      });

      await waitFor(() => {
        expect(setQueryDataSpy).toHaveBeenCalledWith(
          ["passportScore", "0x123", "test-scorer", "https://test.com"],
          expect.objectContaining({
            address: "0x123",
            score: 75.5,
            passingScore: true,
          })
        );
      });
    });
  });
});
