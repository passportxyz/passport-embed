import styles from "./Body.module.css";
import { TooltipIcon } from "../../assets/tooltipIcon";
import { ReactNode } from "react";
import { Hyperlink } from "./ScoreTooLowBody";

const UpRightArrow = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7 7H17M17 7V17M17 7L7 17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const DocLink = ({ className, children, href }: { children: ReactNode; href: string; className?: string }) => (
  <Hyperlink className={`${styles.textCenter} ${styles.learnMore} ${className}`} href={href}>
    <TooltipIcon />
    <span>{children}</span>
    <UpRightArrow />
  </Hyperlink>
);
