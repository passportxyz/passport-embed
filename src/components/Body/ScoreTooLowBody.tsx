import styles from "./Body.module.css";
import utilStyles from "../../utilStyles.module.css";
import { Button } from "../Button";
import { useCallback, useEffect, useState } from "react";
import { useHeaderControls } from "../../hooks/useHeaderControls";
import { useWidgetPassportScore } from "../../hooks/usePassportScore";
import { usePaginatedStampPages, Platform } from "../../hooks/useStampPages";
import { TextButton } from "../TextButton";
import { RightArrow } from "../../assets/rightArrow";
import { ScrollableDiv } from "../ScrollableDiv";
import { PlatformVerification } from "./PlatformVerification";
import { useQueryContext } from "../../hooks/useQueryContext";
import { usePlatformStatus } from "../../hooks/usePlatformStatus";
import { usePlatformDeduplication } from "../../hooks/usePlatformDeduplication";

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

const VISIT_PASSPORT_HEADER = "More Options";

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
      {claimed ? <ClaimedIcon /> : <div className={styles.platformButtonWeight}>{platform.displayWeight}</div>}
      <RightArrow invertColors={claimed} />
    </button>
  );
};

export const AddStamps = ({
  generateSignatureCallback,
}: {
  generateSignatureCallback: ((message: string) => Promise<string | undefined>) | undefined;
}) => {
  const { setSubtitle } = useHeaderControls();
  const queryProps = useQueryContext();
  const { scorerId, apiKey, embedServiceUrl } = queryProps;
  const { page, nextPage, prevPage, isFirstPage, isLastPage, loading, error } = usePaginatedStampPages({
    apiKey,
    scorerId,
    embedServiceUrl,
  });
  const [configurationError, setConfigurationError] = useState<string | undefined>();
  const [openPlatform, _setOpenPlatform] = useState<Platform | null>(null);

  useEffect(() => {
    setSubtitle("VERIFY STAMPS");
  }, [setSubtitle]);

  const setOpenPlatform = useCallback(
    (openPlatform: Platform | null) => {
      if (openPlatform && openPlatform.requiresSignature && !generateSignatureCallback) {
        // This is a misconfiguration, the 'generateSignatureCallback' was not provided
        setConfigurationError(
          "Something's missing! This Stamp needs an extra setup step to work properly. If you're the site owner, please add a generateSignatureCallback to the widget configuration."
        );
      } else {
        _setOpenPlatform(openPlatform);
      }
    },
    [generateSignatureCallback]
  );

  if (loading) return <div>Loading Stamps...</div>;
  if (error) return <div>{error}</div>;
  if (configurationError) return <div>{configurationError}</div>;

  if (!page) return <div>No Stamps available</div>;

  const { header, platforms } = page;

  if (openPlatform && generateSignatureCallback) {
    return (
      <PlatformVerification
        platform={openPlatform}
        onClose={() => setOpenPlatform(null)}
        generateSignatureCallback={generateSignatureCallback}
      />
    );
  }

  const isVisitPassportPage = header === VISIT_PASSPORT_HEADER;

  return (
    <>
      <div className={styles.textBlock}>
        <div className={styles.heading}>{header}</div>
        {isVisitPassportPage ? (
          <div>
            Visit <Hyperlink href="https://app.passport.xyz">Human Passport</Hyperlink> for more Stamp options!
          </div>
        ) : (
          <div></div>
        )}
      </div>
      {isVisitPassportPage || (
        <ScrollableDiv className={styles.platformButtonGroup}>
          {platforms.map((platform) => (
            <PlatformButton key={platform.name} platform={platform} setOpenPlatform={setOpenPlatform} />
          ))}
        </ScrollableDiv>
      )}
      <div
        className={`${styles.navigationButtons} ${
          isFirstPage || isLastPage ? utilStyles.justifyCenter : utilStyles.justifyBetween
        }`}
      >
        {isFirstPage || <TextButton onClick={prevPage}>Go back</TextButton>}
        {isLastPage || <TextButton onClick={nextPage}>Try other Stamps</TextButton>}
      </div>
    </>
  );
};

const InitialTooLow = ({ onContinue }: { onContinue: () => void }) => {
  const { data } = useWidgetPassportScore();
  const { setSubtitle } = useHeaderControls();

  useEffect(() => {
    setSubtitle("LOW SCORE");
  });

  return (
    <>
      <div className={styles.textBlock}>
        <div className={styles.heading}>Score too low</div>
        <div>Reach {data?.threshold || 20}+ by adding Stamps</div>
      </div>
      <Button className={utilStyles.wFull} onClick={onContinue}>
        Add Stamps
      </Button>
    </>
  );
};
