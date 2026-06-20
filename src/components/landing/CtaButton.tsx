"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

type Variant = "primary" | "secondary" | "ghost" | "silver";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-wide transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-[3px]";

const sizes: Record<Size, string> = {
  md: "min-h-11 px-6 text-sm",
  lg: "min-h-13 px-8 text-base",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-maroon text-cream shadow-lg shadow-maroon/25 hover:bg-maroon-bright",
  secondary:
    "border border-graphite/20 bg-white/70 text-graphite backdrop-blur hover:border-maroon hover:text-maroon",
  ghost:
    "border border-cream/30 text-cream hover:bg-cream/10",
  silver:
    "brushed-metal text-graphite shadow-md ring-1 ring-black/5 hover:brightness-105",
};

/**
 * Premium animated CTA. Routes to a real Next.js route when `href` is internal
 * and includes hover/tap motion that respects reduced-motion preferences.
 */
export function CtaButton({
  href,
  children,
  variant = "primary",
  size = "lg",
  className = "",
  fullWidth = false,
  ...rest
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  fullWidth?: boolean;
} & React.AriaAttributes) {
  const reduce = useReducedMotion();
  const classes = `${base} ${sizes[size]} ${variants[variant]} ${
    fullWidth ? "w-full" : ""
  } ${className}`;

  return (
    <motion.div
      className={fullWidth ? "w-full" : "inline-flex"}
      whileHover={reduce ? undefined : { scale: 1.03 }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
    >
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    </motion.div>
  );
}
