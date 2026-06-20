import { Icon } from "./icons";
import { CtaButton } from "./CtaButton";
import { Reveal } from "@/components/motion/Reveal";
import { finalCta, PRODUCTS_ROUTE } from "@/lib/landing-content";

/**
 * Strong final conversion section. Both CTAs route to the products page.
 */
export function CtaSection() {
  return (
    <section
      aria-labelledby="final-cta-heading"
      className="section-pad mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
    >
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-maroon px-6 py-14 text-center text-cream sm:px-12 sm:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 80% at 50% 0%, rgba(255,255,255,0.12), transparent 60%)",
            }}
          />
          <div className="relative mx-auto max-w-2xl">
            <h2
              id="final-cta-heading"
              className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl"
            >
              {finalCta.headline}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-silver-light/90 sm:text-lg">
              {finalCta.subtext}
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <CtaButton href={PRODUCTS_ROUTE} variant="silver" fullWidth className="sm:w-auto">
                {finalCta.primaryCta}
                <Icon name="bolt" className="h-4 w-4" />
              </CtaButton>
              <CtaButton href={PRODUCTS_ROUTE} variant="ghost" fullWidth className="sm:w-auto">
                {finalCta.secondaryCta}
              </CtaButton>
            </div>

            <ul className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              {finalCta.perks.map((perk) => (
                <li
                  key={perk.label}
                  className="flex items-center gap-2 text-sm text-silver-light/90"
                >
                  <Icon name={perk.icon} className="h-4 w-4 text-cream" />
                  {perk.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
