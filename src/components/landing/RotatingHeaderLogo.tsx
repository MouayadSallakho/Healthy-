"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Logo } from "./Logo";
import { BuildMuscleIcon } from "./BuildMuscleIcon";

const INTERVAL_MS = 3000;
const FLIP_DURATION_S = 0.6;
const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Header logo that alternates between the main red logo and the Build Muscle
 * mark every 3s with a subtle 3D flip + crossfade.
 *
 * - Fixed-size box (matches the red logo's footprint) → no layout shift / no
 *   navbar height change; the wider goal mark is `object-contain`ed inside it.
 * - Both marks are maroon → readable on the light/cream header (never white).
 * - The accessible name lives on the surrounding link, and the marks are
 *   decorative, so swaps are silent to screen readers.
 * - Reduced motion: renders the main logo only, no animation, no swapping.
 * - Pauses while hovered to avoid distraction.
 */
export function RotatingHeaderLogo({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduce || paused) return;
    const id = setInterval(() => setIndex((i) => (i === 0 ? 1 : 0)), INTERVAL_MS);
    return () => clearInterval(id);
  }, [reduce, paused]);

  // Same fixed box on every breakpoint so neither mark shifts the navbar.
  const box = `relative block h-9 w-[3.15rem] sm:h-10 sm:w-[3.5rem] ${className}`;

  const faces = [
    <Logo key="logo" variant="red" className="h-full w-full" priority />,
    <BuildMuscleIcon key="goal" variant="maroon" className="h-full w-full" />,
  ];

  if (reduce) {
    return (
      <span className={box}>
        <span className="absolute inset-0">{faces[0]}</span>
      </span>
    );
  }

  return (
    <span
      className={box}
      style={{ perspective: "600px" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence initial={false}>
        <motion.span
          key={index}
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          exit={{ rotateY: -90, opacity: 0 }}
          transition={{ duration: FLIP_DURATION_S, ease }}
          style={{ transformStyle: "preserve-3d" }}
          className="absolute inset-0"
        >
          {faces[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
