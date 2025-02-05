import { renderHook } from "@testing-library/react";
import { usePassportQueryClient } from "../src/hooks/usePassportQueryClient";

// Overrides QueryClient settings to be test-friendly
export const setupTestQueryClient = () => {
  beforeEach(() => {
    const { result } = renderHook(() => usePassportQueryClient());
    result.current.setDefaultOptions({
      queries: {
        retry: false,
      },
    });
  });

  afterEach(() => {
    usePassportQueryClient().clear();
  });
};

// Suppresses console.error in the test logs, and confirms
// that console.error was called at least once
export const mockExpectedConsoleErrorLog = () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
};
