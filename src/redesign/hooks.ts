import { RefObject, useEffect, useState } from "react";
import { parseRgbTriplet, RGB } from "./deriveTints";

/** True when the user asked for reduced motion. SSR-safe. */
export const useReducedMotion = (): boolean => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return reduced;
};

/**
 * Resolve the widget's `--accent` token (an "r, g, b" triplet) from a mounted
 * element, so derived palettes stay in lock-step with whatever theme the host
 * passed. Falls back to an explicit override, then to null (deriveTints seeds a
 * default).
 */
export const useAccentRgb = (ref: RefObject<HTMLElement>, override?: string): RGB | null => {
  const [rgb, setRgb] = useState<RGB | null>(() => (override ? parseRgbTriplet(override) : null));
  useEffect(() => {
    if (override) {
      setRgb(parseRgbTriplet(override));
      return;
    }
    if (typeof window === "undefined" || !ref.current) return;
    const resolved = getComputedStyle(ref.current).getPropertyValue("--accent");
    const parsed = parseRgbTriplet(resolved);
    if (parsed) setRgb(parsed);
  }, [ref, override]);
  return rgb;
};

/**
 * Animated count-up from 0 to `target`. Returns the current display value.
 * Collapses to the final value instantly under reduced-motion.
 */
export const useCountUp = (target: number, durationMs: number, reduced: boolean): number => {
  const [value, setValue] = useState(reduced ? target : 0);
  useEffect(() => {
    if (reduced || typeof window === "undefined" || !window.requestAnimationFrame) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, reduced]);
  return value;
};
