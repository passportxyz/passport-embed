import { GenericPassportWidgetProps, Widget } from "./Widget";
import { PassportEmbedProps } from "../hooks/usePassportScore";
import styles from "./PassportScoreWidget.module.css";
import { Header } from "../components/Header";
import { Body } from "../components/Body";
import { HeaderContextProvider } from "../contexts/HeaderContext";
import { QueryContextProvider } from "../contexts/QueryContext";
import { useState } from "react";
import { Collapsible } from "./Collapsible";

export type PassportScoreWidgetProps = PassportEmbedProps &
  GenericPassportWidgetProps;

export const PassportScoreWidget = (props: PassportScoreWidgetProps) => {
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
}: Pick<PassportEmbedProps, "connectWalletCallback">) => {
  const [bodyIsOpen, setBodyIsOpen] = useState(true);
  return (
    <div className={styles.container}>
      <Header bodyIsOpen={bodyIsOpen} setBodyIsOpen={setBodyIsOpen} />
      <Collapsible isOpen={bodyIsOpen} mode="shift">
        <Body
          className={styles.body}
          connectWalletCallback={connectWalletCallback}
        />
      </Collapsible>
    </div>
  );
};
