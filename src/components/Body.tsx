import styles from "./Body.module.css";
import { Button } from "../components/Button";
import { useStep } from "../contexts/StepContext";

const ScoreButton = ({
  onClick,
  className,
  disabled,
  isLoading,
}: {
  onClick: () => void;
  className: string;
  disabled: boolean;
  isLoading: boolean;
}) => (
  <Button onClick={onClick} className={className} disabled={disabled}>
    <div className={styles.centerChildren}>
      <div className={isLoading ? styles.visible : styles.invisible}>
        Checking...
      </div>
      <div className={isLoading ? styles.invisible : styles.visible}>
        Check your Passport score
      </div>
    </div>
  </Button>
);

const BodyWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className={styles.container}>{children}</div>
);

const BodyRouter = ({ isLoading }: { isLoading: boolean }) => {
  const { currentStep, gotoStep } = useStep();

  return (
    <>
      <div className={styles.text}>
        Bla bla stuff about scoring and Passports and such
      </div>
      <div className={styles.centerChildren}>
        <ScoreButton
          className=""
          onClick={() => gotoStep("checking")}
          disabled={false}
          isLoading={isLoading}
        />
      </div>
    </>
  );
};

export const Body = ({
  errorMessage,
  isLoading,
}: {
  errorMessage?: string;
  isLoading: boolean;
}) => {
  return (
    <BodyWrapper>
      {errorMessage ? (
        <div>Error: {errorMessage}</div>
      ) : (
        <BodyRouter isLoading={isLoading} />
      )}
    </BodyWrapper>
  );
};
