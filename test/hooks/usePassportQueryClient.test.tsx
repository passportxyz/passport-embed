import { renderHook } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { usePassportQueryClient } from "../../src/hooks/usePassportQueryClient";
import { RateLimitError } from "../../src/hooks/usePassportScore";

describe("usePassportQueryClient", () => {
  it("should return a QueryClient instance", () => {
    const { result } = renderHook(() => usePassportQueryClient());
    
    expect(result.current).toBeInstanceOf(QueryClient);
  });

  it("should return the same QueryClient instance on multiple calls", () => {
    const { result: result1 } = renderHook(() => usePassportQueryClient());
    const { result: result2 } = renderHook(() => usePassportQueryClient());
    
    expect(result1.current).toBe(result2.current);
  });

  it("should have correct default options", () => {
    const { result } = renderHook(() => usePassportQueryClient());
    const queryClient = result.current;
    
    const defaultOptions = queryClient.getDefaultOptions();
    
    expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(true);
    expect(defaultOptions.queries?.refetchOnMount).toBe(true);
    expect(defaultOptions.queries?.staleTime).toBe(60000);
    expect(defaultOptions.queries?.gcTime).toBe(86400000);
  });

  describe("retry logic", () => {
    it("should not retry on RateLimitError", () => {
      const { result } = renderHook(() => usePassportQueryClient());
      const queryClient = result.current;
      
      const defaultOptions = queryClient.getDefaultOptions();
      const retryFn = defaultOptions.queries?.retry as (failureCount: number, error: unknown) => boolean;
      
      const rateLimitError = new RateLimitError("Rate limit exceeded");
      const shouldRetry = retryFn(1, rateLimitError);
      
      expect(shouldRetry).toBe(false);
    });

    it("should not retry on 429 error message", () => {
      const { result } = renderHook(() => usePassportQueryClient());
      const queryClient = result.current;
      
      const defaultOptions = queryClient.getDefaultOptions();
      const retryFn = defaultOptions.queries?.retry as (failureCount: number, error: unknown) => boolean;
      
      const error429 = new Error("Request failed with status 429");
      const shouldRetry = retryFn(1, error429);
      
      expect(shouldRetry).toBe(false);
    });

    it("should retry up to 2 times for other errors", () => {
      const { result } = renderHook(() => usePassportQueryClient());
      const queryClient = result.current;
      
      const defaultOptions = queryClient.getDefaultOptions();
      const retryFn = defaultOptions.queries?.retry as (failureCount: number, error: unknown) => boolean;
      
      const genericError = new Error("Generic error");
      
      expect(retryFn(0, genericError)).toBe(true);
      expect(retryFn(1, genericError)).toBe(true);
      expect(retryFn(2, genericError)).toBe(false);
    });

    it("should handle non-Error objects gracefully", () => {
      const { result } = renderHook(() => usePassportQueryClient());
      const queryClient = result.current;
      
      const defaultOptions = queryClient.getDefaultOptions();
      const retryFn = defaultOptions.queries?.retry as (failureCount: number, error: unknown) => boolean;
      
      const nonErrorObject = { message: "Something went wrong" };
      
      expect(retryFn(0, nonErrorObject)).toBe(true);
      expect(retryFn(1, nonErrorObject)).toBe(true);
      expect(retryFn(2, nonErrorObject)).toBe(false);
    });

    it("should handle string errors containing 429", () => {
      const { result } = renderHook(() => usePassportQueryClient());
      const queryClient = result.current;
      
      const defaultOptions = queryClient.getDefaultOptions();
      const retryFn = defaultOptions.queries?.retry as (failureCount: number, error: unknown) => boolean;
      
      const stringError = "HTTP 429 Too Many Requests";
      
      // String errors are not instances of Error, so they should retry normally
      expect(retryFn(0, stringError)).toBe(true);
      expect(retryFn(1, stringError)).toBe(true);
      expect(retryFn(2, stringError)).toBe(false);
    });
  });
});
