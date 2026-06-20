"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MealCard } from "./MealCard";
import { CtaButton } from "./CtaButton";
import { menuItems, menuTabs, PRODUCTS_ROUTE } from "@/lib/landing-content";

/**
 * Visual menu filtering preview. Static client-side filter with an animated
 * active-tab indicator. "View Products" routes to the products page.
 */
export function MenuPreviewTabs() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState("all");

  const filtered =
    active === "all"
      ? menuItems
      : menuItems.filter((m) => m.category === active);

  return (
    <section
      id="menu"
      aria-labelledby="menu-heading"
      className="section-pad bg-offwhite"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-maroon">
            <span className="h-px w-6 bg-maroon/50" />
            Explore the menu
          </span>
          <h2
            id="menu-heading"
            className="font-display text-3xl font-bold tracking-tight text-graphite sm:text-4xl lg:text-[2.75rem]"
          >
            Find meals for every goal
          </h2>
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Filter meals by goal"
          className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-2"
        >
          {menuTabs.map((tab) => {
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(tab.id)}
                className={`relative min-h-11 rounded-full px-4 text-sm font-semibold transition-colors duration-200 ${
                  isActive
                    ? "text-cream"
                    : "text-graphite/70 hover:text-maroon"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId={reduce ? undefined : "menu-tab-pill"}
                    className="absolute inset-0 rounded-full bg-maroon"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((meal) => (
              <motion.div
                key={meal.id}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <MealCard meal={meal} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-10 flex justify-center">
          <CtaButton href={PRODUCTS_ROUTE} variant="primary">
            View Products
          </CtaButton>
        </div>
      </div>
    </section>
  );
}
