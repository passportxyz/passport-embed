import styles from "./Body.module.css";
import utilStyles from "../utilStyles.module.css";
import { Button } from "../components/Button";
import { PassportEmbedProps, PassportScore } from "../hooks/usePassportScore";
import { useStep } from "../contexts/StepContext";
import { useState } from "react";

const BodyWrapper = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`${styles.container} ${className}`}>{children}</div>;

const ConnectWalletBody = ({
  connectWalletCallback,
  threshold,
}: Pick<PassportEmbedProps, "connectWalletCallback"> & {
  threshold?: number;
}) => {
  const [isConnecting, setIsConnecting] = useState(false);

  return (
    <>
      <div className={styles.textBlock}>
        <div className={styles.heading}>Proof of Unique Humanity</div>
        <div>
          Your Passport XYZ score represents the likelihood that you’re a unique
          human, rather than a bot or bad actor.
        </div>
        <div className={utilStyles.bold}>
          {connectWalletCallback
            ? "Connect your wallet"
            : "Connect to the dapp"}{" "}
          and build up a score of {threshold || 20} or more to participate.
        </div>
      </div>
      {connectWalletCallback && (
        <Button
          className={utilStyles.wFull}
          disabled={isConnecting}
          onClick={async () => {
            try {
              setIsConnecting(true);
              await connectWalletCallback();
            } finally {
              setIsConnecting(false);
            }
          }}
        >
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      )}
    </>
  );
};

const CheckingBody = () => {
  return (
    <>
      <div className={styles.textBlock}>
        <div className={styles.heading}>Verifying onchain activity...</div>
        <div>
          Please wait a few seconds as we analyze your onchain activities and
          verify relevant Stamps on your behalf.
        </div>
      </div>
      <Button className={utilStyles.wFull} disabled={true}>
        Verifying...
      </Button>
    </>
  );
};

const CongratsBody = () => {
  return (
    <>
      <div
        className={`${styles.textBlock} ${styles.extraBottomMarginForBodyWithoutButton}`}
      >
        <div className={styles.heading}>Congratulations!</div>
        <div>You have proven your unique humanity. Please proceed!</div>
      </div>
    </>
  );
};

const ScoreTooLowBody = ({ threshold }: { threshold?: number }) => {
  return (
    <>
      <div className={styles.textBlock}>
        <div className={styles.heading}>
          Your score is too low to participate.
        </div>
        <div>
          Increase your score to {threshold || 20}+ by verifying additional
          Stamps.
        </div>
      </div>
      <Button
        className={utilStyles.wFull}
        onClick={() => {
          alert("TODO: Implement this");
        }}
      >
        Add Stamps
      </Button>
    </>
  );
};

// Determines the current page based on the state of the widget
const BodyRouter = ({
  data,
  connectWalletCallback,
}: { data?: PassportScore } & Pick<
  PassportEmbedProps,
  "connectWalletCallback"
>) => {
  const { currentStep } = useStep();

  switch (currentStep) {
    case "initial":
      return (
        <ConnectWalletBody
          connectWalletCallback={connectWalletCallback}
          threshold={data?.threshold}
        />
      );
    case "checking":
      return <CheckingBody />;
    case "congrats":
      return <CongratsBody />;
    case "scoreTooLow":
      return <ScoreTooLowBody threshold={data?.threshold} />;
    default:
      throw new Error(`Invalid step: ${currentStep}`);
  }

  // To be continued...
};

export const Body = ({
  className,
  errorMessage,
  data,
  connectWalletCallback,
}: {
  className?: string;
  errorMessage?: string;
  data?: PassportScore;
} & Pick<PassportEmbedProps, "connectWalletCallback">) => {
  return (
    <BodyWrapper className={className}>
      {errorMessage ? (
        <div>Error: {errorMessage}</div>
      ) : (
        <BodyRouter data={data} connectWalletCallback={connectWalletCallback} />
      )}
    </BodyWrapper>
  );
};
