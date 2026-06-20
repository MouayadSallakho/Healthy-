"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Icon } from "./icons";
import { PRODUCTS_ROUTE } from "@/lib/landing-content";

/**
 * Mobile-only sticky Order Now bar. Appears after the user scrolls past the
 * hero, includes safe-area padding, and never renders on md+ screens.
 */
export function MobileStickyOrder() {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="md:hidden">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={reduce ? false : { y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? undefined : { y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-0"
          >
            <Link
              href={PRODUCTS_ROUTE}
              className="flex min-h-14 items-center justify-between gap-3 rounded-2xl bg-maroon px-5 text-cream shadow-2xl shadow-black/30 ring-1 ring-black/10 transition-colors hover:bg-maroon-bright"
            >
              <span className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-cream/15">
                  <Icon name="bolt" className="h-5 w-5" />
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="font-display text-base font-bold">Order Now</span>
                  <span className="text-[0.7rem] text-silver-light/85">
                    Ready in 20 min
                  </span>
                </span>
              </span>
              <span className="flex items-center gap-1 text-sm font-semibold">
                Start
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
