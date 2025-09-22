import styles from "./Body.module.css";
import utilStyles from "../../utilStyles.module.css";
import { Button } from "../Button";
import { useState } from "react";
import { useWidgetPassportScore } from "../../hooks/usePassportScore";
import { useQuery } from "@tanstack/react-query";
import { SanitizedHTMLComponent } from "../SanitizedHTMLComponent";
import { fetchStampPages } from "../../utils/stampDataApi";
import { usePassportQueryClient } from "../../hooks/usePassportQueryClient";
import { Platform } from "../../hooks/stampTypes";
import { RightArrow } from "../../assets/rightArrow";
import { ScrollableDivWithFade } from "../ScrollableDivWithFade";
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
    <AddStamps generateSignatureCallback={generateSignatureCallback} onBack={() => setAddingStamps(false)} />
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
  const { claimed, pointsGained } = usePlatformStatus({ platform });
  const isDeduped = usePlatformDeduplication({ platform });

  return (
    <button
      className={`${styles.platformButton} ${claimed ? styles.platformButtonClaimed : ""}`}
      onClick={() => setOpenPlatform(platform)}
    >
      <div className={styles.platformButtonHeader}>
        <div className={styles.platformButtonTitle}>
          {platform.icon && <span className={styles.platformIcon}>{platform.icon}</span>}
          {platform.name}
          {isDeduped && <DedupeBadge />}
        </div>
      </div>
      {claimed ? (
        <div className={styles.platformButtonScore}>
          <span className={styles.scoreDivider}>{pointsGained}</span>
          <span className={styles.scoreValue}>/{platform.displayWeight}</span>
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

const BackArrow = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M19 12H5M5 12L12 5M5 12L12 19"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const AddStamps = ({
  generateSignatureCallback,
  onBack,
}: {
  generateSignatureCallback: ((message: string) => Promise<string | undefined>) | undefined;
  onBack?: () => void;
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
        return data.map((page: any) => ({
          ...page,
          platforms: page.platforms.map((platform: any) => ({
            ...platform,
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
    <div className={styles.addStampsWrapper}>
      {onBack && (
        <div className={styles.verifyHeader}>
          <button onClick={onBack} className={styles.backButton}>
            <BackArrow />
          </button>
          <span className={styles.verifyTitle}>Verify Activities</span>
        </div>
      )}
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
            <HouseIcon />
            <span>Explore Additional Stamps</span>
            <ArrowUpRightIcon />
          </Hyperlink>
        </div>
      </ScrollableDivWithFade>
    </div>
  );
};

const HouseIcon = () => (
  <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_19972_1747)">
      <path
        d="M1.8335 4.66732L4.7735 1.72732C4.89753 1.60254 5.04504 1.50354 5.20752 1.43604C5.36999 1.36853 5.54422 1.33385 5.72016 1.33398H11.2802C11.4561 1.33385 11.6303 1.36853 11.7928 1.43604C11.9553 1.50354 12.1028 1.60254 12.2268 1.72732L15.1668 4.66732M1.8335 4.66732H15.1668M1.8335 4.66732V6.66732C1.8335 7.02094 1.97397 7.36008 2.22402 7.61013C2.47407 7.86018 2.81321 8.00065 3.16683 8.00065M15.1668 4.66732V6.66732C15.1668 7.02094 15.0264 7.36008 14.7763 7.61013C14.5263 7.86018 14.1871 8.00065 13.8335 8.00065M3.16683 8.00065V13.334C3.16683 13.6876 3.30731 14.0267 3.55735 14.2768C3.8074 14.5268 4.14654 14.6673 4.50016 14.6673H12.5002C12.8538 14.6673 13.1929 14.5268 13.443 14.2768C13.693 14.0267 13.8335 13.6876 13.8335 13.334V8.00065M3.16683 8.00065C3.55634 7.97921 3.92834 7.83182 4.22683 7.58065C4.30638 7.52317 4.40202 7.49223 4.50016 7.49223C4.59831 7.49223 4.69395 7.52317 4.7735 7.58065C5.07198 7.83182 5.44399 7.97921 5.8335 8.00065C6.22301 7.97921 6.59501 7.83182 6.8935 7.58065C6.97304 7.52317 7.06869 7.49223 7.16683 7.49223C7.26497 7.49223 7.36062 7.52317 7.44016 7.58065C7.73865 7.83182 8.11065 7.97921 8.50016 8.00065C8.88967 7.97921 9.26168 7.83182 9.56016 7.58065C9.63971 7.52317 9.73535 7.49223 9.8335 7.49223C9.93164 7.49223 10.0273 7.52317 10.1068 7.58065C10.4053 7.83182 10.7773 7.97921 11.1668 8.00065C11.5563 7.97921 11.9283 7.83182 12.2268 7.58065C12.3064 7.52317 12.402 7.49223 12.5002 7.49223C12.5983 7.49223 12.694 7.52317 12.7735 7.58065C13.072 7.83182 13.444 7.97921 13.8335 8.00065M10.5002 14.6673V12.0007C10.5002 11.647 10.3597 11.3079 10.1096 11.0578C9.85959 10.8078 9.52045 10.6673 9.16683 10.6673H7.8335C7.47987 10.6673 7.14074 10.8078 6.89069 11.0578C6.64064 11.3079 6.50016 11.647 6.50016 12.0007V14.6673"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_19972_1747">
        <rect width="16" height="16" fill="white" transform="translate(0.5)" />
      </clipPath>
    </defs>
  </svg>
);

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
