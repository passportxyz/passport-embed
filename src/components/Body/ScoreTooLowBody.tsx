import styles from "./Body.module.css";
import utilStyles from "../../utilStyles.module.css";
import { Button } from "../Button";
import { useState } from "react";
import { useWidgetPassportScore } from "../../hooks/usePassportScore";
import { useQuery } from "@tanstack/react-query";
import { SanitizedHTMLComponent } from "../SanitizedHTMLComponent";
import { fetchStampPages } from "../../utils/stampDataApi";
import { usePassportQueryClient } from "../../hooks/usePassportQueryClient";
import { Platform, RawStampPageData, RawPlatformData } from "../../hooks/stampTypes";
import { RightArrow } from "../../assets/rightArrow";
import { ScrollableDivWithFade } from "../ScrollableDivWithFade";
import { PlatformVerification } from "./PlatformVerification";
import { useQueryContext } from "../../hooks/useQueryContext";
import { usePlatformStatus } from "../../hooks/usePlatformStatus";
import { usePlatformDeduplication } from "../../hooks/usePlatformDeduplication";
import { WinkingHuman } from "../../assets/winkingHuman";
import { HouseIcon } from "../../assets/houseIcon";
import { BackButton } from "./PlatformHeader";
import { displayNumber } from "../../utils";

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
    <AddStamps generateSignatureCallback={generateSignatureCallback} onBack={() => setAddingStamps(false)} />
  ) : (
    <InitialTooLow onContinue={() => setAddingStamps(true)} />
  );
};

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
  const { claimed, pointsGained } = usePlatformStatus({ platform });
  const isDeduped = usePlatformDeduplication({ platform });

  return (
    <button
      className={`${styles.platformButton} ${claimed ? styles.platformButtonClaimed : ""}`}
      onClick={() => setOpenPlatform(platform)}
    >
      <div className={styles.platformButtonContents}>
        <div className={styles.platformButtonTitle}>
          {platform.icon && (
            <div className={styles.platformIconBackground}>
              <span className={styles.platformIcon}>{platform.icon}</span>
            </div>
          )}
          {platform.name}
        </div>
        {isDeduped && <DedupeBadge />}
        {claimed ? (
          <div className={styles.platformButtonScore}>
            <span className={styles.scoreNumerator}>{pointsGained}</span>
            <span className={styles.scoreDenominator}>/{platform.displayWeight}</span>
          </div>
        ) : (
          <div className={styles.platformButtonWeight}>{platform.displayWeight}</div>
        )}
        <div className={styles.platformButtonChevron}>
          <RightArrow invertColors={false} />
        </div>
      </div>
    </button>
  );
};

export const AddStamps = ({
  generateSignatureCallback,
  onBack,
}: {
  generateSignatureCallback: ((message: string) => Promise<string | undefined>) | undefined;
  onBack: () => void;
}) => {
  const { scorerId, apiKey, embedServiceUrl } = useQueryContext();
  const queryClient = usePassportQueryClient();
  const [openPlatform, setOpenPlatform] = useState<Platform | null>(null);

  const {
    data: stampPages,
    isLoading,
    error,
    refetch,
  } = useQuery(
    {
      queryKey: ["stampPages", apiKey, scorerId, embedServiceUrl],
      queryFn: async () => {
        const data = await fetchStampPages({ apiKey, scorerId, embedServiceUrl });
        return data.map((page: RawStampPageData) => ({
          ...page,
          platforms: page.platforms.map((platform: RawPlatformData) => ({
            ...platform,
            displayWeight: displayNumber(parseFloat(platform.displayWeight)),
            description: <SanitizedHTMLComponent html={platform.description || ""} />,
            icon: platform.icon ? (
              // If it's a URL, wrap it in an img tag for sanitization
              platform.icon.startsWith("http://") || platform.icon.startsWith("https://") ? (
                <SanitizedHTMLComponent html={`<img src="${platform.icon}" alt="${platform.name} icon" />`} />
              ) : (
                <SanitizedHTMLComponent html={platform.icon} />
              )
            ) : null,
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

  return (
    <>
      {openPlatform && (
        <PlatformVerification
          platform={openPlatform}
          onClose={() => setOpenPlatform(null)}
          generateSignatureCallback={generateSignatureCallback}
        />
      )}

      <div className={`${styles.addStampsWrapper} ${openPlatform ? styles.hiddenAddStamps : styles.visibleAddStamps}`}>
        <div className={styles.verifyHeader}>
          <BackButton onBack={onBack} />
          <span className={styles.verifyTitle}>Verify Activities</span>
        </div>
        <ScrollableDivWithFade className={styles.allStampsContainer}>
          {stampPages.map((page, pageIndex) => (
            <div key={pageIndex} className={styles.stampCategory}>
              <div className={styles.categoryHeader}>{page.header}</div>
              <div className={styles.stampsList}>
                {page.platforms.map((platform: Platform) => (
                  <PlatformButton key={platform.platformId} platform={platform} setOpenPlatform={setOpenPlatform} />
                ))}
              </div>
            </div>
          ))}
          <div className={styles.exploreMoreSection}>
            <Hyperlink href="https://app.passport.xyz" className={styles.exploreMoreLink}>
              <span className={styles.exploreMoreIcon}>
                <HouseIcon />
              </span>
              <span>Explore Additional Stamps</span>
              <ArrowUpRightIcon />
            </Hyperlink>
          </div>
        </ScrollableDivWithFade>
      </div>
    </>
  );
};

const ArrowUpRightIcon = () => (
  <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7.5 7H17.5M17.5 7V17M17.5 7L7.5 17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const InitialTooLow = ({ onContinue }: { onContinue: () => void }) => {
  const { data } = useWidgetPassportScore();

  return (
    <div className={styles.lowScoreContainer}>
      <WinkingHuman />
      <div className={`${styles.heading} ${styles.textCenter}`}>Increase score to participate!</div>
      <div className={styles.lowScoreDescription}>
        Your web3 history wasn't sufficient to enable you to participate. Raise your score to {data?.threshold || 20} or
        above by verifying additional Stamps
      </div>
      <Button className={utilStyles.wFull} onClick={onContinue}>
        <div className={styles.buttonContent}>Verify Stamps</div>
      </Button>
    </div>
  );
};
