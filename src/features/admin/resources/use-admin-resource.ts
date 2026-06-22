"use client";

/**
 * List/search/pagination state for an admin taxonomy resource. Generic over the
 * row type so categories/goals/ingredients share one implementation. Mutations
 * are performed by the caller (for per-status error handling) and then `reload`
 * / `afterMutation` refreshes the current page.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { PaginationMeta } from "@/lib/api";
import type { CrudApi } from "@/features/admin/api/admin-crud";

const PER_PAGE = 10;
const SEARCH_DEBOUNCE_MS = 350;

type Status = "loading" | "ready" | "error";

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export function useAdminResource<R, TBody>(api: CrudApi<R, TBody>) {
  const [items, setItems] = useState<R[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState<Status>("loading");

  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(
    async (targetPage: number, query: string) => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setStatus("loading");
      try {
        const { items: rows, pagination: meta } = await api.list(
          { page: targetPage, per_page: PER_PAGE, search: query || undefined },
          ctrl.signal,
        );
        setItems(rows);
        setPagination(meta);
        setStatus("ready");
      } catch (e) {
        if (isAbortError(e)) return;
        setStatus("error");
      }
    },
    [api],
  );

  // Debounce the search box → applied search; reset to page 1.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch((prev) => (prev === searchInput ? prev : searchInput));
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch on mount + whenever page/search change (deferred a frame).
  useEffect(() => {
    const raf = requestAnimationFrame(() => load(page, search));
    return () => cancelAnimationFrame(raf);
  }, [page, search, load]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const reload = useCallback(() => load(page, search), [load, page, search]);

  /** Refresh after a create/update/delete; step back a page if it emptied. */
  const afterMutation = useCallback(
    (removedLastRow = false) => {
      if (removedLastRow && page > 1) setPage((p) => p - 1);
      else load(page, search);
    },
    [load, page, search],
  );

  return {
    items,
    pagination,
    page,
    setPage,
    totalPages: pagination?.last_page ?? 1,
    total: pagination?.total ?? items.length,
    searchInput,
    setSearchInput,
    status,
    reload,
    afterMutation,
  };
}
