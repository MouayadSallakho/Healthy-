"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Icon } from "@/components/landing/icons";
import { MenuImage } from "./MenuImage";
import type { MenuProduct } from "@/features/menu/menu-types";

/**
 * Premium product card (desktop / tablet). Image + name open the detail modal;
 * "Add" is a UI-only placeholder (no cart persistence yet) with an accessible
 * confirmation state. Visuals are unchanged from the approved design — only the
 * data source (live API view model) differs.
 */
export function ProductCard({
  product,
  onView,
}: {
  product: MenuProduct;
  onView: (id: string) => void;
}) {
  const reduce = useReducedMotion();
  const [fav, setFav] = useState(false);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const handleAdd = () => {
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1800);
  };

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

        <button
          type="button"
          onClick={() => setFav((v) => !v)}
          aria-pressed={fav}
          aria-label={fav ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`}
          className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-white/85 text-maroon shadow ring-1 ring-black/5 backdrop-blur transition-colors hover:bg-white"
        >
          <Icon name="heart" className="h-5 w-5" style={fav ? { fill: "currentColor" } : undefined} />
        </button>
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

        <div className="mt-4 flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => onView(product.id)}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-graphite/20 px-4 text-sm font-semibold text-graphite transition-colors hover:border-maroon hover:text-maroon"
          >
            View details
          </button>
          <button
            type="button"
            onClick={handleAdd}
            aria-label={added ? `${product.name} added` : `Add ${product.name}`}
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-graphite px-5 text-sm font-semibold text-cream transition-colors duration-300 hover:bg-maroon"
          >
            <Icon name={added ? "check" : "spark"} className="h-4 w-4" aria-hidden="true" />
            {added ? "Added" : "Add"}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
