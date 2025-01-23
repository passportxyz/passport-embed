import styles from "./Body.module.css";
import utilStyles from "../../utilStyles.module.css";
import { Button } from "../Button";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useHeaderControls } from "../../contexts/HeaderContext";
import { useWidgetPassportScore } from "../../hooks/usePassportScore";
import { TextButton } from "../TextButton";
import { displayNumber } from "../../utils";
import { RightArrow } from "../../assets/rightArrow";
import { ScrollableDiv } from "../ScrollableDiv";
import { PlatformVerification } from "./PlatformVerification";

// TODO should probably load this data from an API endpoint, so that
// if we need to add/change/remove stamps, integrators don't need to
// update the package and re-release their apps
// Also at least weights could be scorer-specific

type Credential = {
  id: string;
  weight: string;
};

export type Platform = {
  name: string;
  description: JSX.Element;
  documentationLink: string;
  credentials: Credential[];
  displayWeight: string; // calculated
};

type StampPage = {
  header: string;
  platforms: Platform[];
};

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

const STAMP_PAGES: StampPage[] = [
  {
    header: "KYC verification",
    platforms: [
      {
        name: "Binance",
        description: (
          <div>
            If you do not have the Binance Account Bound Token (BABT), obtain it{" "}
            <a
              href="http://google.com"
              style={{
                color: "inherit",
                fontWeight: "700",
                textDecoration: "none",
              }}
              rel="noopener noreferrer"
              target="_blank"
            >
              here
            </a>{" "}
             by verifying your identity and logging into your Binance account.
            Then return here and click Verify to claim this Stamp.
          </div>
        ),
        documentationLink: "https://google.com",
        credentials: [
          {
            // id: "BinanceBABT2",
            id: "NFT",
            weight: "16",
          },
        ],
      },
      {
        name: "Holonym",
        description: <div>TODO</div>,
        documentationLink: "https://google.com",
        credentials: [
          {
            id: "HolonymGovIdProvider",
            weight: "16",
          },
        ],
      },
    ],
  },
  {
    header: "Biometrics verification",
    platforms: [
      {
        name: "Civic",
        description: <div>TODO</div>,
        documentationLink: "https://google.com",
        credentials: [
          {
            id: "CivicCaptchaPass",
            weight: "1",
          },
          {
            id: "CivicUniquenessPass",
            weight: "2",
          },
          {
            id: "CivicLivenessPass",
            weight: "3",
          },
        ],
      },
    ],
  },
  {
    header: VISIT_PASSPORT_HEADER,
    platforms: [],
  },
].map((page) => ({
  ...page,
  platforms: page.platforms.map((platform) => ({
    ...platform,
    displayWeight: displayNumber(
      platform.credentials.reduce(
        (acc, credential) => acc + parseFloat(credential.weight),
        0
      )
    ),
  })),
}));

export const ScoreTooLowBody = () => {
  const [addingStamps, setAddingStamps] = useState(false);

  return addingStamps ? (
    <AddStamps />
  ) : (
    <InitialTooLow onContinue={() => setAddingStamps(true)} />
  );
};

const usePages = <T,>(pages: T[]) => {
  const [idx, setIdx] = useState(0);

  const nextPage = () => setIdx((prev) => Math.min(prev + 1, pages.length - 1));
  const prevPage = () => setIdx((prev) => Math.max(prev - 1, 0));

  const isFirstPage = idx === 0;
  const isLastPage = idx === pages.length - 1;

  const page = pages[idx];

  return { page, nextPage, prevPage, isFirstPage, isLastPage };
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

export const usePlatformStatus = ({ platform }: { platform: Platform }) => {
  const { data } = useWidgetPassportScore();

  const claimedCredentialIds = Object.entries(data?.stamps || {}).reduce(
    (claimedIds, [id, { score }]) => {
      if (score > 0) {
        claimedIds.push(id);
      }
      return claimedIds;
    },
    [] as string[]
  );

  const claimed = platform.credentials.some((credential) =>
    claimedCredentialIds.includes(credential.id)
  );

  return useMemo(() => ({ claimed }), [claimed]);
};

const AddStamps = () => {
  const { setSubtitle } = useHeaderControls();
  const { page, nextPage, prevPage, isFirstPage, isLastPage } =
    usePages(STAMP_PAGES);

  const [openPlatform, setOpenPlatform] = useState<Platform | null>(null);

  const { header, platforms } = page;

  useEffect(() => {
    setSubtitle("VERIFY STAMPS");
  });

  if (openPlatform) {
    return (
      <PlatformVerification
        platform={openPlatform}
        onClose={() => setOpenPlatform(null)}
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
            <Hyperlink href="https://app.passport.xyz">Passport XYZ</Hyperlink>{" "}
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
