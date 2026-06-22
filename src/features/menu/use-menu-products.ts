"use client";

/**
 * Client data hook for the public menu. Owns filter state + the accumulated
 * product list + pagination, and fetches from the live API on every filter
 * change (page 1, replace) and on "load more" (next page, append). The first
 * page is seeded from the server-rendered props, so no fetch fires on mount.
 *
 * Stale requests are aborted on rapid filter changes. Search debouncing is done
 * by the caller (the shell) before calling `setSearch`.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { PaginationMeta } from "@/lib/api";
import type { MacroFilterId, SortId } from "@/lib/products-content";
import { fetchProducts } from "./menu-api";
import { buildProductQuery } from "./menu-query";
import { defaultMenuFilters, type MenuFilters, type MenuProduct } from "./menu-types";

type Args = {
  initialProducts: MenuProduct[];
  initialPagination: PaginationMeta | null;
  initialError: boolean;
};

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export function useMenuProducts({ initialProducts, initialPagination, initialError }: Args) {
  const [filters, setFilters] = useState<MenuFilters>(defaultMenuFilters);
  const [products, setProducts] = useState<MenuProduct[]>(initialProducts);
  const [pagination, setPagination] = useState<PaginationMeta | null>(initialPagination);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(initialError);
  const [loadMoreError, setLoadMoreError] = useState(false);

  const didMount = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const runFetch = useCallback(async (next: MenuFilters) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setIsLoading(true);
    setError(false);
    setLoadMoreError(false);
    try {
      const { items, pagination: meta } = await fetchProducts(buildProductQuery(next, 1), ctrl.signal);
      setProducts(items);
      setPagination(meta);
    } catch (e) {
      if (isAbortError(e)) return;
      setError(true);
    } finally {
      if (abortRef.current === ctrl) setIsLoading(false);
    }
  }, []);

  // Refetch (page 1) whenever filters change. Skips the first run since the
  // server already provided the default page.
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    runFetch(filters);
  }, [filters, runFetch]);

  // Abort any in-flight request on unmount.
  useEffect(() => () => abortRef.current?.abort(), []);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !pagination || pagination.current_page >= pagination.last_page) return;
    const nextPage = pagination.current_page + 1;
    setIsLoadingMore(true);
    setLoadMoreError(false);
    try {
      const { items, pagination: meta } = await fetchProducts(buildProductQuery(filters, nextPage));
      setProducts((prev) => [...prev, ...items]);
      setPagination(meta);
    } catch {
      setLoadMoreError(true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [filters, pagination, isLoadingMore]);

  const retry = useCallback(() => runFetch(filters), [runFetch, filters]);

  /* Idempotent setters (return same state when unchanged → no spurious fetch). */
  const setCategory = useCallback(
    (categoryId: number | null) =>
      setFilters((f) => (f.categoryId === categoryId ? f : { ...f, categoryId })),
    [],
  );
  const setGoal = useCallback(
    (goalId: number | null) =>
      setFilters((f) => ({ ...f, goalId: f.goalId === goalId ? null : goalId })),
    [],
  );
  const toggleMacro = useCallback(
    (m: MacroFilterId) =>
      setFilters((f) => ({
        ...f,
        macros: f.macros.includes(m) ? f.macros.filter((x) => x !== m) : [...f.macros, m],
      })),
    [],
  );
  const setSort = useCallback(
    (sort: SortId) => setFilters((f) => (f.sort === sort ? f : { ...f, sort })),
    [],
  );
  const setSearch = useCallback(
    (query: string) => setFilters((f) => (f.query === query ? f : { ...f, query })),
    [],
  );
  const clearAll = useCallback(
    () => setFilters((f) => ({ ...defaultMenuFilters, sort: f.sort })),
    [],
  );

  const activeCount =
    (filters.categoryId !== null ? 1 : 0) +
    (filters.goalId !== null ? 1 : 0) +
    filters.macros.length +
    (filters.query.trim() ? 1 : 0);

  const total = pagination?.total ?? products.length;
  const hasMore = pagination ? pagination.current_page < pagination.last_page : false;
  const remaining = pagination ? Math.max(pagination.total - products.length, 0) : 0;

  return {
    filters,
    products,
    pagination,
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
  };
}
