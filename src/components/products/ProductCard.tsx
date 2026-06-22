"use client";

import { motion, useReducedMotion } from "motion/react";
import { Icon } from "@/components/landing/icons";
import { MenuImage } from "./MenuImage";
import type { MenuProduct } from "@/features/menu/menu-types";

/**
 * Premium product card (desktop / tablet). The image, the name, and the
 * "View details" button all open the detail modal. This is a browse-only menu —
 * there are no cart or wishlist actions.
 */
export function ProductCard({
  product,
  onView,
}: {
  product: MenuProduct;
  onView: (id: string) => void;
}) {
  const reduce = useReducedMotion();

  const macros = [
    { label: "Protein", value: `${product.macros.protein}g` },
    { label: "Carbs", value: `${product.macros.carbs}g` },
    { label: "Fat", value: `${product.macros.fat}g` },
    { label: "Cal", value: `${product.macros.calories}` },
  ];

  return (
    <motion.article
      initial="rest"
      animate="rest"
      whileHover={reduce ? undefined : "hover"}
      variants={{ rest: { y: 0 }, hover: { y: -8 } }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-graphite/10 bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-black/10"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-graphite">
        <motion.div
          variants={{ rest: { scale: 1 }, hover: { scale: 1.06 } }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <MenuImage
            src={product.image}
            alt={`${product.name} — ${product.shortDescription}`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw"
          />
        </motion.div>

        {/* Whole-image button to open details */}
        <button
          type="button"
          onClick={() => onView(product.id)}
          className="absolute inset-0 z-10"
          aria-label={`View details for ${product.name}`}
        />

        {product.badge && (
          <span className="pointer-events-none absolute left-3 top-3 z-20 rounded-full bg-maroon px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wide text-cream shadow">
            {product.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-bold leading-tight tracking-tight text-graphite">
          <button
            type="button"
            onClick={() => onView(product.id)}
            className="text-left transition-colors hover:text-maroon focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {product.name}
          </button>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-graphite/60">
          {product.shortDescription}
        </p>

        <dl className="mt-4 grid grid-cols-4 gap-1 rounded-xl bg-offwhite p-2.5 text-center">
          {macros.map((m) => (
            <div key={m.label} className="flex flex-col">
              <dt className="text-[0.65rem] font-medium uppercase tracking-wide text-graphite/45">
                {m.label}
              </dt>
              <dd className="font-display text-base font-bold text-maroon">{m.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 flex items-end justify-between gap-2">
          <span className="font-display text-xl font-bold text-graphite">
            ${product.price.toFixed(2)}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium text-graphite/55">
            <Icon
              name={product.isAvailable ? "check" : "clock"}
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />
            {product.isAvailable ? "Available today" : "Currently unavailable"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onView(product.id)}
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-graphite/20 px-4 text-sm font-semibold text-graphite transition-colors hover:border-maroon hover:text-maroon"
        >
          View details
        </button>
      </div>
    </motion.article>
  );
}
