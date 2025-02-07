import styles from "./Body.module.css";
import utilStyles from "../../utilStyles.module.css";
import { Button } from "../Button";
import { useEffect, useState } from "react";
import { PassportEmbedProps } from "../../hooks/usePassportScore";
import { useHeaderControls } from "../../hooks/useHeaderControls";

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
    setSubtitle("CONNECT WALLET");
  });

  return (
    <>
      <div className={styles.textBlock}>
        <div className={styles.heading}>Proof of Unique Humanity</div>
        <div>
          Your Passport XYZ score represents the likelihood that you’re a unique
          human, rather than a bot or bad actor.
        </div>
        <div className={utilStyles.bold}>
          {connectWalletCallback
            ? "Connect your wallet"
            : "Connect to the dapp"}{" "}
          and build up a score of 20 or more to participate.
        </div>
      </div>
      {connectWalletCallback && (
        <Button
          className={utilStyles.wFull}
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
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      )}
    </>
  );
};
