import { useMemo } from "react";
import { useWidgetPassportScore } from "./usePassportScore";
import { Platform } from "./stampTypes";

export const usePlatformDeduplication = ({ platform }: { platform: Platform }) => {
  const { data } = useWidgetPassportScore();

  return useMemo(() => {
    if (!data?.stamps) return false;

    // Check if any credential in this platform is deduplicated
    return platform.credentials.some((credential) => {
      const stampData = data.stamps[credential.id];
      if (!stampData) return false;

      // A stamp is deduplicated if:
      // 1. It has a dedup flag set to true
      // 2. Score is 0 (indicating points were claimed elsewhere)
      return stampData.dedup && stampData.score === 0;
    });
  }, [platform, data?.stamps]);
};
