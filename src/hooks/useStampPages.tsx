import { useEffect, useState } from "react";
import axios from "axios";
import { DEFAULT_IAM_URL } from "./usePassportScore";
import { QueryClient } from "@tanstack/react-query";
export type Credential = {
  id: string;
  weight: string;
};

export type Platform = {
  name: string;
  description: string;
  documentationLink: string;
  requireSignature?: boolean;
  requiresPopup?: boolean;
  popUpUrl?: string;
  credentials: Credential[];
  displayWeight: string;
};

export type StampPage = {
  header: string;
  platforms: Platform[];
};

type StampsMetadataResponse = StampPage[];

export const usePaginatedStampPages = ({
  apiKey,
  scorerId,
  overrideIamUrl,
  queryClient,
}: {
  apiKey: string;
  scorerId: string;
  overrideIamUrl?: string;
  queryClient?: QueryClient;
}) => {
  const [stampPages, setStampPages] = useState<StampPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const fetchStampPages = async () => {
      try {
        console.log("LARISA DEBUG : fetchStampPages .... ");
        // TODO: fix this to use propr url encoding 
        const response = await axios.get<StampsMetadataResponse>(
          `${overrideIamUrl || DEFAULT_IAM_URL}/embed/stamps/metadata?scorerId=${scorerId}`,
          {
            headers: {
              "X-API-KEY": apiKey,
              "Content-Type": "application/json",
            },
          }
        );

        const data = response.data;

        // Convert description from HTML string to JSX
        const formattedData = data.map((page: StampPage) => ({
          ...page,
          platforms: page.platforms.map((platform) => ({
            ...platform,
            description: platform.description,
            displayWeight: platform.displayWeight,
          })),
        }));

        setStampPages(formattedData);
      } catch (err) {
        console.error("Error fetching stamp pages:", err);
        setError("Failed to load stamp pages");
      } finally {
        setLoading(false);
      }
    };

    fetchStampPages();
  }, []);

  // Pagination controls
  const nextPage = () =>
    setIdx((prev) => Math.min(prev + 1, stampPages.length - 1));
  const prevPage = () => setIdx((prev) => Math.max(prev - 1, 0));

  const isFirstPage = idx === 0;
  const isLastPage = idx === stampPages.length - 1;

  const page = stampPages[idx] ?? null;

  return { page, nextPage, prevPage, isFirstPage, isLastPage, loading, error };
};
