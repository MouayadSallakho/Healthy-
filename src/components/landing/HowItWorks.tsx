import { Icon } from "./icons";
import { SectionHeading } from "./SectionHeading";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { howItWorks } from "@/lib/landing-content";

/**
 * Three-step process. Connected horizontally on desktop, stacked on mobile.
 */
export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="section-pad bg-silver-light/40"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title={<span id="how-heading">Three steps to refuel</span>}
          intro="From craving to recovery in minutes — no leaving the gym required."
        />

        <RevealGroup className="relative mt-14 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
          {/* connector line (desktop) */}
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-7 hidden h-px md:block"
          >
            <div className="mx-[16%] h-full bg-gradient-to-r from-transparent via-maroon/30 to-transparent" />
          </div>

          {howItWorks.map((step, i) => (
            <RevealItem key={step.title} className="relative flex flex-col items-center text-center">
              <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-maroon text-cream shadow-lg shadow-maroon/25">
                <Icon name={step.icon} className="h-7 w-7" />
                <span className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-cream font-display text-sm font-bold text-maroon shadow ring-1 ring-black/5">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-5 font-display text-xl font-bold tracking-tight text-graphite">
                {step.title}
              </h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-graphite/65">
                {step.text}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
