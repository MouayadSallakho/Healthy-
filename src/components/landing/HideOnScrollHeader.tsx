"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Sticky header stack (promo bar + navbar) that hides on scroll-down and shows
 * immediately on scroll-up, reclaiming vertical space on long pages.
 *
 * - Transform-based hide (`translateY(-100%)`) with a smooth CSS transition
 *   (auto-instant under `prefers-reduced-motion` via the global reduced-motion
 *   rule — no extra JS needed).
 * - Always shown near the very top (`scrollY <= 8`) and while keyboard focus is
 *   inside the header.
 * - A 4px delta threshold ignores scroll jitter; only hides past 80px.
 * - Publishes `--chrome-offset` (1 shown / 0 hidden) on `<html>` so sticky page
 *   controls (e.g. the products filter bar) can drop to the top when hidden.
 *
 * NOTE: a transform establishes a containing block for `position: fixed`
 * descendants, so fixed drawers/menus (MobileMenu) must NOT be DOM descendants
 * of this element — MobileMenu portals to `<body>`.
 */
export function HideOnScrollHeader({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    let current = false;
    const DELTA = 4;

    const apply = (next: boolean) => {
      if (current === next) return;
      current = next;
      setHidden(next);
      document.documentElement.style.setProperty("--chrome-offset", next ? "0" : "1");
    };

    const update = () => {
      ticking = false;
      const y = window.scrollY < 0 ? 0 : window.scrollY;

      // Always visible at the very top or while focus is inside the header.
      if (y <= 8 || ref.current?.contains(document.activeElement)) {
        apply(false);
        lastY = y;
        return;
      }

      const diff = y - lastY;
      if (Math.abs(diff) < DELTA) return; // ignore jitter; keep accumulating

      if (diff > 0 && y > 80) apply(true); // scrolling down past threshold → hide
      else if (diff < 0) apply(false); // scrolling up → show immediately
      lastY = y;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.documentElement.style.setProperty("--chrome-offset", "1");
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`sticky top-0 z-40 transition-transform duration-300 ease-out ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      {children}
    </div>
  );
}
