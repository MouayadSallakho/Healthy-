"use client";

import { motion, useReducedMotion } from "motion/react";
import { ProductCard } from "./ProductCard";
import { ProductCardSkeleton } from "./ProductCardSkeleton";
import { ProductListItem, ProductListItemSkeleton } from "./ProductListItem";
import { staggerContainer, staggerItem } from "@/lib/landing-animations";
import type { MenuProduct } from "@/features/menu/menu-types";

/**
 * Responsive product list:
 * - Mobile (`< sm`): a compact restaurant-menu list (`ProductListItem` rows)
 *   so several products are scannable per screen.
 * - `sm`+ : the premium card grid (2 → 3 cols), unchanged from before.
 *
 * Both variants render per item and are toggled with responsive `display`; the
 * hidden one never fetches its image (next/image skips `display:none`).
 * `skeletonCount` appends matching placeholders while the next batch loads;
 * `revealKey` (a filter signature) re-runs the staggered reveal.
 */
const CONTAINER =
  "flex flex-col gap-3 sm:grid sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 2xl:grid-cols-3";

function ProductCell({
  product,
  onView,
}: {
  product: MenuProduct;
  onView: (id: string) => void;
}) {
  return (
    <>
      <div className="sm:hidden">
        <ProductListItem product={product} onView={onView} />
      </div>
      <div className="hidden h-full sm:block">
        <ProductCard product={product} onView={onView} />
      </div>
    </>
  );
}

function SkeletonCell() {
  return (
    <>
      <div className="sm:hidden">
        <ProductListItemSkeleton />
      </div>
      <div className="hidden h-full sm:block">
        <ProductCardSkeleton />
      </div>
    </>
  );
}

export function ProductGrid({
  products,
  revealKey,
  onView,
  skeletonCount = 0,
}: {
  products: MenuProduct[];
  revealKey: string;
  onView: (id: string) => void;
  skeletonCount?: number;
}) {
  const reduce = useReducedMotion();

  const skeletons =
    skeletonCount > 0
      ? Array.from({ length: skeletonCount }).map((_, i) => (
          <li key={`skeleton-${i}`} className="h-full min-w-0">
            <SkeletonCell />
          </li>
        ))
      : null;

  if (reduce) {
    return (
      <ul className={CONTAINER}>
        {products.map((p) => (
          <li key={p.id} className="h-full min-w-0">
            <ProductCell product={p} onView={onView} />
          </li>
        ))}
        {skeletons}
      </ul>
    );
  }

  return (
    <motion.ul
      key={revealKey}
      className={CONTAINER}
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {products.map((p) => (
        <motion.li key={p.id} variants={staggerItem} className="h-full min-w-0">
          <ProductCell product={p} onView={onView} />
        </motion.li>
      ))}
      {skeletons}
    </motion.ul>
  );
}
