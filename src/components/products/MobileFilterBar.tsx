"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Icon } from "@/components/landing/icons";
import { FilterChip, SearchField } from "./ProductFilters";
import { macroFilters, sortOptions, type MacroFilterId, type SortId } from "@/lib/products-content";
import type { MenuFilters, MenuLookup } from "@/features/menu/menu-types";

type Props = {
  filters: MenuFilters;
  categories: MenuLookup[];
  goals: MenuLookup[];
  activeCount: number;
  resultCount: number;
  query: string;
  onCategory: (id: number | null) => void;
  onGoal: (id: number | null) => void;
  onToggleMacro: (m: MacroFilterId) => void;
  onQuery: (q: string) => void;
  onSort: (s: SortId) => void;
  onClear: () => void;
};

/**
 * Mobile / tablet filter controls (shown below lg):
 * - Full-width search.
 * - A clearly-scrollable category strip (fade edges, scroll-snap, hidden
 *   scrollbar) that centers the selected chip. "All" first.
 * - A "Filters" button opening an accessible bottom-sheet drawer (Sort, Category,
 *   Goal, Macros) with X / backdrop / Escape close and body-scroll lock.
 *
 * Categories/goals come from the live API; goal is single-select.
 */
export function MobileFilterBar({
  filters,
  categories,
  goals,
  activeCount,
  resultCount,
  query,
  onCategory,
  onGoal,
  onToggleMacro,
  onQuery,
  onSort,
  onClear,
}: Props) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  const selectedCat = filters.categoryId === null ? "all" : String(filters.categoryId);

  // Keep the selected category chip in view (centered).
  useEffect(() => {
    const el = scrollerRef.current?.querySelector<HTMLElement>(`[data-cat="${selectedCat}"]`);
    el?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: reduce ? "auto" : "smooth",
    });
  }, [selectedCat, reduce]);

  // Drawer: Escape close, body-scroll lock, focus in/restore.
  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      restoreRef.current?.focus?.();
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      {/* Categories first — clearly scrollable */}
      <p className="mb-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-graphite/45">
        Categories
      </p>
      <div className="relative">
        <div
          ref={scrollerRef}
          role="group"
          aria-label="Filter by category"
          className="flex snap-x gap-2 overflow-x-auto scroll-px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div data-cat="all" className="shrink-0 snap-center">
            <FilterChip label="All" active={filters.categoryId === null} onClick={() => onCategory(null)} />
          </div>
          {categories.map((c) => (
            <div key={c.id} data-cat={c.id} className="shrink-0 snap-center">
              <FilterChip
                label={c.name}
                active={filters.categoryId === c.id}
                onClick={() => onCategory(c.id)}
              />
            </div>
          ))}
        </div>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-cream to-transparent"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-cream to-transparent"
        />
      </div>

      {/* Search + Filters on one row, directly under the categories */}
      <div className="mt-3 flex items-center gap-2">
        <SearchField value={query} onChange={onQuery} className="min-w-0 flex-1" />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          className="relative inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-graphite/15 bg-white px-4 text-sm font-medium text-graphite/80"
        >
          <Icon name="scale" className="h-4 w-4" aria-hidden="true" />
          Filters
          {activeCount > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-maroon px-1 text-[0.65rem] font-bold text-cream">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Bottom-sheet drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-end justify-center"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <button
              type="button"
              aria-label="Close filters"
              onClick={() => setOpen(false)}
              className="absolute inset-0 h-full w-full bg-ink/70 backdrop-blur-sm"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              initial={reduce ? false : { y: "100%" }}
              animate={{ y: 0 }}
              exit={reduce ? undefined : { y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="relative z-10 flex max-h-[85svh] w-full flex-col rounded-t-3xl bg-cream shadow-2xl"
            >
              {/* Header */}
              <div className="shrink-0 px-5 pt-3">
                <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-graphite/15" aria-hidden="true" />
                <div className="flex items-center justify-between">
                  <h2 id={titleId} className="font-display text-xl font-bold tracking-tight text-graphite">
                    Filters
                  </h2>
                  <button
                    ref={closeRef}
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close filters"
                    className="grid h-10 w-10 place-items-center rounded-full border border-graphite/15 text-graphite transition-colors hover:bg-maroon/8 hover:text-maroon"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                      <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Scrollable body */}
              <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-5 py-5">
                <FilterSection title="Sort">
                  {sortOptions.map((o) => (
                    <FilterChip
                      key={o.id}
                      label={o.label}
                      active={filters.sort === o.id}
                      onClick={() => onSort(o.id)}
                    />
                  ))}
                </FilterSection>

                <FilterSection title="Category">
                  <FilterChip label="All" active={filters.categoryId === null} onClick={() => onCategory(null)} />
                  {categories.map((c) => (
                    <FilterChip
                      key={c.id}
                      label={c.name}
                      active={filters.categoryId === c.id}
                      onClick={() => onCategory(c.id)}
                    />
                  ))}
                </FilterSection>

                {goals.length > 0 && (
                  <FilterSection title="Goal">
                    {goals.map((g) => (
                      <FilterChip
                        key={g.id}
                        label={g.name}
                        active={filters.goalId === g.id}
                        onClick={() => onGoal(g.id)}
                      />
                    ))}
                  </FilterSection>
                )}

                <FilterSection title="Macros">
                  {macroFilters.map((m) => (
                    <FilterChip
                      key={m.id}
                      label={m.label}
                      active={filters.macros.includes(m.id)}
                      onClick={() => onToggleMacro(m.id)}
                      iconNode={<Icon name={m.icon} className="h-4 w-4" aria-hidden="true" />}
                    />
                  ))}
                </FilterSection>
              </div>

              {/* Footer */}
              <div className="flex shrink-0 items-center justify-between gap-4 border-t border-graphite/10 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <button
                  type="button"
                  onClick={onClear}
                  disabled={activeCount === 0}
                  className="text-sm font-semibold text-graphite/60 underline-offset-2 enabled:hover:text-maroon enabled:hover:underline disabled:opacity-40"
                >
                  Clear all
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex min-h-12 items-center gap-2 rounded-full bg-maroon px-6 text-sm font-semibold text-cream shadow-lg shadow-maroon/25 transition-colors hover:bg-maroon-bright"
                >
                  View {resultCount} {resultCount === 1 ? "meal" : "meals"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-graphite/55">
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
