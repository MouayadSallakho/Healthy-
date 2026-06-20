import type { Variants, Transition } from "motion/react";

/**
 * Reusable Motion animation variants for the landing page.
 *
 * Used with `whileInView` for scroll-triggered reveals and `whileHover` /
 * `whileTap` for interaction. Reduced-motion is respected at the component
 * level (see `components/motion/Reveal.tsx`) and globally in `globals.css`.
 */

const easePremium: Transition["ease"] = [0.22, 1, 0.36, 1];

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6, ease: easePremium } },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easePremium },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: easePremium },
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: easePremium } },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: easePremium } },
};

/** Parent container that staggers its children's reveal. */
export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

/** Child item meant to be used inside `staggerContainer`. */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easePremium } },
};

/** Subtle lift used on cards. Apply via `whileHover="hover"`. */
export const cardHover: Variants = {
  rest: { y: 0, transition: { duration: 0.3, ease: easePremium } },
  hover: { y: -8, transition: { duration: 0.3, ease: easePremium } },
};

/** Pleasant press feedback for buttons. */
export const buttonTap = {
  whileHover: { scale: 1.03 },
  whileTap: { scale: 0.97 },
  transition: { type: "spring" as const, stiffness: 400, damping: 22 },
};

/** Soft, looping float for the hero macro cards. */
export const floatLoop = (delay = 0): Variants => ({
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: [0, -10, 0],
    transition: {
      opacity: { duration: 0.6, ease: easePremium, delay },
      y: {
        duration: 4.5,
        ease: "easeInOut",
        repeat: Infinity,
        delay: delay + 0.4,
      },
    },
  },
});

/** Shared viewport config for scroll reveals. */
export const inViewport = { once: true, amount: 0.25 } as const;
