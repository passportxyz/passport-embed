import {
  GenericPassportWidgetProps,
  Widget,
  widgetQueryClient,
} from "./Widget";
import {
  PassportEmbedProps,
  PassportEmbedResult,
  usePassportScore,
} from "../hooks/usePassportScore";
import styles from "./PassportScoreWidget.module.css";
import { Header } from "../components/Header";
import { Body } from "../components/Body";
import { StepContextProvider } from "../contexts/StepContext";

export type PassportScoreWidgetProps = PassportEmbedProps &
  GenericPassportWidgetProps;

export const PassportScoreWidget = (props: PassportScoreWidgetProps) => {
  const { apiKey, address, scorerId, overrideIamUrl, queryClient } = props;

  const { data, isLoading, isError, error } = usePassportScore({
    apiKey,
    address,
    scorerId,
    overrideIamUrl,
    // Pass the override if provided, otherwise use the widget's queryClient
    queryClient: queryClient || widgetQueryClient,
  });

  return (
    <Widget {...props}>
      <StepContextProvider data={data} isLoading={isLoading}>
        <PassportScore {...props} data={data} isError={isError} error={error} />
      </StepContextProvider>
    </Widget>
  );
};

const PassportScore = ({
  data,
  isError,
  error,
  connectWalletCallback,
}: Omit<PassportEmbedResult, "isLoading"> &
  Pick<PassportEmbedProps, "connectWalletCallback">) => {
  return (
    <div className={styles.container}>
      <Header score={data?.score} passingScore={data?.passingScore} />
      <Body
        className={styles.body}
        errorMessage={isError ? error?.message : undefined}
        data={data}
        connectWalletCallback={connectWalletCallback}
      />
    </div>
  );
};
