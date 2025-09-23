import React, { useState, useRef, useEffect } from "react";
import {
  computePosition,
  flip,
  shift,
  offset,
  arrow,
  autoUpdate,
  Placement,
  FloatingElement,
  ReferenceElement,
} from "@floating-ui/dom";
import styles from "./Tooltip.module.css";

interface TooltipProps {
  content: React.ReactNode;
  placement?: Placement;
  children?: React.ReactNode;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, placement = "top", children, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) return;

    // This is the key - autoUpdate handles scroll/resize automatically
    const cleanup = autoUpdate(triggerRef.current as ReferenceElement, tooltipRef.current as FloatingElement, () => {
      if (!triggerRef.current || !tooltipRef.current) return;

      computePosition(triggerRef.current, tooltipRef.current, {
        placement,
        strategy: "fixed", // Use 'fixed' strategy for better scroll handling
        middleware: [offset(12), flip(), shift({ padding: 10 }), arrow({ element: arrowRef.current! })],
      }).then(({ x, y, placement: finalPlacement, middlewareData }) => {
        if (!tooltipRef.current) return;

        // Apply positioning
        Object.assign(tooltipRef.current.style, {
          left: `${x}px`,
          top: `${y}px`,
        });

        // Position the arrow
        if (arrowRef.current && middlewareData.arrow) {
          const { x: arrowX, y: arrowY } = middlewareData.arrow;
          const staticSide = {
            top: "bottom",
            right: "left",
            bottom: "top",
            left: "right",
          }[finalPlacement.split("-")[0]]!;

          Object.assign(arrowRef.current.style, {
            left: arrowX != null ? `${arrowX}px` : "",
            top: arrowY != null ? `${arrowY}px` : "",
            right: "",
            bottom: "",
            [staticSide]: "-4px",
          });
        }

        // Add placement as data attribute for arrow styling
        tooltipRef.current.setAttribute("data-placement", finalPlacement);
      });
    });

    return () => cleanup();
  }, [isVisible, placement]);

  // Close tooltip on scroll for better UX (optional)
  useEffect(() => {
    if (!isVisible) return;

    const handleScroll = () => {
      // Optional: hide tooltip on scroll for cleaner UX
      // setIsVisible(false);
    };

    // Add scroll listener to window and all scrollable parents
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [isVisible]);

  return (
    <>
      {/* Trigger */}
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className={styles.trigger}
      >
        {children}
      </div>

      {/* Portal the tooltip to body to avoid transform/position issues */}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`${styles.tooltip} ${className}`}
          role="tooltip"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "max-content",
          }}
        >
          <div className={styles.content}>{content}</div>
          <div ref={arrowRef} className={styles.arrow} />
        </div>
      )}
    </>
  );
};
