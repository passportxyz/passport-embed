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
import { useRef } from "react";
import { CollapseMode } from "../widgets/Widget";

const BodyWrapper = ({
  children,
  className,
  collapseMode,
  isOpen,
}: {
  children: React.ReactNode;
  collapseMode?: CollapseMode;
  isOpen: boolean;
  className?: string;
}) => {
  const collapsibleRef = useRef<HTMLDivElement>(null);

  const bodyWrapperClasses = [
    styles.container,
    collapseMode === "overlay" && styles.overlay,
    isOpen || collapseMode === "off" ? styles.expanded : styles.collapsed,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={collapsibleRef} className={bodyWrapperClasses}>
      {children}
    </div>
  );
};

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
  isOpen,
  collapseMode,
  connectWalletCallback,
}: {
  className?: string;
  isOpen: boolean;
  collapseMode: CollapseMode;
} & Pick<PassportEmbedProps, "connectWalletCallback">) => {
  return (
    <BodyWrapper
      className={className}
      isOpen={isOpen}
      collapseMode={collapseMode}
    >
      <BodyRouter connectWalletCallback={connectWalletCallback} />
    </BodyWrapper>
  );
};
