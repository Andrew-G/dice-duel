import { useCallback, useEffect, useRef } from "react";

/** How long to wait after an action before the page starts to scroll (ms). */
export const SCROLL_DELAY_MS = 250;

/** The scroll counts as finished once the page hasn't moved for this long (ms). */
const SETTLE_MS = 120;

/** Never wait longer than this for a scroll to finish (ms). */
const MAX_SCROLL_MS = 1500;

/**
 * Wait a beat, scroll an element to the top of the screen, then report when
 * the page has actually stopped moving.
 *
 * Smooth scrolling has no completion callback that works everywhere, so this
 * watches `scrollY` frame by frame until it holds still. That also covers the
 * case where there's nowhere to scroll, and a hard cap means `onSettled`
 * always fires. With reduced motion the jump is instant, so it fires at once.
 *
 * Starting another scroll, or unmounting, cancels the one in flight.
 */
export function useDelayedScroll() {
  const timer = useRef(0);
  const frame = useRef(0);

  const cancel = useCallback(() => {
    window.clearTimeout(timer.current);
    window.cancelAnimationFrame(frame.current);
  }, []);

  useEffect(() => cancel, [cancel]);

  const scrollTo = useCallback(
    (getTarget: () => HTMLElement | null, onSettled: () => void) => {
      cancel();

      // Look the target up when the delay is over, not now: the score you just
      // made may have changed what's on screen.
      timer.current = window.setTimeout(() => {
        const target = getTarget();
        if (!target) return onSettled();

        const reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;
        target.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start",
        });
        if (reduceMotion) return onSettled();

        const startedAt = performance.now();
        let lastY = window.scrollY;
        let stillSince = startedAt;

        const watch = (now: number) => {
          if (window.scrollY !== lastY) {
            lastY = window.scrollY;
            stillSince = now;
          }
          if (now - stillSince >= SETTLE_MS || now - startedAt >= MAX_SCROLL_MS) {
            return onSettled();
          }
          frame.current = window.requestAnimationFrame(watch);
        };
        frame.current = window.requestAnimationFrame(watch);
      }, SCROLL_DELAY_MS);
    },
    [cancel]
  );

  return { scrollTo };
}
