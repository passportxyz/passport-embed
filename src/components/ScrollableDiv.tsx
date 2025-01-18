import { createRef, useEffect, useState } from "react";
import styles from "./ScrollableDiv.module.css";

// MUST pass in a className for a class that defines a fixed height
export const ScrollableDiv = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) => {
  const scrollContainerRef = createRef<HTMLDivElement>();

  return (
    <div className={`${className} ${styles.scrollableDiv}`}>
      <div
        className={`${styles.scrollable} ${className}`}
        ref={scrollContainerRef}
      >
        {children}
      </div>
      <ScrollIndicator scrollContainerRef={scrollContainerRef} direction="up" />
      <ScrollIndicator
        scrollContainerRef={scrollContainerRef}
        direction="down"
      />
    </div>
  );
};

type ScrollIndicatorDirection = "up" | "down";

const ScrollIndicator = ({
  scrollContainerRef,
  direction,
  invertScrollIconColor,
}: {
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  direction: ScrollIndicatorDirection;
  invertScrollIconColor?: boolean;
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = (element: HTMLDivElement) => {
      const { scrollTop, scrollHeight, clientHeight } = element;

      const isAtBottom = scrollTop + clientHeight >= scrollHeight;
      const isAtTop = scrollTop === 0;

      setVisible(direction === "down" ? !isAtBottom : !isAtTop);
    };

    const onScrollEvent = (event: Event) => {
      const element = event.target;
      if (element instanceof HTMLDivElement) {
        onScroll(element);
      } else {
        throw new Error("Expected scroll event target to be HTMLDivElement");
      }
    };

    scrollContainerRef.current?.addEventListener("scroll", onScrollEvent);

    // Initial visibility check on mount
    scrollContainerRef.current && onScroll(scrollContainerRef.current);

    // Remove on dismount
    return () => {
      scrollContainerRef.current?.removeEventListener("scroll", onScrollEvent);
    };
  }, [scrollContainerRef]);

  return (
    <div
      className={`${styles.scrollIndicator} ${
        visible ? styles.visible : styles.invisible
      } ${
        direction === "down"
          ? styles.scrollDownIndicator
          : styles.scrollUpIndicator
      }`}
    >
      <svg
        width="16"
        height="8"
        viewBox="0 0 16 8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 0.999999L8 7L15 1"
          stroke={
            invertScrollIconColor
              ? "rgb(var(--color-background-c6dbf459))"
              : "rgb(var(--color-primary-c6dbf459))"
          }
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
