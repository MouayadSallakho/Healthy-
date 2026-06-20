"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Icon } from "./icons";
import { PRODUCTS_ROUTE, type Meal } from "@/lib/landing-content";

/**
 * Premium meal card with hover lift, subtle image zoom, and an Add CTA that
 * routes to the products page. Reused by Featured Meals and the menu preview.
 */
export function MealCard({ meal }: { meal: Meal }) {
  const reduce = useReducedMotion();
  const [fav, setFav] = useState(false);

  const macroItems = [
    { label: "Protein", value: `${meal.macros.protein}g` },
    { label: "Carbs", value: `${meal.macros.carbs}g` },
    { label: "Fat", value: `${meal.macros.fat}g` },
    { label: "Cal", value: `${meal.macros.calories}` },
  ];

  return (
    <motion.article
      initial="rest"
      whileHover={reduce ? undefined : "hover"}
      animate="rest"
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
          <Image
            src={meal.image}
            alt={`${meal.name} — ${meal.ingredients}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
          />
        </motion.div>

        <span className="absolute left-3 top-3 rounded-full bg-maroon px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wide text-cream shadow">
          {meal.tag}
        </span>

        <button
          type="button"
          onClick={() => setFav((v) => !v)}
          aria-pressed={fav}
          aria-label={fav ? `Remove ${meal.name} from favorites` : `Add ${meal.name} to favorites`}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/85 text-maroon shadow ring-1 ring-black/5 backdrop-blur transition-colors hover:bg-white"
        >
          <Icon
            name="heart"
            className="h-5 w-5"
            style={fav ? { fill: "currentColor" } : undefined}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl font-bold tracking-tight text-graphite">
          {meal.name}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-graphite/60">
          {meal.ingredients}
        </p>

        <dl className="mt-4 grid grid-cols-4 gap-1 rounded-xl bg-offwhite p-2.5 text-center">
          {macroItems.map((m) => (
            <div key={m.label} className="flex flex-col">
              <dt className="text-[0.65rem] font-medium uppercase tracking-wide text-graphite/45">
                {m.label}
              </dt>
              <dd className="font-display text-base font-bold text-maroon">
                {m.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 flex items-center justify-between gap-3 pt-1">
          <span className="font-display text-xl font-bold text-graphite">
            {meal.price}
          </span>
          <Link
            href={PRODUCTS_ROUTE}
            aria-label={`Add ${meal.name} — opens products`}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-graphite px-5 text-sm font-semibold text-cream transition-colors duration-300 group-hover:bg-maroon hover:bg-maroon"
          >
            <Icon name="check" className="h-4 w-4" />
            Add
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
