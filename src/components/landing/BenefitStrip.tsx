import { Icon } from "./icons";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { benefits } from "@/lib/landing-content";

/**
 * Brushed-silver benefits strip. Maroon icons, metallic dividers on desktop,
 * wraps gracefully on mobile.
 */
export function BenefitStrip() {
  return (
    <section aria-label="Why members choose Barbell Kitchen" className="relative z-20">
      <Reveal className="relative mx-auto -mt-10 max-w-6xl px-4 sm:px-6 lg:-mt-14 lg:px-8">
        <RevealGroup className="brushed-metal grid grid-cols-2 gap-y-6 rounded-2xl px-6 py-6 shadow-xl shadow-black/10 ring-1 ring-black/5 sm:grid-cols-3 lg:grid-cols-6 lg:divide-x lg:divide-graphite/15">
          {benefits.map((b) => (
            <RevealItem
              key={b.label}
              className="flex flex-col items-center gap-2 text-center lg:px-3"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/70 text-maroon shadow-sm ring-1 ring-black/5">
                <Icon name={b.icon} className="h-6 w-6" />
              </span>
              <span className="text-sm font-semibold text-graphite">
                {b.label}
              </span>
            </RevealItem>
          ))}
        </RevealGroup>
      </Reveal>
    </section>
  );
}
