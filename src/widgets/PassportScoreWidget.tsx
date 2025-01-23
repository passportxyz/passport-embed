import { GenericPassportWidgetProps, Widget } from "./Widget";
import { PassportEmbedProps } from "../hooks/usePassportScore";
import styles from "./PassportScoreWidget.module.css";
import { Header } from "../components/Header";
import { Body } from "../components/Body";
import { HeaderContextProvider } from "../contexts/HeaderContext";
import { QueryContextProvider } from "../contexts/QueryContext";
import { useState } from "react";

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
  collapseMode,
}: Pick<
  PassportScoreWidgetProps,
  "connectWalletCallback" | "collapseMode"
>) => {
  const [bodyIsOpen, setBodyIsOpen] = useState(true);
  return (
    <div className={styles.container}>
      <Header
        bodyIsOpen={bodyIsOpen}
        setBodyIsOpen={setBodyIsOpen}
        collapsible={collapseMode !== "off"}
      />
      <Body
        isOpen={bodyIsOpen}
        collapseMode={collapseMode || "off"}
        className={styles.body}
        connectWalletCallback={connectWalletCallback}
      />
    </div>
  );
};
