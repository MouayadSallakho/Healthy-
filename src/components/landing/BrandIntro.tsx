"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Logo } from "./Logo";
import { Icon } from "./icons";

const SESSION_KEY = "bk-intro-seen";
const HOLD_MS = 1700; // logo lingers ~1.7s, then a 0.7s wipe → ~2.4s total
const ease = [0.22, 1, 0.36, 1] as const;

const words = ["Clean Fuel", "Inside Your Gym", "Ready in 20 Min"];

// Subtle fractal-noise grain (data URI — no extra asset/library).
const grain =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/**
 * Premium one-time Brand Reveal Intro.
 *
 * A client-only fixed overlay rendered above the (already server-rendered)
 * landing page. The page itself is never gated behind this component, so it
 * stays crawlable/accessible and is never blocked if JS fails — the overlay
 * only mounts via an effect after we confirm it should play.
 *
 * - Shows once per browser session (sessionStorage).
 * - Auto-reveals the page after ~1.5s; also skippable (button / Escape).
 * - Fully skipped when the user prefers reduced motion.
 */
export function BrandIntro() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(false);
  const skipRef = useRef<HTMLButtonElement>(null);

  // Decide whether to play, after mount (avoids hydration mismatch + no-JS block).
  useEffect(() => {
    let alreadySeen = false;
    try {
      alreadySeen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      // sessionStorage unavailable (private mode etc.) — just skip the intro.
      return;
    }

    if (alreadySeen || reduce) {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* ignore */
      }
      return;
    }

    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    // Reveal on the next frame (keeps the state update out of the effect body;
    // dark-on-dark with the hero means there's no perceptible flash).
    const raf = requestAnimationFrame(() => setShow(true));
    const t = setTimeout(() => setShow(false), HOLD_MS);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [reduce]);

  // Lock scroll + wire keyboard while the overlay is visible.
  useEffect(() => {
    if (!show) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    skipRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShow(false);
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="dialog"
          aria-label="Barbell Kitchen brand intro"
          initial={{ opacity: 1 }}
          exit={{ y: "-100%", transition: { duration: 0.7, ease } }}
          className="fixed inset-0 z-[120] flex flex-col items-center justify-center overflow-hidden gym-surface text-cream"
        >
          {/* Maroon glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(55% 45% at 50% 42%, rgba(122,30,43,0.5), transparent 65%)",
            }}
          />
          {/* Grain / noise */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
            style={{ backgroundImage: grain, backgroundSize: "140px 140px" }}
          />
          {/* Brushed-silver light sweep */}
          <motion.div
            aria-hidden="true"
            initial={{ x: "-130%" }}
            animate={{ x: "130%" }}
            transition={{ duration: 1.2, ease, delay: 0.15 }}
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-silver-light/25 to-transparent blur-md"
          />

          {/* Content */}
          <div className="relative flex flex-col items-center px-6 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.2 }}
            >
              <Logo variant="white" className="h-auto w-44 sm:w-52" priority />
            </motion.div>

            {/* Barbell line animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.55 }}
              className="mt-6 flex items-center gap-3"
            >
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, ease, delay: 0.55 }}
                className="h-px w-16 origin-right bg-gradient-to-l from-maroon-bright to-transparent sm:w-24"
              />
              <Icon name="dumbbell" className="h-5 w-5 text-silver-light" />
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, ease, delay: 0.55 }}
                className="h-px w-16 origin-left bg-gradient-to-r from-maroon-bright to-transparent sm:w-24"
              />
            </motion.div>

            {/* Brand words */}
            <motion.ul
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.12, delayChildren: 0.7 } },
              }}
              className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-[0.25em] text-silver-light/85 sm:text-sm"
            >
              {words.map((w, i) => (
                <motion.li
                  key={w}
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease } },
                  }}
                  className="flex items-center gap-x-3"
                >
                  {i > 0 && (
                    <span aria-hidden="true" className="text-maroon-bright">
                      ·
                    </span>
                  )}
                  {w}
                </motion.li>
              ))}
            </motion.ul>
          </div>

          {/* Skip */}
          <button
            ref={skipRef}
            type="button"
            onClick={() => setShow(false)}
            className="absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-6 rounded-full border border-cream/25 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-silver-light/90 transition-colors hover:border-cream/50 hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
          >
            Skip
          </button>

          {/* Metallic seam revealed during the wipe */}
          <div
            aria-hidden="true"
            className="metal-divider pointer-events-none absolute inset-x-0 bottom-0 h-[3px]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
