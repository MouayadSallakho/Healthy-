"use client";

import { motion, useReducedMotion } from "motion/react";
import { ProductCard } from "./ProductCard";
import { ProductCardSkeleton } from "./ProductCardSkeleton";
import { staggerContainer, staggerItem } from "@/lib/landing-animations";
import type { Product } from "@/lib/products-content";

/**
 * Responsive product grid: 1 col mobile → 2 col tablet → 3 col laptop → 4 col
 * wide desktop. Renders only the currently-visible products; `skeletonCount`
 * appends matching placeholders (in the same grid → no layout shift) while the
 * next batch loads. `revealKey` (a filter signature) re-runs the staggered
 * reveal when the result set changes. Static when reduced motion is preferred.
 */
const GRID = "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3";

export function ProductGrid({
  products,
  revealKey,
  onView,
  skeletonCount = 0,
}: {
  products: Product[];
  revealKey: string;
  onView: (id: string) => void;
  skeletonCount?: number;
}) {
  const reduce = useReducedMotion();

  const skeletons =
    skeletonCount > 0
      ? Array.from({ length: skeletonCount }).map((_, i) => (
          <li key={`skeleton-${i}`} className="h-full min-w-0">
            <ProductCardSkeleton />
          </li>
        ))
      : null;

  if (reduce) {
    return (
      <ul className={GRID}>
        {products.map((p) => (
          <li key={p.id} className="h-full min-w-0">
            <ProductCard product={p} onView={onView} />
          </li>
        ))}
        {skeletons}
      </ul>
    );
  }

  return (
    <motion.ul
      key={revealKey}
      className={GRID}
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {products.map((p) => (
        <motion.li key={p.id} variants={staggerItem} className="h-full min-w-0">
          <ProductCard product={p} onView={onView} />
        </motion.li>
      ))}
      {skeletons}
    </motion.ul>
  );
}
