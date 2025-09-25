import styles from "./Body.module.css";
import { HumanTechLogo } from "../../assets/humanTechLogo";

export const HumanTechFooter = ({className}: {className?: string}) => (
  <div className={`${styles.footer} ${className}`}>
    <HumanTechLogo />
    <span className={styles.footerText}>Secured by human.tech</span>
  </div>
)
