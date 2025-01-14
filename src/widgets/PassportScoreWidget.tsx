import {
  GenericPassportWidgetProps,
  Widget,
  widgetQueryClient,
} from "./Widget";
import {
  PassportEmbedProps,
  usePassportScore,
} from "../hooks/usePassportScore";
import styles from "./PassportScoreWidget.module.css";
import { Header } from "../components/Header";
import { Body } from "../components/Body";
import { StepContextProvider, useStep } from "../contexts/StepContext";

const PassportScore = ({
  apiKey,
  address,
  scorerId,
  overrideIamUrl,
  queryClient,
}: PassportEmbedProps) => {
  const { currentStep } = useStep();

  const { data, isLoading, isError, error } = usePassportScore({
    enabled: currentStep !== "initial",
    apiKey,
    address,
    scorerId,
    overrideIamUrl,
    // Pass the override if provided, otherwise use the widget's queryClient
    queryClient: queryClient || widgetQueryClient,
  });

  return (
    <div className={styles.container}>
      <Header score={data?.score} passingScore={data?.passingScore} />
      <Body
        errorMessage={isError ? error?.message : undefined}
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
      <StepContextProvider>
        <PassportScore {...props} />
      </StepContextProvider>
    </Widget>
  );
};
