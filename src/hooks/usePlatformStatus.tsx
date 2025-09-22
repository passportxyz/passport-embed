import { useMemo } from "react";
import { useWidgetPassportScore } from "./usePassportScore";
import { Platform } from "./stampTypes";

export const usePlatformStatus = ({ platform }: { platform: Platform }) => {
  const { data } = useWidgetPassportScore();

  const claimedCredentialIds = Object.entries(data?.stamps || {}).reduce((claimedIds, [id, { score }]) => {
    if (score > 0) {
      claimedIds.push(id);
    }
    return claimedIds;
  }, [] as string[]);

  const claimedCredentials = platform.credentials.filter((credential) => claimedCredentialIds.includes(credential.id));
  const claimed = claimedCredentials.length > 0;
  const pointsGained = claimedCredentials.reduce((total, credential) => {
    return total + parseFloat(credential.weight);
  }, 0);

  return useMemo(() => ({ claimed, pointsGained }), [claimed, pointsGained]);
};
