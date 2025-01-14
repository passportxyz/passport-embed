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

const PassportScore = ({
  apiKey,
  address,
  scorerId,
  overrideIamUrl,
  queryClient,
}: PassportEmbedProps) => {
  const { data, isLoading, isError, error } = usePassportScore({
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
        data={data}
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
