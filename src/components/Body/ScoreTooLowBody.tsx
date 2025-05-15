import styles from "./Body.module.css";
import utilStyles from "../../utilStyles.module.css";
import { Button } from "../Button";
import { useEffect, useState } from "react";
import { useHeaderControls } from "../../hooks/useHeaderControls";
import { useWidgetPassportScore } from "../../hooks/usePassportScore";
import { usePaginatedStampPages, Platform } from "../../hooks/useStampPages";
import { TextButton } from "../TextButton";
import { RightArrow } from "../../assets/rightArrow";
import { ScrollableDiv } from "../ScrollableDiv";
import { PlatformVerification } from "./PlatformVerification";
import { useQueryContext } from "../../hooks/useQueryContext";
import { usePlatformStatus } from "../../hooks/usePlatformStatus";

export const Hyperlink = ({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`${styles.link} ${className}`}
  >
    {children}
  </a>
);

const VISIT_PASSPORT_HEADER = "More Options";

export const ScoreTooLowBody = ({
  generateSignatureCallback,
}: {
  generateSignatureCallback: (message: string) => Promise<string | undefined>;
}) => {
  const [addingStamps, setAddingStamps] = useState(false);

  return addingStamps ? (
    <AddStamps generateSignatureCallback={generateSignatureCallback} />
  ) : (
    <InitialTooLow onContinue={() => setAddingStamps(true)} />
  );
};

const ClaimedIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="8" cy="8" r="8" fill="rgb(var(--color-background-c6dbf459)" />
    <path
      d="M4 7.5L7 10.5L11.5 6"
      stroke="rgb(var(--color-primary-c6dbf459)"
      strokeWidth="2"
    />
  </svg>
);

const PlatformButton = ({
  platform,
  setOpenPlatform,
}: {
  platform: Platform;
  setOpenPlatform: (platform: Platform) => void;
}) => {
  const { claimed } = usePlatformStatus({ platform });
  return (
    <button
      className={`${styles.platformButton} ${
        claimed ? styles.platformButtonClaimed : ""
      }`}
      onClick={() => setOpenPlatform(platform)}
    >
      <div className={styles.platformButtonTitle}>{platform.name}</div>
      {claimed ? (
        <ClaimedIcon />
      ) : (
        <div className={styles.platformButtonWeight}>
          {platform.displayWeight}
        </div>
      )}
      <RightArrow invertColors={claimed} />
    </button>
  );
};

export const AddStamps = ({
  generateSignatureCallback,
}: {
  generateSignatureCallback: (message: string) => Promise<string | undefined>;
}) => {
  const { setSubtitle } = useHeaderControls();
  const queryProps = useQueryContext();
  const { scorerId, apiKey, embedServiceUrl } = queryProps;
  const { page, nextPage, prevPage, isFirstPage, isLastPage, loading, error } =
    usePaginatedStampPages({
      apiKey,
      scorerId,
      embedServiceUrl,
    });
  const [openPlatform, setOpenPlatform] = useState<Platform | null>(null);

  useEffect(() => {
    setSubtitle("VERIFY STAMPS");
  }, [setSubtitle]);

  if (loading) return <div>Loading Stamps Metadata...</div>;
  if (error) return <div>{error}</div>;
  if (!page) return <div>No stamp metadata available</div>;

  const { header, platforms } = page;

  if (openPlatform) {
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
            Visit{" "}
            <Hyperlink href="https://app.passport.xyz">Human Passport</Hyperlink>{" "}
            for more Stamp options!
          </div>
        ) : (
          <div>Choose from below and verify</div>
        )}
      </div>
      {isVisitPassportPage || (
        <ScrollableDiv className={styles.platformButtonGroup}>
          {platforms.map((platform) => (
            <PlatformButton
              key={platform.name}
              platform={platform}
              setOpenPlatform={setOpenPlatform}
            />
          ))}
        </ScrollableDiv>
      )}
      <div
        className={`${styles.navigationButtons} ${
          isFirstPage || isLastPage
            ? utilStyles.justifyCenter
            : utilStyles.justifyBetween
        }`}
      >
        {isFirstPage || <TextButton onClick={prevPage}>Go back</TextButton>}
        {isLastPage || (
          <TextButton onClick={nextPage}>Try another way</TextButton>
        )}
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
        <div className={styles.heading}>
          Your score is too low to participate.
        </div>
        <div>
          Increase your score to {data?.threshold || 20}+ by verifying
          additional Stamps.
        </div>
      </div>
      <Button className={utilStyles.wFull} onClick={onContinue}>
        Add Stamps
      </Button>
    </>
  );
};
