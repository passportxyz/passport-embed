import styles from "./Body/Body.module.css";
import { PassportEmbedProps, useWidgetPassportScore } from "../hooks/usePassportScore";
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
  generateSignatureCallback,
  showLoading,
  collapseMode,
  onClose,
}: Pick<PassportEmbedProps, "connectWalletCallback" | "generateSignatureCallback"> & {
  showLoading?: boolean;
  collapseMode: CollapseMode;
  onClose?: () => void;
}) => {
  const { isError, error, data } = useWidgetPassportScore();

  if (isError) {
    return <ErrorBody error={error} />;
  }

  if (showLoading) {
    return <CheckingBody />;
  }

  if (data) {
    return data.passingScore ? (
      <CongratsBody collapseMode={collapseMode} onClose={onClose} />
    ) : (
      <ScoreTooLowBody generateSignatureCallback={generateSignatureCallback} />
    );
  }

  return <ConnectWalletBody connectWalletCallback={connectWalletCallback} />;
};

export const Body = ({
  className,
  isOpen,
  collapseMode,
  connectWalletCallback,
  generateSignatureCallback,
  showLoading,
  onClose,
}: {
  className?: string;
  isOpen: boolean;
  collapseMode: CollapseMode;
  showLoading?: boolean;
  onClose?: () => void;
} & Pick<PassportEmbedProps, "connectWalletCallback" | "generateSignatureCallback">) => {
  return (
    <BodyWrapper className={className} isOpen={isOpen} collapseMode={collapseMode}>
      <BodyRouter
        connectWalletCallback={connectWalletCallback}
        generateSignatureCallback={generateSignatureCallback}
        showLoading={showLoading}
        collapseMode={collapseMode}
        onClose={onClose}
      />
    </BodyWrapper>
  );
};
