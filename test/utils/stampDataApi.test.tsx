import axios from "axios";
import { fetchStampPages } from "../../src/utils/stampDataApi";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("stampDataApi", () => {
  const mockApiKey = "test-api-key";
  const mockScorerId = "test-scorer";
  const mockEmbedServiceUrl = "https://test.com";

  const mockStampPagesResponse = [
    {
      header: "Social Media",
      platforms: [
        {
          platformId: "discord",
          name: "Discord",
          description: "Connect your Discord account",
          documentationLink: "https://docs.example.com/discord",
          credentials: [{ id: "discord-cred", weight: "10" }],
          displayWeight: "10",
          icon: "🎮",
        },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("fetchStampPages", () => {
    it("fetches stamp pages successfully", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: mockStampPagesResponse,
      });

      const result = await fetchStampPages({
        apiKey: mockApiKey,
        scorerId: mockScorerId,
        embedServiceUrl: mockEmbedServiceUrl,
      });

      expect(result).toEqual(mockStampPagesResponse);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${mockEmbedServiceUrl}/embed/stamps/metadata?scorerId=${mockScorerId}`,
        {
          headers: {
            "X-API-KEY": mockApiKey,
            "Content-Type": "application/json",
          },
        }
      );
    });

    it("handles API errors", async () => {
      const errorMessage = "API Error";
      mockedAxios.get.mockRejectedValueOnce(new Error(errorMessage));

      await expect(
        fetchStampPages({
          apiKey: mockApiKey,
          scorerId: mockScorerId,
          embedServiceUrl: mockEmbedServiceUrl,
        })
      ).rejects.toThrow(errorMessage);
    });

    it("handles network errors", async () => {
      const networkError = new Error("Network Error");
      mockedAxios.get.mockRejectedValueOnce(networkError);

      await expect(
        fetchStampPages({
          apiKey: mockApiKey,
          scorerId: mockScorerId,
          embedServiceUrl: mockEmbedServiceUrl,
        })
      ).rejects.toThrow("Network Error");
    });

    it("handles empty response", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: [],
      });

      const result = await fetchStampPages({
        apiKey: mockApiKey,
        scorerId: mockScorerId,
        embedServiceUrl: mockEmbedServiceUrl,
      });

      expect(result).toEqual([]);
    });

    it("handles null response", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: null,
      });

      const result = await fetchStampPages({
        apiKey: mockApiKey,
        scorerId: mockScorerId,
        embedServiceUrl: mockEmbedServiceUrl,
      });

      expect(result).toBeNull();
    });

    it("uses correct URL with different embed service URL", async () => {
      const customEmbedServiceUrl = "https://custom.com";
      mockedAxios.get.mockResolvedValueOnce({
        data: mockStampPagesResponse,
      });

      await fetchStampPages({
        apiKey: mockApiKey,
        scorerId: mockScorerId,
        embedServiceUrl: customEmbedServiceUrl,
      });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${customEmbedServiceUrl}/embed/stamps/metadata?scorerId=${mockScorerId}`,
        expect.any(Object)
      );
    });

    it("uses correct URL with different scorer ID", async () => {
      const customScorerId = "custom-scorer";
      mockedAxios.get.mockResolvedValueOnce({
        data: mockStampPagesResponse,
      });

      await fetchStampPages({
        apiKey: mockApiKey,
        scorerId: customScorerId,
        embedServiceUrl: mockEmbedServiceUrl,
      });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${mockEmbedServiceUrl}/embed/stamps/metadata?scorerId=${customScorerId}`,
        expect.any(Object)
      );
    });

    it("includes correct headers", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: mockStampPagesResponse,
      });

      await fetchStampPages({
        apiKey: mockApiKey,
        scorerId: mockScorerId,
        embedServiceUrl: mockEmbedServiceUrl,
      });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        {
          headers: {
            "X-API-KEY": mockApiKey,
            "Content-Type": "application/json",
          },
        }
      );
    });
  });
});
