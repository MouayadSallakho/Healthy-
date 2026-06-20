"use client";

import type { ReactNode } from "react";
import { Icon } from "@/components/landing/icons";
import { sortOptions, type SortId } from "@/lib/products-content";

/**
 * Toolbar above the grid. Mobile shows only the compact total count — the
 * "Showing X of Y" note, active-filter summary, and Sort control are desktop
 * only (on mobile, Sort lives inside the filter drawer).
 */
export function ProductSortBar({
  count,
  visible,
  sort,
  onSort,
  children,
}: {
  /** Total filtered results. */
  count: number;
  /** Currently-rendered count (for "Showing X of Y"). */
  visible?: number;
  sort: SortId;
  onSort: (s: SortId) => void;
  /** Active-filter summary rendered next to the count. */
  children?: ReactNode;
}) {
  const showingPartial = visible !== undefined && visible < count;

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
      <div className="flex flex-1 flex-wrap items-center gap-x-3 gap-y-2">
        <p className="shrink-0 text-sm text-graphite/65" aria-live="polite">
          <span className="font-semibold text-graphite">{count}</span>{" "}
          {count === 1 ? "meal" : "meals"}
          {showingPartial && (
            <span className="hidden text-graphite/45 lg:inline">
              {" "}
              · Showing {visible} of {count}
            </span>
          )}
        </p>
        {/* Active-filter summary — desktop only (display:contents at lg so it
            participates in the toolbar flex exactly as before). */}
        <div className="hidden lg:contents">{children}</div>
      </div>

      {/* Sort — desktop only; mobile Sort is inside the filter drawer. */}
      <div className="hidden items-center gap-2 lg:flex">
        <label htmlFor="product-sort" className="text-sm font-medium text-graphite/65">
          Sort
        </label>
        <div className="relative">
          <select
            id="product-sort"
            value={sort}
            onChange={(e) => onSort(e.target.value as SortId)}
            className="min-h-10 appearance-none rounded-full border border-graphite/15 bg-white py-2 pl-4 pr-9 text-sm font-medium text-graphite focus:border-maroon focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-[3px]"
          >
            {sortOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          <Icon
            name="scale"
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite/40"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}
