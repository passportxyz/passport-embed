import { GenericPassportWidgetProps, Widget } from "./Widget";
import {
  PassportEmbedProps,
  usePassportScore,
} from "../hooks/usePassportScore";
import styles from "./PassportScoreWidget.module.css";
import { useState } from "react";
import { Header } from "./Header";
import { Body } from "./Body";

const PassportScore = ({
  apiKey,
  address,
  scorerId,
  overrideIamUrl,
}: PassportEmbedProps) => {
  const [enabled, setEnabled] = useState(false);

  const { data, isLoading, isError, error } = usePassportScore({
    enabled,
    address,
    apiKey,
    scorerId,
    overrideIamUrl,
  });

  return (
    <div className={styles.container}>
      <Header score={data?.score} passingScore={data?.passingScore} />
      <Body
        errorMessage={isError ? error?.message : undefined}
        enabled={enabled}
        setEnabled={setEnabled}
        isLoading={isLoading}
      />
    </div>
  );
};

export type PassportScoreWidgetProps = PassportEmbedProps &
  GenericPassportWidgetProps;

export const PassportScoreWidget = (props: PassportScoreWidgetProps) => {
  return (
    <Widget {...props}>
      <PassportScore {...props} />
    </Widget>
  );
};
