import { Widget } from "./Widget";
import {
  PassportScoreProps,
  usePassportScore,
} from "../hooks/usePassportScore";
import styles from "./PassportScoreWidget.module.css";

const PassportScore = ({ apiKey, address, scorerId }: PassportScoreProps) => {
  const { data, isLoading, isError, error } = usePassportScore({
    apiKey,
    address,
    scorerId,
  });

  return (
    <div className={styles.container}>
      <h1>Score Data</h1>
      {isLoading ? (
        <div>Loading...</div>
      ) : isError ? (
        <div>Error: {error.message}</div>
      ) : (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
};

export const PassportScoreWidget = (props: PassportScoreProps) => {
  return (
    <Widget>
      <PassportScore {...props} />
    </Widget>
  );
};
