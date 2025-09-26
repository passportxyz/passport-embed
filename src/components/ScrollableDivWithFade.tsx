import { useLayoutEffect, useState, useRef } from "react";
import styles from "./ScrollableDivWithFade.module.css";

// NOTE: MUST pass in a className for a class that defines a fixed height
export const ScrollableDivWithFade = ({
  children,
  className,
  invertFadeColor,
}: {
  children: React.ReactNode;
  className: string;
  invertFadeColor?: boolean;
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(false);

  useLayoutEffect(() => {
    const onScroll = (element: HTMLDivElement) => {
      const { scrollTop, scrollHeight, clientHeight } = element;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1; // -1 for precision issues
      const isAtTop = scrollTop <= 1; // 1 for precision issues
      const canScroll = scrollHeight > clientHeight;

      setShowTopFade(canScroll && !isAtTop);
      setShowBottomFade(canScroll && !isAtBottom);
    };

    const onScrollEvent = (event: Event) => {
      const element = event.target;
      if (element instanceof HTMLDivElement) {
        onScroll(element);
      }
    };

    // passive=true tells the browser we will never call preventDefault.
    // This is more efficient for scroll events.
    scrollContainerRef.current?.addEventListener("scroll", onScrollEvent, {
      passive: true,
    });

    // Initial visibility check on mount
    if (scrollContainerRef.current) onScroll(scrollContainerRef.current);

    const localRef = scrollContainerRef.current;

    // Remove on dismount
    return () => {
      localRef?.removeEventListener("scroll", onScrollEvent);
    };
  }, [scrollContainerRef]);

  return (
    <div className={styles.fadeContainer}>
      <div className={`${className} ${styles.scrollableDiv}`} ref={scrollContainerRef}>
        <div className={styles.contents}>{children}</div>
      </div>
      <div
        className={`${styles.fadeOverlayTop} ${showTopFade ? styles.fadeVisible : styles.fadeHidden} ${invertFadeColor ? styles.fadeOverlayInverted : ""}`}
      />
      <div
        className={`${styles.fadeOverlayBottom} ${showBottomFade ? styles.fadeVisible : styles.fadeHidden} ${invertFadeColor ? styles.fadeOverlayInverted : ""}`}
      />
    </div>
  );
};

