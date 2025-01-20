import styles from "./Body.module.css";
import utilStyles from "../../utilStyles.module.css";
import { Button } from "../Button";
import { createRef, useEffect, useState } from "react";
import { useHeaderControls } from "../../contexts/HeaderContext";
import { useWidgetPassportScore } from "../../hooks/usePassportScore";
import { TextButton } from "../TextButton";
import { displayNumber } from "../../utils";
import { RightArrow } from "../../assets/rightArrow";
import { ScrollableDiv } from "../ScrollableDiv";
import { PlatformVerification } from "./PlatformVerification";

type VerifyStampsStep = "initialTooLow" | "addStamps" | "finalTooLow";

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

const STAMP_PAGES: StampPage[] = [
  {
    header: "KYC verification",
    platforms: [
      {
        name: "Binance",
        description: (
          <div>
            If you do not have the Binance Account Bound Token (BABT), obtain it{" "}
            <a>here</a> by verifying your identity and logging into your Binance
            account.
          </div>
        ),
        documentationLink: "https://google.com",
        credentials: [
          {
            id: "BinanceBABT2",
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
      {
        name: "Shlolonym",
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
  const [step, setStep] = useState<VerifyStampsStep>("initialTooLow");

  if (step === "initialTooLow") {
    return <InitialTooLow onContinue={() => setStep("addStamps")} />;
  } else if (step === "addStamps") {
    return <AddStamps onFail={() => setStep("finalTooLow")} />;
  } else {
    return <FinalTooLow />;
  }
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

const PlatformButton = ({
  platform,
  setOpenPlatform,
}: {
  platform: Platform;
  setOpenPlatform: (platform: Platform) => void;
}) => {
  return (
    <button
      className={styles.platformButton}
      onClick={() => setOpenPlatform(platform)}
    >
      <div className={styles.platformButtonTitle}>{platform.name}</div>
      <div className={styles.platformButtonWeight}>
        {platform.displayWeight}
      </div>
      <RightArrow />
    </button>
  );
};

const AddStamps = ({ onFail }: { onFail: () => void }) => {
  const { data, isLoading, isPending, isFetching } = useWidgetPassportScore();
  const { setSubtitle, setShowLoadingIcon } = useHeaderControls();
  const { page, nextPage, prevPage, isFirstPage, isLastPage } =
    usePages(STAMP_PAGES);

  const [openPlatform, setOpenPlatform] = useState<Platform | null>(null);

  const { header, platforms } = page;

  console.log("data", data);
  console.log("isLoading", isLoading);
  console.log("isPending", isPending);
  console.log("isFetching", isFetching);

  useEffect(() => {
    setShowLoadingIcon(isFetching);
    return () => setShowLoadingIcon(false);
  }, [isFetching]);

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

  return (
    <>
      <div className={styles.textBlock}>
        <div className={styles.heading}>{header}</div>
        <div>Choose from below and verify</div>
      </div>
      <ScrollableDiv className={styles.platformButtonGroup}>
        {platforms.map((platform) => (
          <PlatformButton
            key={platform.name}
            platform={platform}
            setOpenPlatform={setOpenPlatform}
          />
        ))}
      </ScrollableDiv>
      {isLastPage || (
        <TextButton onClick={nextPage}>Try another way</TextButton>
      )}
      {isFirstPage || <TextButton onClick={prevPage}>Go back</TextButton>}
    </>
  );
};

const FinalTooLow = () => {
  const { setSubtitle } = useHeaderControls();

  useEffect(() => {
    setSubtitle("LOW SCORE");
  });

  return <div>Still too low TODO</div>;
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
