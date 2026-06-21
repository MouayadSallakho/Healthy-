"use client";

import Image from "next/image";
import { formatPrice, type Product } from "@/lib/products-content";

/**
 * Compact restaurant-menu row used on mobile (`< sm`). The whole row is a
 * single accessible button that opens the existing detail modal — so it works
 * with Enter/Space and exposes the product name as its label. Macros stay in
 * the modal; the row shows only a single protein highlight to stay short.
 *
 * Only `<span>`s inside the button (no block elements) to keep valid HTML.
 */
export function ProductListItem({
  product,
  onView,
}: {
  product: Product;
  onView: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onView(product.id)}
      aria-label={`View details for ${product.name}`}
      className="group flex w-full items-stretch gap-3 rounded-2xl border border-graphite/10 bg-white p-2.5 text-left shadow-sm transition-colors duration-200 hover:border-maroon/40"
    >
      <span className="relative block h-[104px] w-[104px] shrink-0 overflow-hidden rounded-xl bg-graphite">
        <Image
          src={product.image}
          alt={`${product.name} — ${product.shortDescription}`}
          fill
          sizes="112px"
          className="object-cover"
        />
        <span className="absolute left-1.5 top-1.5 rounded-full bg-maroon px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-cream shadow">
          {product.tag}
        </span>
      </span>

      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-start justify-between gap-2">
          <span className="line-clamp-2 font-display text-[0.95rem] font-bold leading-tight tracking-tight text-graphite">
            {product.name}
          </span>
          <svg
            viewBox="0 0 24 24"
            className="mt-0.5 h-4 w-4 shrink-0 text-graphite/30 transition-colors group-hover:text-maroon"
            aria-hidden="true"
          >
            <path
              d="M9 6l6 6-6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        <span className="mt-1 line-clamp-2 text-xs leading-snug text-graphite/55">
          {product.shortDescription}
        </span>

        <span className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="font-display text-base font-bold text-graphite">
            {formatPrice(product)}
          </span>
          <span className="shrink-0 text-[0.7rem] font-semibold text-maroon">
            {product.macros.protein}g protein
          </span>
        </span>
      </span>
    </button>
  );
}

/** Loading placeholder matching the compact row shape (no layout shift). */
export function ProductListItemSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex items-stretch gap-3 rounded-2xl border border-graphite/10 bg-white p-2.5 shadow-sm"
    >
      <div className="h-[104px] w-[104px] shrink-0 rounded-xl skeleton" />
      <div className="flex min-w-0 flex-1 flex-col py-1">
        <div className="h-4 w-3/4 rounded skeleton" />
        <div className="mt-2 h-3 w-full rounded skeleton" />
        <div className="mt-1.5 h-3 w-2/3 rounded skeleton" />
        <div className="mt-auto h-4 w-16 rounded skeleton" />
      </div>
    </div>
  );
}
