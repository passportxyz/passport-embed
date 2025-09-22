import { useMemo } from "react";
import { useWidgetPassportScore } from "./usePassportScore";
import { Platform } from "./stampTypes";
import { displayNumber } from "../utils";

export const usePlatformStatus = ({
  platform,
}: {
  platform: Platform;
}): {
  claimed: boolean;
  pointsGained: string;
} => {
  const { data } = useWidgetPassportScore();

  const rawPointsGained = Object.entries(data?.stamps || {}).reduce((total, [id, { score }]) => {
    if (score > 0 && platform.credentials.some((credential) => credential.id === id)) {
      total += score;
    }
    return total;
  }, 0);

  const claimed = rawPointsGained > 0;

  const pointsGained = displayNumber(rawPointsGained);

  return useMemo(() => ({ claimed, pointsGained }), [claimed, pointsGained]);
};
