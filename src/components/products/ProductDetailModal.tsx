"use client";

import Image from "next/image";
import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Icon } from "@/components/landing/icons";
import { BuildMuscleIcon } from "@/components/landing/BuildMuscleIcon";
import {
  formatPrice,
  availabilityLabel,
  categoryMeta,
  goalMeta,
  type Product,
} from "@/lib/products-content";

type Props = {
  product: Product | null;
  /** Currently-filtered list, used for prev/next navigation. */
  list: Product[];
  onClose: () => void;
  onNavigate: (id: string) => void;
};

/**
 * Branded product detail dialog. Centered modal on desktop, bottom sheet on
 * mobile. Esc closes, ←/→ navigate, focus is moved in and restored, body scroll
 * is locked, and Tab is kept within the panel.
 */
export function ProductDetailModal({ product, list, onClose, onNavigate }: Props) {
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();

  const open = Boolean(product);
  const index = product ? list.findIndex((p) => p.id === product.id) : -1;
  const hasNav = index >= 0 && list.length > 1;

  const goPrev = () => {
    if (!hasNav) return;
    onNavigate(list[(index - 1 + list.length) % list.length].id);
  };
  const goNext = () => {
    if (!hasNav) return;
    onNavigate(list[(index + 1) % list.length].id);
  };

  // Horizontal swipe → navigate (mobile). Only fires when the gesture is
  // clearly horizontal so it never hijacks vertical scrolling of the content.
  const SWIPE_THRESHOLD = 50;
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || !hasNav) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) <= Math.abs(dy)) return;
    if (dx < 0) goNext(); // swipe left → next
    else goPrev(); // swipe right → previous
  };

  // Keep the latest handlers in a ref so the keyboard effect can stay bound to
  // the modal's open/close lifecycle (not re-run on every navigation).
  const actions = useRef({ prev: goPrev, next: goNext, close: onClose });
  useEffect(() => {
    actions.current = { prev: goPrev, next: goNext, close: onClose };
  });

  useEffect(() => {
    if (!open) return;

    restoreRef.current = document.activeElement as HTMLElement | null;

    // Robust body-scroll lock: pin the body at the current scroll position so
    // the background can't scroll or chain. Compensate for the scrollbar width
    // to avoid a horizontal layout jump, and restore everything on close.
    const scrollY = window.scrollY;
    const body = document.body;
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      paddingRight: body.style.paddingRight,
    };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    if (scrollbarW > 0) body.style.paddingRight = `${scrollbarW}px`;

    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        actions.current.close();
      } else if (e.key === "ArrowLeft") {
        actions.current.prev();
      } else if (e.key === "ArrowRight") {
        actions.current.next();
      } else if (e.key === "Tab") {
        // Minimal focus trap.
        const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.width = prev.width;
      body.style.paddingRight = prev.paddingRight;
      window.scrollTo(0, scrollY);
      restoreRef.current?.focus?.();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <button
            type="button"
            aria-label="Close product details"
            onClick={onClose}
            className="absolute inset-0 h-full w-full bg-ink/70 backdrop-blur-sm"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            initial={reduce ? false : { y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? undefined : { y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="relative z-10 flex max-h-[92svh] w-full flex-col overflow-hidden rounded-t-3xl bg-cream shadow-2xl sm:max-h-[88vh] sm:max-w-4xl sm:rounded-3xl"
          >
            {/* Top controls */}
            <div className="absolute right-3 top-3 z-30 flex items-center gap-2">
              {hasNav && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    aria-label="Previous product"
                    className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-graphite shadow ring-1 ring-black/5 backdrop-blur transition-colors hover:bg-white hover:text-maroon"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                      <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    aria-label="Next product"
                    className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-graphite shadow ring-1 ring-black/5 backdrop-blur transition-colors hover:bg-white hover:text-maroon"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                      <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </>
              )}
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close product details"
                className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-graphite shadow ring-1 ring-black/5 backdrop-blur transition-colors hover:bg-white hover:text-maroon"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Mobile grab handle */}
            <div className="mx-auto mt-2 h-1.5 w-12 shrink-0 rounded-full bg-graphite/15 sm:hidden" aria-hidden="true" />

            {/* Keyed by product → quick crossfade on swipe/arrow nav, and the
                scroll resets to top per product. `overscroll-contain` stops
                scroll from chaining to the locked page behind the modal. */}
            <motion.div
              key={product.id}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto overscroll-contain sm:grid-cols-2 sm:overflow-hidden"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] w-full bg-graphite sm:aspect-auto sm:h-full">
                <Image
                  src={product.image}
                  alt={`${product.name} — ${product.shortDescription}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover"
                />
                <span className="absolute left-4 top-4 rounded-full bg-maroon px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cream shadow">
                  {product.tag}
                </span>
              </div>

              {/* Details */}
              <div className="flex flex-col gap-5 p-6 sm:overflow-y-auto sm:overscroll-contain sm:p-8">
                <div>
                  <div className="flex flex-wrap gap-1.5">
                    {product.categories.map((c) => (
                      <span
                        key={c}
                        className="rounded-full bg-silver-light px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide text-graphite/70"
                      >
                        {categoryMeta[c].label}
                      </span>
                    ))}
                  </div>
                  <h2
                    id={titleId}
                    className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-graphite"
                  >
                    {product.name}
                  </h2>
                  <p id={descId} className="mt-2 text-sm leading-relaxed text-graphite/70">
                    {product.description}
                  </p>
                </div>

                {/* Macros */}
                <dl className="grid grid-cols-4 gap-2 rounded-2xl bg-offwhite p-3 text-center">
                  {[
                    { label: "Protein", value: `${product.macros.protein}g` },
                    { label: "Carbs", value: `${product.macros.carbs}g` },
                    { label: "Fat", value: `${product.macros.fat}g` },
                    { label: "Calories", value: `${product.macros.calories}` },
                  ].map((m) => (
                    <div key={m.label} className="flex flex-col">
                      <dt className="text-[0.65rem] font-medium uppercase tracking-wide text-graphite/45">
                        {m.label}
                      </dt>
                      <dd className="font-display text-lg font-bold text-maroon">{m.value}</dd>
                    </div>
                  ))}
                </dl>

                {/* Ingredients */}
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-graphite/55">
                    {product.kind === "plan" ? "What's included" : "Ingredients"}
                  </h3>
                  <ul className="flex flex-col gap-1.5">
                    {product.ingredients.map((ing) => (
                      <li key={ing} className="flex items-start gap-2 text-sm text-graphite/75">
                        <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-maroon/10 text-maroon">
                          <Icon name="check" className="h-3 w-3" />
                        </span>
                        {ing}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Goals */}
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-graphite/55">
                    Best for
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.goals.map((g) => (
                      <span
                        key={g}
                        className="inline-flex items-center gap-1.5 rounded-full bg-maroon/8 px-3 py-1 text-xs font-semibold text-maroon"
                      >
                        {g === "build" ? (
                          <BuildMuscleIcon variant="maroon" className="h-3.5 w-3.5" />
                        ) : (
                          <Icon name={goalMeta[g].icon} className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        {goalMeta[g].label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer CTA */}
                <div className="mt-auto flex items-center justify-between gap-4 border-t border-graphite/10 pt-5">
                  <div>
                    <span className="font-display text-2xl font-bold text-graphite">
                      {formatPrice(product)}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1 text-xs font-medium text-graphite/55">
                      <Icon
                        name={product.availability === "available" ? "check" : "clock"}
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                      {availabilityLabel(product.availability)}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="inline-flex min-h-12 items-center gap-2 rounded-full bg-maroon px-6 text-sm font-semibold text-cream shadow-lg shadow-maroon/25 transition-colors hover:bg-maroon-bright"
                  >
                    <Icon name="bolt" className="h-4 w-4" />
                    {product.kind === "plan" ? "Choose this plan" : "Add to order"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
