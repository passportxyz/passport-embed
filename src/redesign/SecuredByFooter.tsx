import React from "react";
import styles from "./SecuredByFooter.module.css";
import { ShieldIcon } from "./icons";

/**
 * SecuredByFooter - the single shared "Secured by human.tech" lockup (§ shell
 * chrome). One component, one icon + font + size + position + margin, so the
 * footer is byte-for-byte identical across every shell state (score, account,
 * drill-down, loading, error). Import this everywhere the lockup appears; never
 * re-inline the icon + text.
 */
export const SecuredByFooter: React.FC<{ className?: string; compact?: boolean }> = ({
  className = "",
  compact = false,
}) => (
  <div className={`${styles.footer} ${compact ? styles.compact : ""} ${className}`}>
    <ShieldIcon className={styles.mark} size={compact ? 10 : 12} />
    <span className={styles.text}>Secured by human.tech</span>
  </div>
);
