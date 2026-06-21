"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { ProductFilters } from "./ProductFilters";
import { MobileFilterBar } from "./MobileFilterBar";
import { ActiveFilterChips } from "./ActiveFilterChips";
import { ProductSortBar } from "./ProductSortBar";
import { ProductGrid } from "./ProductGrid";
import { ProductEmptyState } from "./ProductEmptyState";
import { ProductDetailModal } from "./ProductDetailModal";
import {
  products,
  filterAndSortProducts,
  defaultFilters,
  INITIAL_VISIBLE_PRODUCTS,
  PRODUCTS_BATCH_SIZE,
  type ProductFilters as Filters,
  type FilterCategoryId,
  type GoalId,
  type MacroFilterId,
  type SortId,
} from "@/lib/products-content";

// Short, natural delay so the skeleton batch is perceptible (data is local, so
// there's no real network wait). Skipped under reduced motion.
const LOAD_MORE_DELAY_MS = 280;

/**
 * Client orchestrator for the menu: owns filter/search/sort state, progressive
 * rendering (visible count), and the selected product, then composes the
 * sidebar, mobile bar, toolbar, grid/empty state, and modal. Only the
 * first `INITIAL_VISIBLE_PRODUCTS` matches render; more load on scroll (via an
 * IntersectionObserver sentinel) or with the manual button.
 */
export function ProductMenuShell() {
  const reduce = useReducedMotion();
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_PRODUCTS);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadingRef = useRef(false);
  const loadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => filterAndSortProducts(products, filters), [filters]);
  const visibleProducts = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount],
  );
  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedId) ?? null,
    [selectedId],
  );

  const hasMore = visibleCount < filtered.length;
  const remaining = filtered.length - visibleCount;
  const skeletonCount = loadingMore ? Math.min(PRODUCTS_BATCH_SIZE, Math.max(remaining, 0)) : 0;

  const activeCount =
    (filters.category !== "all" ? 1 : 0) +
    filters.goals.length +
    filters.macros.length +
    (filters.query.trim() ? 1 : 0);

  // Reset progressive state — called on every filter/search/sort change so the
  // user never sees stale hidden products and always restarts at the first 10.
  const resetVisible = useCallback(() => {
    if (loadTimer.current) clearTimeout(loadTimer.current);
    loadingRef.current = false;
    setLoadingMore(false);
    setVisibleCount(INITIAL_VISIBLE_PRODUCTS);
  }, []);

  const updateFilters = useCallback(
    (updater: (f: Filters) => Filters) => {
      setFilters(updater);
      resetVisible();
    },
    [resetVisible],
  );

  const setCategory = useCallback(
    (category: FilterCategoryId) => updateFilters((f) => ({ ...f, category })),
    [updateFilters],
  );
  const setQuery = useCallback(
    (query: string) => updateFilters((f) => ({ ...f, query })),
    [updateFilters],
  );
  const setSort = useCallback(
    (sort: SortId) => updateFilters((f) => ({ ...f, sort })),
    [updateFilters],
  );
  const toggleGoal = useCallback(
    (g: GoalId) =>
      updateFilters((f) => ({
        ...f,
        goals: f.goals.includes(g) ? f.goals.filter((x) => x !== g) : [...f.goals, g],
      })),
    [updateFilters],
  );
  const toggleMacro = useCallback(
    (m: MacroFilterId) =>
      updateFilters((f) => ({
        ...f,
        macros: f.macros.includes(m) ? f.macros.filter((x) => x !== m) : [...f.macros, m],
      })),
    [updateFilters],
  );
  // Keep the chosen sort when clearing the rest.
  const clearAll = useCallback(
    () => updateFilters((f) => ({ ...defaultFilters, sort: f.sort })),
    [updateFilters],
  );

  const loadMore = useCallback(() => {
    if (loadingRef.current) return; // guard against duplicate triggers
    loadingRef.current = true;
    setLoadingMore(true);
    loadTimer.current = setTimeout(
      () => {
        setVisibleCount((c) => c + PRODUCTS_BATCH_SIZE);
        setLoadingMore(false);
        loadingRef.current = false;
      },
      reduce ? 0 : LOAD_MORE_DELAY_MS,
    );
  }, [reduce]);

  // Auto-load when the sentinel scrolls into view (only while there's more).
  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "300px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore, filters]);

  // Clean up a pending timer on unmount.
  useEffect(() => () => {
    if (loadTimer.current) clearTimeout(loadTimer.current);
  }, []);

  const revealKey = `${filters.category}|${filters.goals.join(",")}|${filters.macros.join(",")}|${filters.query}|${filters.sort}`;

  return (
    <section aria-label="Menu" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[264px_1fr] lg:gap-10">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="lg:sticky lg:top-24">
            <ProductFilters
              filters={filters}
              activeCount={activeCount}
              onCategory={setCategory}
              onToggleGoal={toggleGoal}
              onToggleMacro={toggleMacro}
              onQuery={setQuery}
              onClear={clearAll}
            />
          </div>
        </aside>

        {/* Main column */}
        <div className="min-w-0">
          {/* Mobile sticky filter bar. Sits below the header when shown and
              rises to the top when the header hides (via --chrome-offset).
              Solid bg (no backdrop-filter) so the drawer's fixed positioning
              stays relative to the viewport. */}
          <div className="sticky top-[calc(var(--top-chrome-height)*var(--chrome-offset,1))] z-30 -mx-4 border-b border-graphite/10 bg-cream px-4 py-3 transition-[top] duration-300 ease-out sm:-mx-6 sm:px-6 lg:hidden">
            <MobileFilterBar
              filters={filters}
              activeCount={activeCount}
              resultCount={filtered.length}
              onCategory={setCategory}
              onToggleGoal={toggleGoal}
              onToggleMacro={toggleMacro}
              onQuery={setQuery}
              onSort={setSort}
              onClear={clearAll}
            />
          </div>

          {/* <div className="mt-6 lg:mt-0">
            <ProductSortBar
              count={filtered.length}
              visible={visibleProducts.length}
              sort={filters.sort}
              onSort={setSort}
            >
              <ActiveFilterChips
                filters={filters}
                onCategory={setCategory}
                onToggleGoal={toggleGoal}
                onToggleMacro={toggleMacro}
                onClear={clearAll}
              />
            </ProductSortBar>
          </div> */}

          <div className="mt-6">
            {filtered.length > 0 ? (
              <>
                <ProductGrid
                  products={visibleProducts}
                  revealKey={revealKey}
                  onView={setSelectedId}
                  skeletonCount={skeletonCount}
                />

                {hasMore && (
                  <>
                    {/* Auto-load sentinel */}
                    <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
                    <div className="mt-8 flex justify-center">
                      <button
                        type="button"
                        onClick={loadMore}
                        aria-busy={loadingMore}
                        className="inline-flex min-h-12 items-center gap-2 rounded-full border border-graphite/20 bg-white px-7 text-sm font-semibold text-graphite shadow-sm transition-colors hover:border-maroon hover:text-maroon focus-visible:outline-2 focus-visible:outline-offset-[3px]"
                      >
                        {loadingMore
                          ? "Loading…"
                          : `Show ${Math.min(PRODUCTS_BATCH_SIZE, remaining)} more meals`}
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <ProductEmptyState onClear={clearAll} />
            )}
          </div>
        </div>
      </div>

      <ProductDetailModal
        product={selectedProduct}
        list={filtered}
        onClose={() => setSelectedId(null)}
        onNavigate={setSelectedId}
      />
    </section>
  );
}
