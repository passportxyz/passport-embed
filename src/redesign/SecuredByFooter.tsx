import React from "react";
import styles from "./SecuredByFooter.module.css";
import { HumanTechMark } from "./icons";

/**
 * SecuredByFooter - the single shared "Secured by human.tech" lockup (§ shell
 * chrome). One component, one icon + font + size + position + margin, so the
 * footer is byte-for-byte identical across every shell state (score, account,
 * drill-down, loading, error). Import this everywhere the lockup appears; never
 * re-inline the icon + text. The mark is the human.tech brand flower (not a
 * generic shield), monochrome via currentColor so it reads in both themes.
 */
export const SecuredByFooter: React.FC<{ className?: string; compact?: boolean }> = ({
  className = "",
  compact = false,
}) => (
  <div className={`${styles.footer} ${compact ? styles.compact : ""} ${className}`}>
    <HumanTechMark className={styles.mark} size={compact ? 11 : 13} />
    <span className={styles.text}>Secured by human.tech</span>
  </div>
);
