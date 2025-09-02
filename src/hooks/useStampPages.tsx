import { useState, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { SanitizedHTMLComponent } from "../components/SanitizedHTMLComponent";
import { fetchStampPages } from "../utils/stampDataApi";
import { PassportQueryProps } from "./usePassportScore";
import { usePassportQueryClient } from "./usePassportQueryClient";

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

export const usePaginatedStampPages = ({ apiKey, scorerId, embedServiceUrl }: PassportQueryProps) => {
  const queryClient = usePassportQueryClient();
  const [idx, setIdx] = useState(0);

  const {
    data: stampPages,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['stampPages', apiKey, scorerId, embedServiceUrl],
    queryFn: async () => {
      const data = await fetchStampPages({
        apiKey,
        scorerId,
        embedServiceUrl,
      });

      const formattedData: StampPage[] = data.map((page: RawStampPageData) => ({
        ...page,
        platforms: page.platforms.map((platform) => ({
          ...platform,
          description: <SanitizedHTMLComponent html={platform.description || ""} />,
          displayWeight: platform.displayWeight,
        })),
      }));

      return formattedData;
    },
    staleTime: 1000 * 60 * 60, // Consider data fresh for 1 hour
    gcTime: 1000 * 60 * 60 * 2, // Keep in cache for 2 hours
    refetchOnWindowFocus: false, // Don't refetch when tab regains focus
    refetchOnMount: false, // Don't refetch if data exists in cache
  }, queryClient);

  // Pagination controls
  const nextPage = () => setIdx((prev) => Math.min(prev + 1, (stampPages?.length ?? 1) - 1));
  const prevPage = () => setIdx((prev) => Math.max(prev - 1, 0));

  const isFirstPage = idx === 0;
  const isLastPage = idx === (stampPages?.length ?? 1) - 1;

  const page = stampPages?.[idx] ?? null;

  return { 
    page, 
    nextPage, 
    prevPage, 
    isFirstPage, 
    isLastPage, 
    isLoading, 
    error,
    refetch
  };
};
