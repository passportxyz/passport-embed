import axios from "axios";
import { fetchStampPages } from "../../src/utils/stampDataApi";
import { PassportQueryProps } from "../../src/hooks/usePassportScore";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("stampDataApi", () => {
  const mockProps: PassportQueryProps = {
    apiKey: "test-api-key",
    scorerId: "test-scorer-id",
    embedServiceUrl: "https://api.example.com",
  };

  const mockResponse = {
    data: {
      stamps: [
        {
          id: "stamp1",
          name: "Test Stamp",
          description: "A test stamp",
        },
      ],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("fetchStampPages", () => {
    it("should make GET request with correct URL and headers", async () => {
      mockedAxios.get.mockResolvedValue(mockResponse);

      await fetchStampPages(mockProps);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${mockProps.embedServiceUrl}/embed/stamps/metadata?scorerId=${mockProps.scorerId}`,
        {
          headers: {
            "X-API-KEY": mockProps.apiKey,
            "Content-Type": "application/json",
          },
        }
      );
    });

    it("should return response data on successful request", async () => {
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await fetchStampPages(mockProps);

      expect(result).toEqual(mockResponse.data);
    });

    it("should throw error when request fails", async () => {
      const errorMessage = "Network Error";
      mockedAxios.get.mockRejectedValue(new Error(errorMessage));

      await expect(fetchStampPages(mockProps)).rejects.toThrow(errorMessage);
    });

    it("should handle 404 error", async () => {
      const error404 = {
        response: {
          status: 404,
          data: { message: "Not found" },
        },
      };
      mockedAxios.get.mockRejectedValue(error404);

      await expect(fetchStampPages(mockProps)).rejects.toEqual(error404);
    });

    it("should handle 401 unauthorized error", async () => {
      const error401 = {
        response: {
          status: 401,
          data: { message: "Unauthorized" },
        },
      };
      mockedAxios.get.mockRejectedValue(error401);

      await expect(fetchStampPages(mockProps)).rejects.toEqual(error401);
    });

    it("should construct URL correctly with different parameters", async () => {
      const customProps: PassportQueryProps = {
        apiKey: "custom-key",
        scorerId: "custom-scorer",
        embedServiceUrl: "https://custom-api.com",
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      await fetchStampPages(customProps);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://custom-api.com/embed/stamps/metadata?scorerId=custom-scorer",
        {
          headers: {
            "X-API-KEY": "custom-key",
            "Content-Type": "application/json",
          },
        }
      );
    });
  });
});
