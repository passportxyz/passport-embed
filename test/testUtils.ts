import {
  __test_initializePassportQueryClient,
  usePassportQueryClient,
} from "../src/hooks/usePassportQueryClient";

export const setupTestQueryClient = () => {
  beforeEach(() => {
    __test_initializePassportQueryClient({
      queries: {
        retry: false,
      },
    });
  });

  afterEach(() => {
    usePassportQueryClient().clear();
  });
};
