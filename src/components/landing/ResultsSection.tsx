import Image from "next/image";
import { Icon } from "./icons";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { testimonials } from "@/lib/landing-content";

/**
 * Dark, gym-inspired testimonials. Tasteful, lifestyle-focused — no medical or
 * guaranteed-result claims.
 */
export function ResultsSection() {
  return (
    <section
      id="results"
      aria-labelledby="results-heading"
      className="section-pad relative overflow-hidden gym-surface text-cream"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-maroon-bright">
            <span className="h-px w-6 bg-maroon-bright/60" />
            Member stories
          </span>
          <h2
            id="results-heading"
            className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem]"
          >
            Real People. Real Results.
          </h2>
          <p className="text-base leading-relaxed text-silver-light/80 sm:text-lg">
            Members who made clean eating part of their training routine.
          </p>
        </Reveal>

        <RevealGroup className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <RevealItem key={t.name} className="h-full">
              <figure className="flex h-full flex-col rounded-2xl border border-cream/12 bg-cream/5 p-6 backdrop-blur">
                <div
                  className="flex items-center gap-1 text-maroon-bright"
                  aria-label={`${t.rating} out of 5 stars`}
                >
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Icon
                      key={i}
                      name="star"
                      className="h-4 w-4"
                      style={{ fill: "currentColor" }}
                    />
                  ))}
                </div>

                <blockquote className="mt-4 flex-1 text-base leading-relaxed text-cream/90">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                <span className="mt-5 w-fit rounded-full bg-maroon/25 px-3 py-1 text-xs font-semibold text-silver-light">
                  {t.resultTag}
                </span>

                <figcaption className="mt-5 flex items-center gap-3 border-t border-cream/10 pt-5">
                  <span className="relative h-11 w-11 overflow-hidden rounded-full ring-1 ring-cream/20">
                    <Image
                      src={t.avatar}
                      alt={`${t.name} profile photo`}
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  </span>
                  <span>
                    <span className="block font-semibold text-cream">{t.name}</span>
                    <span className="block text-xs text-silver-light/70">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
