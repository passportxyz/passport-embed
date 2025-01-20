import { createRef, useEffect, useState } from "react";
import styles from "./ScrollableDiv.module.css";

// NOTE: MUST pass in a className for a class that defines a fixed height
export const ScrollableDiv = ({
  children,
  className,
  invertScrollIconColor,
}: {
  children: React.ReactNode;
  className: string;
  invertScrollIconColor?: boolean;
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
      <ScrollIndicator
        direction="up"
        scrollContainerRef={scrollContainerRef}
        invertScrollIconColor={invertScrollIconColor}
      />
      <ScrollIndicator
        direction="down"
        scrollContainerRef={scrollContainerRef}
        invertScrollIconColor={invertScrollIconColor}
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

    // passive=true tells the browser we will never call preventDefault.
    // Otherwise the browser waits for this call to complete before the
    // default action (scrolling) can start. This is more efficient.
    scrollContainerRef.current?.addEventListener("scroll", onScrollEvent, {
      passive: true,
    });

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
        <defs>
          <filter id="f1">
            {/* Smaller shadow matching the indicator, to help it pop */}
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="0.5"
              floodOpacity="1"
              floodColor={
                "rgba(var(" +
                (invertScrollIconColor
                  ? "--color-background-c6dbf459"
                  : "--color-primary-c6dbf459") +
                "), 1)"
              }
            />
            {/* Larger shadow matching the background, so the indicator
            stands out against the foreground */}
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="2"
              floodOpacity="1"
              floodColor={
                "rgba(var(" +
                (invertScrollIconColor
                  ? "--color-primary-c6dbf459"
                  : "--color-background-c6dbf459") +
                "), 1)"
              }
            />
          </filter>
        </defs>
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
          filter="url(#f1)"
        />
      </svg>
    </div>
  );
};
