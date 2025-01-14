import styles from "./Body.module.css";
import { Button } from "../components/Button";
import { PassportScore } from "../hooks/usePassportScore";

const BodyWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className={styles.container}>{children}</div>
);

const ConnectWalletBody = () => {
  return (
    <>
      <div className={styles.text}>
        Bla bla stuff about scoring and Passports and such
      </div>
      <div className={styles.centerChildren}>
        <Button
          className=""
          onClick={() => {
            /* TODO add a connectWallet callback*/
            window.alert("Connect wallet callback not yet implemented");
          }}
        >
          Connect your wallet
        </Button>
      </div>
    </>
  );
};

const CheckingBody = () => {
  return (
    <>
      <div className={styles.text}>Checking...</div>
    </>
  );
};

const ResultBody = ({ data }: { data?: PassportScore }) => {
  return (
    <>
      <div className={styles.text}>Your score is {data?.score}</div>
    </>
  );
};

// Determines the current page based on the state of the widget
const BodyRouter = ({
  isLoading,
  data,
}: {
  isLoading: boolean;
  data?: PassportScore;
}) => {
  if (!isLoading && !data) {
    return <ConnectWalletBody />;
  }

  if (isLoading) {
    return <CheckingBody />;
  }

  if (data) {
    return <ResultBody data={data} />;
  }

  // To be continued...
};

export const Body = ({
  errorMessage,
  isLoading,
  data,
}: {
  errorMessage?: string;
  isLoading: boolean;
  data?: PassportScore;
}) => {
  return (
    <BodyWrapper>
      {errorMessage ? (
        <div>Error: {errorMessage}</div>
      ) : (
        <BodyRouter isLoading={isLoading} data={data} />
      )}
    </BodyWrapper>
  );
};
