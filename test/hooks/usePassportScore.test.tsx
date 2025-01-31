/** @jsxImportSource react */

import React from "react";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import {
  usePassportScore,
  useWidgetVerifyCredentials,
  useWidgetIsQuerying,
  useResetPassportScore,
} from "../../src/hooks/usePassportScore";
import { QueryContext } from "../../src/contexts/QueryContext";

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

// Test wrapper setup
const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <QueryContext.Provider
        value={{
          apiKey: "test-api-key",
          address: "0x123",
          scorerId: "test-scorer",
          queryClient,
        }}
      >
        {children}
      </QueryContext.Provider>
    </QueryClientProvider>
  );
};

describe("Passport Hooks", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe("usePassportScore", () => {
    it("should fetch and transform passport score data", async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: mockScoreData });

      const { result } = renderHook(
        () =>
          usePassportScore({
            apiKey: "test-api-key",
            address: "0x123",
            scorerId: "test-scorer",
            queryClient,
          }),
        {
          wrapper: createWrapper(queryClient),
        }
      );

      // Initial state should be loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();

      // Wait for the query to complete
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
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
      const { result } = renderHook(
        () =>
          usePassportScore({
            apiKey: "test-api-key",
            address: undefined,
            scorerId: "test-scorer",
            queryClient,
          }),
        {
          wrapper: createWrapper(queryClient),
        }
      );

      expect(result.current.isLoading).toBe(false);
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it("should handle error states", async () => {
      const errorMessage = "API Error";
      mockedAxios.post.mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(
        () =>
          usePassportScore({
            apiKey: "test-api-key",
            address: "0x123",
            scorerId: "test-scorer",
            queryClient,
          }),
        {
          wrapper: createWrapper(queryClient),
        }
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBeDefined();
    });
  });

  describe("useWidgetVerifyCredentials", () => {
    it("should verify credentials and update query cache", async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: mockScoreData });

      const { result } = renderHook(() => useWidgetVerifyCredentials(), {
        wrapper: createWrapper(queryClient),
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
    });
  });

  describe("useWidgetIsQuerying", () => {
    it("should return true when queries are in progress", async () => {
      mockedAxios.post.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: mockScoreData }), 100)
          )
      );

      const { result } = renderHook(
        () => ({
          score: usePassportScore({
            apiKey: "test-api-key",
            address: "0x123",
            scorerId: "test-scorer",
            queryClient,
          }),
          isQuerying: useWidgetIsQuerying(),
        }),
        {
          wrapper: createWrapper(queryClient),
        }
      );

      expect(result.current.isQuerying).toBe(true);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
      });

      expect(result.current.isQuerying).toBe(false);
    });
  });

  describe("useResetPassportScore", () => {
    it("should invalidate passport score query", async () => {
      const { result } = renderHook(() => useResetPassportScore(), {
        wrapper: createWrapper(queryClient),
      });

      const spy = jest.spyOn(queryClient, "invalidateQueries");

      act(() => {
        result.current.resetPassportScore();
      });

      expect(spy).toHaveBeenCalledWith({
        queryKey: ["passportScore", "0x123", "test-scorer", undefined],
      });
    });
  });
});
