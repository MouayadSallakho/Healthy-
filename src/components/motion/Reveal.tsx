"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { fadeUp, inViewport, staggerContainer, staggerItem } from "@/lib/landing-animations";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
  /** Delay the reveal (seconds). */
  delay?: number;
  /** Render as a different element (e.g. "ul", "section"). */
  as?: "div" | "section" | "ul" | "li" | "span";
};

/**
 * Scroll-triggered reveal wrapper. Wraps server-rendered children and animates
 * them into view once. Honors `prefers-reduced-motion` by rendering statically.
 */
export function Reveal({
  children,
  className,
  variants = fadeUp,
  delay = 0,
  as = "div",
}: RevealProps) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as];

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={inViewport}
      transition={delay ? { delay } : undefined}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Staggered group: children that use the `staggerItem` variant (or are wrapped
 * in <Reveal.Item/>) animate in sequence as the group scrolls into view.
 */
export function RevealGroup({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "ul";
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as];

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={inViewport}
    >
      {children}
    </MotionTag>
  );
}

export function RevealItem({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li" | "span";
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as];

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag className={className} variants={staggerItem}>
      {children}
    </MotionTag>
  );
}
