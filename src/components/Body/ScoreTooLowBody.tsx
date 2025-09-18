import styles from "./Body.module.css";
import utilStyles from "../../utilStyles.module.css";
import { Button } from "../Button";
import { useEffect, useState } from "react";
import { useWidgetPassportScore } from "../../hooks/usePassportScore";
import { useQuery } from "@tanstack/react-query";
import { SanitizedHTMLComponent } from "../SanitizedHTMLComponent";
import { fetchStampPages } from "../../utils/stampDataApi";
import { usePassportQueryClient } from "../../hooks/usePassportQueryClient";
import { Platform } from "../../hooks/stampTypes";
import { RightArrow } from "../../assets/rightArrow";
import { ScrollableDiv } from "../ScrollableDiv";
import { PlatformVerification } from "./PlatformVerification";
import { useQueryContext } from "../../hooks/useQueryContext";
import { usePlatformStatus } from "../../hooks/usePlatformStatus";
import { usePlatformDeduplication } from "../../hooks/usePlatformDeduplication";
import { HappyHuman } from "../../assets/happyHuman";

export const Hyperlink = ({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className={`${styles.link} ${className}`}>
    {children}
  </a>
);

export const ScoreTooLowBody = ({
  generateSignatureCallback,
}: {
  generateSignatureCallback: ((message: string) => Promise<string | undefined>) | undefined;
}) => {
  const [addingStamps, setAddingStamps] = useState(false);
  return addingStamps ? (
    <AddStamps generateSignatureCallback={generateSignatureCallback} />
  ) : (
    <InitialTooLow onContinue={() => setAddingStamps(true)} />
  );
};

const ClaimedIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="8" fill="rgb(var(--color-background-c6dbf459)" />
    <path d="M4 7.5L7 10.5L11.5 6" stroke="rgb(var(--color-primary-c6dbf459)" strokeWidth="2" />
  </svg>
);

const DedupeBadge = () => (
  <div className={styles.dedupeBadge}>
    <span className={styles.dedupeText}>Deduplicated</span>
  </div>
);

const PlatformButton = ({
  platform,
  setOpenPlatform,
}: {
  platform: Platform;
  setOpenPlatform: (platform: Platform) => void;
}) => {
  const { claimed } = usePlatformStatus({ platform });
  const isDeduped = usePlatformDeduplication({ platform });
  const { data: scoreData } = useWidgetPassportScore();
  const currentScore = scoreData?.score || 0;

  return (
    <button
      className={`${styles.platformButton} ${claimed ? styles.platformButtonClaimed : ""}`}
      onClick={() => setOpenPlatform(platform)}
    >
      <div className={styles.platformButtonHeader}>
        <div className={styles.platformButtonTitle}>
          {platform.name}
          {isDeduped && <DedupeBadge />}
        </div>
      </div>
      {claimed ? (
        <div className={styles.platformButtonScore}>
          <span className={styles.scoreDivider}>{platform.displayWeight}</span>
          <span className={styles.scoreValue}>/{Math.floor(currentScore)}</span>
        </div>
      ) : (
        <div className={styles.platformButtonWeight}>{platform.displayWeight}</div>
      )}
      <div className={styles.platformButtonChevron}>
        <RightArrow invertColors={false} />
      </div>
    </button>
  );
};

export const AddStamps = ({
  generateSignatureCallback,
}: {
  generateSignatureCallback: ((message: string) => Promise<string | undefined>) | undefined;
}) => {
  const { scorerId, apiKey, embedServiceUrl } = useQueryContext();
  const queryClient = usePassportQueryClient();
  const [openPlatform, setOpenPlatform] = useState<Platform | null>(null);

  const { data: stampPages, isLoading, error, refetch } = useQuery(
    {
      queryKey: ["stampPages", apiKey, scorerId, embedServiceUrl],
      queryFn: async () => {
        const data = await fetchStampPages({ apiKey, scorerId, embedServiceUrl });
        return data.map((page: any) => ({
          ...page,
          platforms: page.platforms.map((platform: any) => ({
            ...platform,
            description: <SanitizedHTMLComponent html={platform.description || ""} />,
            displayWeight: platform.displayWeight,
          })),
        }));
      },
      staleTime: 1000 * 60 * 60, // 1 hour
      gcTime: 1000 * 60 * 60 * 2, // 2 hours cache
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
    queryClient
  );

  if (isLoading)
    return (
      <div className={styles.textBlock}>
        <div>Loading Stamps Metadata...</div>
      </div>
    );
  if (error)
    return (
      <>
        <div className={styles.textBlock}>
          <div>{error instanceof Error ? error.message : "Failed to load stamp pages"}</div>
        </div>
        <Button className={utilStyles.wFull} onClick={() => refetch()}>
          Try Again
        </Button>
      </>
    );
  if (!stampPages || stampPages.length === 0)
    return (
      <div className={styles.textBlock}>
        <div className={styles.heading}>No Stamps Available</div>
        <div>No stamp metadata available at this time.</div>
      </div>
    );

  if (openPlatform) {
    return (
      <PlatformVerification
        platform={openPlatform}
        onClose={() => setOpenPlatform(null)}
        generateSignatureCallback={generateSignatureCallback}
      />
    );
  }

  return (
    <>
      <ScrollableDiv className={styles.allStampsContainer}>
        {stampPages.map((page, pageIndex) => (
          <div key={pageIndex} className={styles.stampCategory}>
            <div className={styles.categoryHeader}>{page.header}</div>
            <div className={styles.stampsList}>
              {page.platforms.map((platform) => (
                <PlatformButton key={platform.platformId} platform={platform} setOpenPlatform={setOpenPlatform} />
              ))}
            </div>
          </div>
        ))}
        <div className={styles.exploreMoreSection}>
          <Hyperlink href="https://app.passport.xyz" className={styles.exploreMoreLink}>
            🚀 Explore Additional Stamps ↗
          </Hyperlink>
        </div>
      </ScrollableDiv>
    </>
  );
};

const DoubleChevron = () => (
  <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M17.5 11L12.5 6L7.5 11M17.5 18L12.5 13L7.5 18"
      stroke="rgb(var(--color-background-c6dbf459))"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const InitialTooLow = ({ onContinue }: { onContinue: () => void }) => {
  const { data } = useWidgetPassportScore();

  return (
    <>
      <div className={styles.textBlock}>
        <HappyHuman />
        <div className={styles.heading}>Increase score to participate!</div>
        <div>
          Your web3 history wasn't sufficient to enable you to participate. Raise your score to {data?.threshold || 20}{" "}
          or above by verifying additional Stamps
        </div>
      </div>
      <Button className={utilStyles.wFull} onClick={onContinue}>
        <div className={styles.buttonContent}>
          <DoubleChevron /> Verify Stamps
        </div>
      </Button>
    </>
  );
};
