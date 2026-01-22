import styles from "./Body.module.css";
import utilStyles from "../../utilStyles.module.css";
import { Button } from "../Button";
import { useState } from "react";
import { useWidgetPassportScore } from "../../hooks/usePassportScore";
import { useStampPages } from "../../hooks/useStampPages";
import { Platform, VISIT_PASSPORT_HEADER } from "../../hooks/stampTypes";
import { RightArrow } from "../../assets/rightArrow";
import { ScrollableDivWithFade } from "../ScrollableDivWithFade";
import { PlatformVerification } from "./PlatformVerification";
import { useQueryContext } from "../../hooks/useQueryContext";
import { usePlatformStatus } from "../../hooks/usePlatformStatus";
import { usePlatformDeduplication } from "../../hooks/usePlatformDeduplication";
import { WinkingHuman } from "../../assets/winkingHuman";

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
}: {
  generateSignatureCallback: ((message: string) => Promise<string | undefined>) | undefined;
}) => {
  const queryProps = useQueryContext();
  const { scorerId, apiKey, embedServiceUrl } = queryProps;
  const { stampPages, isLoading, error, refetch } = useStampPages({
    apiKey,
    scorerId,
    embedServiceUrl,
  });
  const [openPlatform, setOpenPlatform] = useState<Platform | null>(null);

  if (isLoading)
    return (
      <div className={styles.textBlock}>
        <div>Loading Stamps...</div>
      </div>
    );
  if (error)
    return (
      <>
        <div className={styles.textBlock}>
          <div>{error instanceof Error ? error.message : "Failed to load stamps"}</div>
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

  // Filter out the "More Options" page for the main list
  const mainPages = stampPages.filter((page) => page.header !== VISIT_PASSPORT_HEADER);
  const moreOptionsPage = stampPages.find((page) => page.header === VISIT_PASSPORT_HEADER);

  return (
    <ScrollableDivWithFade className={styles.allStampsContainer}>
      {mainPages.map((page) => (
        <div key={page.header} className={styles.stampSection}>
          <div className={styles.sectionHeader}>{page.header}</div>
          <div className={styles.platformList}>
            {page.platforms.map((platform) => (
              <PlatformButton key={platform.platformId} platform={platform} setOpenPlatform={setOpenPlatform} />
            ))}
          </div>
        </div>
      ))}
      {moreOptionsPage && (
        <div className={styles.moreOptions}>
          Visit <Hyperlink href="https://app.passport.xyz">Human Passport</Hyperlink> for more options
        </div>
      )}
    </ScrollableDivWithFade>
  );
};

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
