"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Icon } from "./icons";
import { BuildMuscleIcon } from "./BuildMuscleIcon";
import { CtaButton } from "./CtaButton";
import { macroGoals, PRODUCTS_ROUTE } from "@/lib/landing-content";

/**
 * Interactive "choose by goal" preview — a premium smart-ordering feel kept
 * intentionally simple. Selecting a goal reveals the recommended meal style.
 */
export function MacroGoalSelector() {
  const reduce = useReducedMotion();
  const [activeId, setActiveId] = useState(macroGoals[0].id);
  const active = macroGoals.find((g) => g.id === activeId) ?? macroGoals[0];

  const detail = [
    { label: "Recommended style", value: active.mealStyle, icon: "leaf" as const },
    { label: "Calorie direction", value: active.calorieDirection, icon: "flame" as const },
    { label: "Protein focus", value: active.proteinFocus, icon: "protein" as const },
  ];

  return (
    <section
      id="goals"
      aria-labelledby="goals-heading"
      className="section-pad mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
    >
      <div className="overflow-hidden rounded-3xl gym-surface p-6 text-cream sm:p-10 lg:p-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-maroon-bright">
              <span className="h-px w-6 bg-maroon-bright/60" />
              Smart ordering
            </span>
            <h2
              id="goals-heading"
              className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Choose meals based on your goal.
            </h2>
            <p className="mt-3 max-w-md text-base leading-relaxed text-silver-light/80">
              Tell us where you&apos;re headed and we&apos;ll point you to the
              meals built to get you there.
            </p>

            <div
              role="tablist"
              aria-label="Select your goal"
              className="mt-7 grid grid-cols-2 gap-3"
            >
              {macroGoals.map((goal) => {
                const isActive = goal.id === activeId;
                return (
                  <button
                    key={goal.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveId(goal.id)}
                    className={`flex min-h-12 items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors duration-200 ${
                      isActive
                        ? "border-maroon-bright bg-maroon text-cream"
                        : "border-cream/15 bg-cream/5 text-silver-light hover:border-cream/35"
                    }`}
                  >
                    {goal.id === "build" ? (
                      <BuildMuscleIcon
                        variant={isActive ? "white" : "maroon"}
                        className="h-5 w-5 shrink-0"
                      />
                    ) : (
                      <Icon name={goal.icon} className="h-5 w-5 shrink-0" />
                    )}
                    {goal.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Result panel */}
          <div className="flex flex-col rounded-2xl border border-cream/15 bg-cream/5 p-6 backdrop-blur sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-1 flex-col"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-14 w-14 place-items-center rounded-xl bg-maroon text-cream">
                    {active.id === "build" ? (
                      <BuildMuscleIcon variant="white" className="h-6 w-6" />
                    ) : (
                      <Icon name={active.icon} className="h-6 w-6" />
                    )}
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-silver-light/70">
                      Your goal
                    </p>
                    <p className="font-display text-2xl font-bold">{active.label}</p>
                  </div>
                </div>

                <dl className="mt-6 flex flex-col gap-4">
                  {detail.map((d) => (
                    <div
                      key={d.label}
                      className="flex items-start gap-3 border-t border-cream/10 pt-4 first:border-t-0 first:pt-0"
                    >
                      <Icon name={d.icon} className="mt-0.5 h-5 w-5 shrink-0 text-maroon-bright" />
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-silver-light/65">
                          {d.label}
                        </dt>
                        <dd className="text-base font-medium text-cream">{d.value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>

                <div className="mt-7 pt-1">
                  <CtaButton href={PRODUCTS_ROUTE} variant="primary" fullWidth>
                    View {active.label} meals
                  </CtaButton>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
