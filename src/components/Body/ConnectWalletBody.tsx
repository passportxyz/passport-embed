import styles from "./Body.module.css";
import utilStyles from "../../utilStyles.module.css";
import { Button } from "../Button";
import { useEffect, useState } from "react";
import { PassportEmbedProps } from "../../hooks/usePassportScore";
import { useHeaderControls } from "../../hooks/useHeaderControls";
import { PersonIcon } from "../../assets/personIcon";
import { WalletIcon } from "../../assets/walletIcon";
import { HumanTechLogo } from "../../assets/humanTechLogo";

export const ConnectWalletBody = ({
  connectWalletCallback,
}: Pick<PassportEmbedProps, "connectWalletCallback"> & {}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { setSubtitle } = useHeaderControls();

  useEffect(() => {
    setSubtitle(""); // Remove subtitle for new design
  });

  return (
    <>
      <div className={styles.blurEffect}></div>
      <div className={styles.textBlock}>
        <div className={styles.iconContainer}>
          <PersonIcon />
        </div>
        <div className={styles.smallHeading}>Proof of Personhood</div>
        <div className={styles.subtitleText}>
          {connectWalletCallback ? "Connect your wallet" : "Connect to the dapp"} and build up a score greater than 20
          to participate
        </div>
      </div>
      {connectWalletCallback && (
        <Button
          className={`${utilStyles.wFull} ${styles.button}`}
          disabled={isConnecting}
          onClick={async () => {
            try {
              setIsConnecting(true);
              await connectWalletCallback();
            } finally {
              setIsConnecting(false);
            }
          }}
        >
          <div className={styles.buttonContent}>
            <WalletIcon />
            <span>{isConnecting ? "Connecting..." : "Connect wallet"}</span>
          </div>
        </Button>
      )}
      <div className={styles.footer}>
        <div className={styles.footerContent}>
          <HumanTechLogo />
          <span className={styles.footerText}>Secured by human.tech</span>
        </div>
      </div>
    </>
  );
};
