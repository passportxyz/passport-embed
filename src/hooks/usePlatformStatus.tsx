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

  const claimed = platform.credentials.some((credential) => claimedCredentialIds.includes(credential.id));

  return useMemo(() => ({ claimed }), [claimed]);
};
