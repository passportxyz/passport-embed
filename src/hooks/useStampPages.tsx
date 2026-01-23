import { useQuery } from "@tanstack/react-query";
import { SanitizedHTMLComponent } from "../components/SanitizedHTMLComponent";
import { fetchStampPages } from "../utils/stampDataApi";
import { PassportQueryProps } from "./usePassportScore";
import { usePassportQueryClient } from "./usePassportQueryClient";
import { INCLUDE_VISIT_PASSPORT_PAGE, VISIT_PASSPORT_HEADER, StampPage, RawStampPageData } from "./stampTypes";

// Hook that returns all stamp pages at once (new single-page design)
export const useStampPages = ({ apiKey, scorerId, embedServiceUrl }: PassportQueryProps) => {
  const queryClient = usePassportQueryClient();

  const {
    data: stampPages,
    isLoading,
    error,
    refetch,
  } = useQuery(
    {
      queryKey: ["stampPages", apiKey, scorerId, embedServiceUrl],
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

        if (INCLUDE_VISIT_PASSPORT_PAGE)
          formattedData.push({
            header: VISIT_PASSPORT_HEADER,
            platforms: [],
          });

        return formattedData;
      },
      staleTime: 1000 * 60 * 60,
      gcTime: 1000 * 60 * 60 * 2,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
    queryClient
  );

  return {
    stampPages: stampPages ?? [],
    isLoading,
    error,
    refetch,
  };
};
