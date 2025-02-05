import { useEffect, useState, ReactNode } from "react";
import axios from "axios";
import { DEFAULT_IAM_URL } from "./usePassportScore";
import { SanitizedHTMLComponent } from "../components/SanitizedHTMLComponent";

export type Credential = {
  id: string;
  weight: string;
};

export type Platform = {
  name: string;
  description: ReactNode;
  documentationLink: string;
  requireSignature?: boolean;
  requiresPopup?: boolean;
  popUpUrl?: string;
  credentials: Credential[];
  displayWeight: string;
};

type RawPlatformData = Omit<Platform, "description"> & {
  description: string;
};

export type StampPage = {
  header: string;
  platforms: Platform[];
};

type RawStampPageData = Omit<StampPage, "platforms"> & {
  platforms: RawPlatformData[];
};

type StampsMetadataResponse = RawStampPageData[];

export const usePaginatedStampPages = ({
  apiKey,
  scorerId,
  overrideIamUrl,
}: {
  apiKey: string;
  scorerId: string;
  overrideIamUrl?: string;
}) => {
  const [stampPages, setStampPages] = useState<StampPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const fetchStampPages = async () => {
      try {
        // TODO: fix this to use propr url encoding
        const response = await axios.get<StampsMetadataResponse>(
          `${
            overrideIamUrl || DEFAULT_IAM_URL
          }/embed/stamps/metadata?scorerId=${scorerId}`,
          {
            headers: {
              "X-API-KEY": apiKey,
              "Content-Type": "application/json",
            },
          }
        );

        const data = response.data;

        // Convert description from HTML string to JSX
        const formattedData: StampPage[] = data.map(
          (page: RawStampPageData) => ({
            ...page,
            platforms: page.platforms.map((platform) => ({
              ...platform,
              description: (
                <SanitizedHTMLComponent html={platform.description || ""} />
              ),
              displayWeight: platform.displayWeight,
            })),
          })
        );

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
