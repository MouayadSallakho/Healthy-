"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { promoMessages } from "@/lib/landing-content";
import { Icon } from "./icons";

/**
 * Slim premium promo bar above the navbar. Rotates through short messages.
 */
export function TopPromoBar() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % promoMessages.length),
      4500,
    );
    return () => clearInterval(id);
  }, [reduce]);

  const current = promoMessages[index];

  return (
    <div className="bg-maroon text-cream">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-center px-4 text-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={index}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2 text-[0.78rem] font-medium tracking-wide sm:text-xs"
          >
            <Icon name={current.icon} className="h-4 w-4 shrink-0 opacity-90" />
            <span>{current.text}</span>
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
