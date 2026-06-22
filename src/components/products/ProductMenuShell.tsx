"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ProductFilters } from "./ProductFilters";
import { MobileFilterBar } from "./MobileFilterBar";
import { ProductGrid } from "./ProductGrid";
import { ProductEmptyState } from "./ProductEmptyState";
import { ProductErrorState } from "./ProductErrorState";
import { ProductDetailModal } from "./ProductDetailModal";
import { useMenuProducts } from "@/features/menu/use-menu-products";
import { PRODUCTS_PER_PAGE } from "@/features/menu/menu-query";
import type { MenuLookup, MenuProduct } from "@/features/menu/menu-types";
import type { PaginationMeta } from "@/lib/api";

const SEARCH_DEBOUNCE_MS = 350;
const LOADING_SKELETONS = 8;

type Props = {
  initialProducts: MenuProduct[];
  initialPagination: PaginationMeta | null;
  categories: MenuLookup[];
  goals: MenuLookup[];
  initialError: boolean;
};

/**
 * Client orchestrator for the live menu. Owns the selected product + the search
 * input (debounced into the data hook), and composes the sidebar, mobile bar,
 * grid/empty/error states, load-more, and the detail modal. All product data
 * comes from the backend via {@link useMenuProducts}; categories/goals are
 * server-provided. The first page is server-rendered (no fetch on mount).
 */
export function ProductMenuShell({
  initialProducts,
  initialPagination,
  categories,
  goals,
  initialError,
}: Props) {
  const {
    filters,
    products,
    isLoading,
    isLoadingMore,
    error,
    loadMoreError,
    activeCount,
    total,
    hasMore,
    remaining,
    setCategory,
    setGoal,
    toggleMacro,
    setSort,
    setSearch,
    clearAll,
    loadMore,
    retry,
  } = useMenuProducts({ initialProducts, initialPagination, initialError });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Debounce the search input into the applied filter.
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput, setSearch]);

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
  }, [hasMore, loadMore]);

  const handleClear = () => {
    setSearchInput("");
    clearAll();
  };

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedId) ?? null,
    [products, selectedId],
  );

  const revealKey = `${filters.categoryId}|${filters.goalId}|${filters.macros.join(",")}|${filters.query}|${filters.sort}`;

  return (
    <section aria-label="Menu" className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[264px_1fr] lg:gap-10">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="lg:sticky lg:top-24">
            <ProductFilters
              filters={filters}
              categories={categories}
              goals={goals}
              activeCount={activeCount}
              query={searchInput}
              onCategory={setCategory}
              onGoal={setGoal}
              onToggleMacro={toggleMacro}
              onQuery={setSearchInput}
              onClear={handleClear}
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
              categories={categories}
              goals={goals}
              activeCount={activeCount}
              resultCount={total}
              query={searchInput}
              onCategory={setCategory}
              onGoal={setGoal}
              onToggleMacro={toggleMacro}
              onQuery={setSearchInput}
              onSort={setSort}
              onClear={handleClear}
            />
          </div>

          <div className="mt-3 sm:mt-6">
            {error ? (
              <ProductErrorState onRetry={retry} />
            ) : isLoading ? (
              <ProductGrid
                products={[]}
                revealKey="loading"
                onView={setSelectedId}
                skeletonCount={LOADING_SKELETONS}
              />
            ) : products.length > 0 ? (
              <>
                <ProductGrid
                  products={products}
                  revealKey={revealKey}
                  onView={setSelectedId}
                  skeletonCount={isLoadingMore ? Math.min(PRODUCTS_PER_PAGE, remaining) : 0}
                />

                {hasMore && (
                  <>
                    {/* Auto-load sentinel */}
                    <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
                    <div className="mt-8 flex justify-center">
                      <button
                        type="button"
                        onClick={loadMore}
                        aria-busy={isLoadingMore}
                        className="inline-flex min-h-12 items-center gap-2 rounded-full border border-graphite/20 bg-white px-7 text-sm font-semibold text-graphite shadow-sm transition-colors hover:border-maroon hover:text-maroon focus-visible:outline-2 focus-visible:outline-offset-[3px]"
                      >
                        {isLoadingMore
                          ? "Loading…"
                          : `Show ${Math.min(PRODUCTS_PER_PAGE, remaining)} more meals`}
                      </button>
                    </div>
                  </>
                )}

                {loadMoreError && (
                  <p className="mt-4 text-center text-sm text-graphite/60">
                    Couldn&apos;t load more meals.{" "}
                    <button
                      type="button"
                      onClick={loadMore}
                      className="font-semibold text-maroon underline-offset-2 hover:underline"
                    >
                      Try again
                    </button>
                  </p>
                )}
              </>
            ) : (
              <ProductEmptyState onClear={handleClear} />
            )}
          </div>
        </div>
      </div>

      <ProductDetailModal
        product={selectedProduct}
        list={products}
        onClose={() => setSelectedId(null)}
        onNavigate={setSelectedId}
      />
    </section>
  );
}
