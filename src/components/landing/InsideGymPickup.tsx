import Image from "next/image";
import { Icon } from "./icons";
import { CtaButton } from "./CtaButton";
import { Reveal } from "@/components/motion/Reveal";
import { pickup, PRODUCTS_ROUTE } from "@/lib/landing-content";

/**
 * The unique advantage: a restaurant inside the gym. Image + copy split, with
 * a small Order → Prepare → Pickup → Refuel timeline.
 */
export function InsideGymPickup() {
  return (
    <section
      id="inside-gym"
      aria-labelledby="inside-gym-heading"
      className="section-pad mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
    >
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <Reveal className="order-2 lg:order-1">
          <div className="relative overflow-hidden rounded-3xl ring-1 ring-black/10 shadow-xl shadow-black/10">
            <div className="relative aspect-[6/5] w-full">
              <Image
                src="/images/gym-counter.png"
                alt="The Barbell Kitchen pickup counter located inside the gym"
                fill
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="object-cover"
              />
            </div>
            <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-cream/90 px-4 py-2 text-sm font-semibold text-graphite shadow backdrop-blur">
              <Icon name="clock" className="h-4 w-4 text-maroon" />
              Ready in 15–20 min
            </div>
          </div>
        </Reveal>

        <div className="order-1 lg:order-2">
          <SectionEyebrow />
          <Reveal>
            <h2
              id="inside-gym-heading"
              className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-graphite sm:text-4xl lg:text-[2.75rem]"
            >
              {pickup.title}
            </h2>
          </Reveal>

          <Reveal as="ul" delay={0.08} className="mt-6 flex flex-col gap-3.5">
            {pickup.points.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-maroon/10 text-maroon">
                  <Icon name="check" className="h-4 w-4" />
                </span>
                <span className="text-base leading-relaxed text-graphite/75">
                  {point}
                </span>
              </li>
            ))}
          </Reveal>

          {/* Timeline */}
          <Reveal delay={0.12} className="mt-8">
            <ol className="flex items-center justify-between gap-1 rounded-2xl bg-offwhite p-4">
              {pickup.timeline.map((step, i) => (
                <li key={step.label} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-1.5 text-center">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-maroon shadow-sm ring-1 ring-black/5">
                      <Icon name={step.icon} className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-semibold text-graphite">
                      {step.label}
                    </span>
                  </div>
                  {i < pickup.timeline.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="mx-1 h-px flex-1 bg-gradient-to-r from-maroon/40 to-maroon/10"
                    />
                  )}
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal delay={0.16} className="mt-8">
            <CtaButton href={PRODUCTS_ROUTE} variant="primary">
              Order Your Meal
            </CtaButton>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function SectionEyebrow() {
  return (
    <Reveal>
      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-maroon">
        <span className="h-px w-6 bg-maroon/50" />
        Inside your gym
      </span>
    </Reveal>
  );
}
