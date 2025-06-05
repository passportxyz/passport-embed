import { GenericPassportWidgetProps, Widget } from "./Widget";
import {
  PassportEmbedProps,
  useWidgetPassportScore,
  useWidgetVerifyCredentials,
} from "../hooks/usePassportScore";
import styles from "./PassportScoreWidget.module.css";
import { Header } from "../components/Header";
import { Body } from "../components/Body";
import { HeaderContextProvider } from "../components/HeaderContextProvider";
import { QueryContextProvider } from "../components/QueryContextProvider";
import { useEffect, useState } from "react";

export type PassportScoreWidgetProps = PassportEmbedProps &
  GenericPassportWidgetProps;

export const PassportScoreWidget = (props: PassportScoreWidgetProps) => {
  useEffect(() => {
    if (props.apiKey === undefined) {
      console.error(
        'apiKey is required but has not been provided. You will not be able to get past the "Connect" screen of the Passport Embed widget.',
      );
    }
    if (props.scorerId === undefined) {
      console.error(
        'scorerId is required but has not been provided. You will not be able to get past the "Connect" screen of the Passport Embed widget.',
      );
    }
  }, [props.apiKey, props.scorerId]);

  return (
    <Widget {...props}>
      <QueryContextProvider {...props}>
        <HeaderContextProvider>
          <PassportScore {...props} />
        </HeaderContextProvider>
      </QueryContextProvider>
    </Widget>
  );
};

const PassportScore = ({
  connectWalletCallback,
  collapseMode,
  generateSignatureCallback,
}: Pick<
  PassportScoreWidgetProps,
  "connectWalletCallback" | "collapseMode" | "generateSignatureCallback"
>) => {
  const [bodyIsOpen, setBodyIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { data: score, isLoading, isError } = useWidgetPassportScore();
  const { verifyCredentials, isPending: isVerifying } =
    useWidgetVerifyCredentials();

  // Initial auto-verify logic when score is low
  useEffect(() => {
    if (!isLoading && !isError && score && !isInitialized) {
      if (score.score < score.threshold) {
        verifyCredentials(undefined, {
          onSettled: () => {
            setIsInitialized(true);
          },
        });
      } else {
        setIsInitialized(true);
      }
    }
  }, [isLoading, isError, score, isInitialized, verifyCredentials]);

  // Score initially loading, or verify is running for the first time
  const showLoading = isLoading || (isVerifying && !isInitialized);

  return (
    <div className={styles.container}>
      <Header
        bodyIsOpen={bodyIsOpen}
        setBodyIsOpen={setBodyIsOpen}
        collapsible={Boolean(collapseMode && collapseMode !== "off")}
      />
      <Body
        isOpen={bodyIsOpen}
        collapseMode={collapseMode || "off"}
        className={styles.body}
        connectWalletCallback={connectWalletCallback}
        generateSignatureCallback={generateSignatureCallback}
        showLoading={showLoading}
      />
    </div>
  );
};
