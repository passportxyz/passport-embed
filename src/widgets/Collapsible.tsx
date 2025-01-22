import { ReactNode, useRef } from "react";
import styles from "./PassportScoreWidget.module.css";

type CollapseMode = "shift" | "overlay";

export const Collapsible = ({
  className,
  children,
  isOpen,
  mode,
}: {
  className?: string;
  children: ReactNode;
  isOpen: boolean;
  mode: CollapseMode;
}) => {
  console.log("Collapsible", isOpen);
  const collapsibleRef = useRef<HTMLDivElement>(null);

  const bodyClasses = [
    styles.body,
    mode === "overlay" ? styles.overlay : "",
    isOpen ? styles.expanded : styles.collapsed,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={collapsibleRef} className={bodyClasses} aria-hidden={!isOpen}>
      {children}
    </div>
  );
};
