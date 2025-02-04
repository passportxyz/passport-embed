import { usePassportQueryClient } from "../src/hooks/usePassportQueryClient";

import { renderHook } from "@testing-library/react";

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
