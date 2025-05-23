import styles from "./Body/Body.module.css";
import {
  PassportEmbedProps,
  useWidgetPassportScore,
  useWidgetIsQuerying,
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
  generateSignatureCallback,
}: Pick<
  PassportEmbedProps,
  "connectWalletCallback" | "generateSignatureCallback"
>) => {
  const { isError, error, data } = useWidgetPassportScore();
  const isQuerying = useWidgetIsQuerying();

  if (isError) {
    return <ErrorBody error={error} />;
  }

  if (isQuerying) {
    return <CheckingBody />;
  }

  if (data) {
    return data.passingScore ? (
      <CongratsBody />
    ) : (
      <ScoreTooLowBody
        generateSignatureCallback={
          generateSignatureCallback || (async () => undefined)
        }
      />
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
}: {
  className?: string;
  isOpen: boolean;
  collapseMode: CollapseMode;
} & Pick<
  PassportEmbedProps,
  "connectWalletCallback" | "generateSignatureCallback"
>) => {
  return (
    <BodyWrapper
      className={className}
      isOpen={isOpen}
      collapseMode={collapseMode}
    >
      <BodyRouter
        connectWalletCallback={connectWalletCallback}
        generateSignatureCallback={generateSignatureCallback}
      />
    </BodyWrapper>
  );
};
