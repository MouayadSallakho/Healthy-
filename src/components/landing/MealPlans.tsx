import { Icon } from "./icons";
import { CtaButton } from "./CtaButton";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { mealPlans, planPerks, PRODUCTS_ROUTE } from "@/lib/landing-content";

/**
 * Premium maroon meal-plan section. Cards reveal with stagger; the featured
 * plan is visually elevated. Every CTA routes to the products page.
 */
export function MealPlans() {
  return (
    <section
      id="plans"
      aria-labelledby="plans-heading"
      className="section-pad relative overflow-hidden bg-maroon text-cream"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-silver-light">
            <span className="h-px w-6 bg-cream/40" />
            Weekly meal plans
          </span>
          <h2
            id="plans-heading"
            className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem]"
          >
            Plans that match your training
          </h2>
          <p className="text-base leading-relaxed text-silver-light/85 sm:text-lg">
            Pick a goal-based plan, prepared fresh and ready inside your gym —
            flexible week to week.
          </p>
        </Reveal>

        <RevealGroup className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {mealPlans.map((plan) => (
            <RevealItem key={plan.id} className="h-full">
              <div
                className={`flex h-full flex-col rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1.5 ${
                  plan.featured
                    ? "bg-cream text-graphite shadow-2xl ring-2 ring-silver-light"
                    : "bg-maroon-dark/60 text-cream ring-1 ring-cream/15 backdrop-blur"
                }`}
              >
                {plan.featured && (
                  <span className="mb-3 w-fit rounded-full bg-maroon px-3 py-1 text-[0.7rem] font-bold uppercase tracking-widest text-cream">
                    Most popular
                  </span>
                )}
                <span
                  className={`grid h-12 w-12 place-items-center rounded-xl ${
                    plan.featured ? "bg-maroon/10 text-maroon" : "bg-cream/10 text-silver-light"
                  }`}
                >
                  <Icon name={plan.icon} className="h-6 w-6" />
                </span>

                <h3 className="mt-4 font-display text-2xl font-bold tracking-tight">
                  {plan.name}
                </h3>
                <p
                  className={`mt-1 text-xs font-semibold uppercase tracking-wide ${
                    plan.featured ? "text-maroon" : "text-silver-light/80"
                  }`}
                >
                  {plan.bestFor}
                </p>
                <p
                  className={`mt-3 text-sm leading-relaxed ${
                    plan.featured ? "text-graphite/65" : "text-cream/80"
                  }`}
                >
                  {plan.description}
                </p>

                <div className="mt-5 flex items-end gap-1">
                  <span className="font-display text-3xl font-bold">{plan.price}</span>
                  <span
                    className={`pb-1 text-sm ${
                      plan.featured ? "text-graphite/55" : "text-cream/70"
                    }`}
                  >
                    {plan.cadence}
                  </span>
                </div>
                <p
                  className={`mt-1 text-sm ${
                    plan.featured ? "text-graphite/65" : "text-cream/75"
                  }`}
                >
                  {plan.mealsPerDay}
                </p>

                <div className="mt-6 pt-2">
                  <CtaButton
                    href={PRODUCTS_ROUTE}
                    variant={plan.featured ? "primary" : "silver"}
                    size="md"
                    fullWidth
                  >
                    Choose {plan.name.split(" ")[0]}
                  </CtaButton>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal
          as="ul"
          delay={0.1}
          className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
        >
          {planPerks.map((perk) => (
            <li key={perk.label} className="flex items-center gap-2 text-sm text-silver-light/90">
              <Icon name={perk.icon} className="h-4 w-4 text-cream" />
              {perk.label}
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
