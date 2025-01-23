import styles from "./Body/Body.module.css";
import {
  PassportEmbedProps,
  useWidgetPassportScore,
} from "../hooks/usePassportScore";
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
  connectWalletCallback,
}: Pick<PassportEmbedProps, "connectWalletCallback">) => {
  const { isError, isLoading, error, data } = useWidgetPassportScore();

  if (isError) {
    let errorMessage = "An error occurred";
    try {
      errorMessage = error.message;
    } catch {}
    return <ErrorBody errorMessage={errorMessage} />;
  }

  if (data) {
    return data.passingScore ? <CongratsBody /> : <ScoreTooLowBody />;
  }

  if (isLoading) {
    return <CheckingBody />;
  }

  return <ConnectWalletBody connectWalletCallback={connectWalletCallback} />;
};

export const Body = ({
  className,
  connectWalletCallback,
}: {
  className?: string;
} & Pick<PassportEmbedProps, "connectWalletCallback">) => {
  return (
    <BodyWrapper className={className}>
      <BodyRouter connectWalletCallback={connectWalletCallback} />
    </BodyWrapper>
  );
};
