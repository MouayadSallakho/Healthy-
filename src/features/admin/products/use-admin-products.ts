"use client";

/**
 * Admin products list state: search (debounced), classic page navigation, and
 * delete. All requests carry the Bearer token; a 401 is handled globally.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { PaginationMeta } from "@/lib/api";
import {
  ADMIN_PRODUCTS_PER_PAGE,
  deleteAdminProduct,
  listAdminProducts,
  type AdminProductListItem,
} from "@/features/admin/api/admin-products";

const SEARCH_DEBOUNCE_MS = 350;

type Status = "loading" | "ready" | "error";

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export function useAdminProducts() {
  const [items, setItems] = useState<AdminProductListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState<Status>("loading");

  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async (targetPage: number, query: string) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setStatus("loading");
    try {
      const { items: rows, pagination: meta } = await listAdminProducts(
        {
          page: targetPage,
          per_page: ADMIN_PRODUCTS_PER_PAGE,
          search: query || undefined,
          sort: "newest",
        },
        ctrl.signal,
      );
      setItems(rows);
      setPagination(meta);
      setStatus("ready");
    } catch (e) {
      if (isAbortError(e)) return;
      setStatus("error");
    }
  }, []);

  // Debounce the search box → applied search; reset to page 1.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch((prev) => (prev === searchInput ? prev : searchInput));
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch on mount + whenever page/search change. Deferred a frame so the
  // setState inside `load` isn't called synchronously within the effect body.
  useEffect(() => {
    const raf = requestAnimationFrame(() => load(page, search));
    return () => cancelAnimationFrame(raf);
  }, [page, search, load]);

  // Abort any in-flight request on unmount.
  useEffect(() => () => abortRef.current?.abort(), []);

  const reload = useCallback(() => load(page, search), [load, page, search]);

  const remove = useCallback(
    async (id: number) => {
      await deleteAdminProduct(id);
      // If we just removed the last row on a page beyond the first, step back.
      const goneToEmpty = items.length === 1 && page > 1;
      if (goneToEmpty) setPage((p) => p - 1);
      else await load(page, search);
    },
    [items.length, page, search, load],
  );

  const totalPages = pagination?.last_page ?? 1;
  const total = pagination?.total ?? items.length;

  return {
    items,
    pagination,
    page,
    setPage,
    totalPages,
    total,
    searchInput,
    setSearchInput,
    status,
    reload,
    remove,
  };
}
