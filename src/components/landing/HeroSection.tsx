"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { CtaButton } from "./CtaButton";
import { Icon } from "./icons";
import { BuildMuscleIcon } from "./BuildMuscleIcon";
import { hero, PRODUCTS_ROUTE } from "@/lib/landing-content";
import { floatLoop } from "@/lib/landing-animations";

const ease = [0.22, 1, 0.36, 1] as const;

export function HeroSection() {
  const reduce = useReducedMotion();

  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, ease, delay },
        };

  return (
    <section
      id="home"
      aria-labelledby="hero-heading"
      className="relative overflow-hidden gym-surface text-cream lg:flex lg:flex-col lg:justify-center lg:min-h-[calc(100svh-var(--top-chrome-height))]"
    >
      {/* Maroon diagonal panel + metallic accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 80% 20%, rgba(122,30,43,0.45), transparent 60%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-1/2 h-[120%] w-[55%] -translate-y-1/2 -skew-x-12 bg-maroon/15 blur-[2px]"
      />

      <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-4 pb-16 pt-9 sm:gap-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-8 lg:py-10 xl:gap-12">
        {/* Copy */}
        <div className="max-w-xl">
          <motion.span
            {...rise(0.05)}
            className="inline-flex items-center gap-1.5 rounded-full border border-cream/20 bg-cream/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-silver-light backdrop-blur"
          >
            <BuildMuscleIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {hero.badge}
          </motion.span>

          <h1
            id="hero-heading"
            className="mt-4 font-display text-5xl font-bold leading-[0.95] tracking-tight sm:mt-5 sm:text-6xl lg:text-[3.5rem] xl:text-6xl 2xl:text-7xl"
          >
            {hero.headlineLines.map((line, i) => (
              <motion.span key={line} {...rise(0.15 + i * 0.12)} className="block">
                {i === hero.headlineLines.length - 1 ? (
                  <span className="bg-gradient-to-r from-maroon-bright via-[#c0606b] to-silver-light bg-clip-text text-transparent">
                    {line}
                  </span>
                ) : (
                  line
                )}
              </motion.span>
            ))}
          </h1>

          <motion.p
            {...rise(0.45)}
            className="mt-4 max-w-lg text-base leading-relaxed text-silver-light/85 sm:mt-5 sm:text-lg"
          >
            {hero.paragraph}
          </motion.p>

          <motion.ul
            {...rise(0.55)}
            className="mt-4 flex flex-col gap-2 text-sm text-cream/90 sm:mt-5 sm:gap-2.5 sm:text-base"
          >
            {hero.bullets.map((b) => (
              <li key={b} className="flex items-center gap-2.5">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-maroon">
                  <Icon name="check" className="h-3.5 w-3.5 text-cream" />
                </span>
                {b}
              </li>
            ))}
          </motion.ul>

          <motion.div
            {...rise(0.65)}
            className="mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row sm:items-center"
          >
            <CtaButton href={PRODUCTS_ROUTE} variant="primary" fullWidth className="sm:w-auto">
              {hero.primaryCta}
              <Icon name="bolt" className="h-4 w-4" />
            </CtaButton>
            <CtaButton href={PRODUCTS_ROUTE} variant="ghost" fullWidth className="sm:w-auto">
              {hero.secondaryCta}
            </CtaButton>
          </motion.div>

          <motion.div
            {...rise(0.78)}
            className="mt-5 flex items-center gap-2 text-sm text-silver-light/80 sm:mt-6"
          >
            <Icon name="clock" className="h-4 w-4 text-maroon-bright" />
            <span>{hero.readyNote}</span>
          </motion.div>

          {/* Social proof */}
          <motion.dl
            {...rise(0.88)}
            className="mt-6 grid max-w-md grid-cols-3 gap-4 border-t border-cream/10 pt-5"
          >
            {hero.proof.map((p) => (
              <div key={p.label}>
                <dt className="sr-only">{p.label}</dt>
                <dd className="font-display text-2xl font-bold text-cream sm:text-3xl">
                  {p.value}
                </dd>
                <p className="mt-0.5 text-xs text-silver-light/70">{p.label}</p>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Visual */}
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease, delay: 0.2 }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] ring-1 ring-cream/15 shadow-2xl shadow-black/40 sm:aspect-[5/4] lg:aspect-auto lg:h-[clamp(24rem,60svh,36rem)]">
            <Image
              src="/images/hero-meal.png"
              alt="A freshly prepared high-protein signature bowl from Barbell Kitchen"
              fill
              priority
              sizes="(max-width: 640px) 92vw, (max-width: 1024px) 80vw, 46vw"
              className="object-cover object-[50%_58%]"
            />
          </div>

          {/* Floating macro cards */}
          <FloatingCard
            className="-left-2 top-6 sm:-left-6"
            delay={0.6}
            icon={hero.floatingCards[0].icon}
            value={hero.floatingCards[0].value}
            label={hero.floatingCards[0].label}
            reduce={reduce}
          />
          <FloatingCard
            className="-right-2 top-1/3 sm:-right-5"
            delay={0.9}
            icon={hero.floatingCards[1].icon}
            value={hero.floatingCards[1].value}
            label={hero.floatingCards[1].label}
            reduce={reduce}
          />
          <FloatingCard
            className="bottom-20 -left-2 sm:-left-7"
            delay={1.2}
            icon={hero.floatingCards[2].icon}
            value={hero.floatingCards[2].value}
            label={hero.floatingCards[2].label}
            reduce={reduce}
          />
          <FloatingCard
            className="-bottom-3 right-4 sm:right-2"
            delay={1.4}
            icon={hero.floatingCards[3].icon}
            value={hero.floatingCards[3].value}
            label={hero.floatingCards[3].label}
            reduce={reduce}
          />
        </motion.div>
      </div>
    </section>
  );
}

function FloatingCard({
  className,
  delay,
  icon,
  value,
  label,
  reduce,
}: {
  className: string;
  delay: number;
  icon: Parameters<typeof Icon>[0]["name"];
  value: string;
  label: string;
  reduce: boolean | null;
}) {
  return (
    <motion.div
      variants={reduce ? undefined : floatLoop(delay)}
      initial={reduce ? false : "hidden"}
      animate={reduce ? undefined : "show"}
      className={`absolute z-10 flex items-center gap-2.5 rounded-2xl border border-white/60 bg-white/90 px-3.5 py-2.5 shadow-xl shadow-black/20 backdrop-blur ${className}`}
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-maroon/10 text-maroon">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-lg font-bold text-graphite">
          {value}
        </span>
        <span className="block text-[0.7rem] font-medium uppercase tracking-wide text-graphite/55">
          {label}
        </span>
      </span>
    </motion.div>
  );
}
