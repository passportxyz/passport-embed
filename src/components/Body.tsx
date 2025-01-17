import styles from "./Body/Body.module.css";
import { PassportEmbedProps, PassportScore } from "../hooks/usePassportScore";
import { CheckingBody } from "./Body/CheckingBody";
import { CongratsBody } from "./Body/CongratsBody";
import { ScoreTooLowBody } from "./Body/ScoreTooLowBody";
import { ConnectWalletBody } from "./Body/ConnectWalletBody";
import { ErrorBody } from "./Body/ErrorBody";

const BodyWrapper = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`${styles.container} ${className}`}>{children}</div>;

// Determines the current page based on the state of the widget
const BodyRouter = ({
  data,
  isLoading,
  connectWalletCallback,
  errorMessage,
}: { data?: PassportScore; errorMessage?: string; isLoading: boolean } & Pick<
  PassportEmbedProps,
  "connectWalletCallback"
>) => {
  if (errorMessage) {
    return <ErrorBody errorMessage={errorMessage} />;
  }

  if (data) {
    return data.passingScore ? (
      <CongratsBody />
    ) : (
      <ScoreTooLowBody threshold={data?.threshold} />
    );
  }

  if (isLoading) {
    return <CheckingBody />;
  }

  return <ConnectWalletBody connectWalletCallback={connectWalletCallback} />;
};

export const Body = ({
  className,
  errorMessage,
  data,
  isLoading,
  connectWalletCallback,
}: {
  isLoading: boolean;
  data?: PassportScore;
  className?: string;
  errorMessage?: string;
} & Pick<PassportEmbedProps, "connectWalletCallback">) => {
  return (
    <BodyWrapper className={className}>
      <BodyRouter
        data={data}
        isLoading={isLoading}
        errorMessage={errorMessage}
        connectWalletCallback={connectWalletCallback}
      />
    </BodyWrapper>
  );
};
