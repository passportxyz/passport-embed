import { useEffect, useState, ReactNode } from "react";
import { SanitizedHTMLComponent } from "../components/SanitizedHTMLComponent";
import { fetchStampPages } from "../utils/stampDataApi";

export type Credential = {
  id: string;
  weight: string;
};

export type Platform = {
  name: string;
  description: ReactNode;
  documentationLink: string;
  requiresSignature?: boolean;
  requiresPopup?: boolean;
  popupUrl?: string;
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

export type StampsMetadataResponse = RawStampPageData[];

export const usePaginatedStampPages = (props: {
  apiKey: string;
  scorerId: string;
  overrideIamUrl?: string;
}) => {
  const [stampPages, setStampPages] = useState<StampPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchStampPages(props);

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
    })();
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
