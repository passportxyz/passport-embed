import styles from "./Body.module.css";
import utilStyles from "../../utilStyles.module.css";
import { Button } from "../Button";
import { useEffect, useState } from "react";
import { PassportEmbedProps } from "../../hooks/usePassportScore";
import { useHeaderControls } from "../../hooks/useHeaderControls";
import { PersonIcon } from "../../assets/personIcon";
import { WalletIcon } from "../../assets/walletIcon";

// TODO technically this might not have a threshold of 20, but
// how would we know at this point before we've made a request
// to the backend? Do we do a pre-check? Or let the integrator
// pass in an override?

export const ConnectWalletBody = ({
  connectWalletCallback,
}: Pick<PassportEmbedProps, "connectWalletCallback"> & {}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { setSubtitle } = useHeaderControls();

  useEffect(() => {
    setSubtitle("");  // Remove subtitle for new design
  });

  return (
    <>
      <div className={styles.iconContainer}>
        <PersonIcon />
      </div>
      <div className={styles.textBlock}>
        <div className={styles.heading}>Proof of Personhood</div>
        <div>
          {connectWalletCallback ? "Connect your wallet" : "Connect to the dapp"} and build up a score greater than 20 to participate
        </div>
      </div>
      {connectWalletCallback && (
        <Button
          className={utilStyles.wFull}
          invert={true}
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
        <span className={styles.footerText}>🔒 Secured by human.tech</span>
      </div>
    </>
  );
};
