"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/landing/icons";
import { isApiError } from "@/lib/api";
import { ConfirmDialog } from "@/features/admin/components/confirm-dialog";
import { useToast } from "@/features/admin/components/toast-provider";
import { useAdminProducts } from "@/features/admin/products/use-admin-products";
import type { AdminProductListItem } from "@/features/admin/api/admin-products";

function priceLabel(value: number): string {
  return `$${Number(value).toFixed(2)}`;
}

function AvailabilityPill({ available }: { available: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        available ? "bg-maroon/10 text-maroon" : "bg-graphite/10 text-graphite/55"
      }`}
    >
      <Icon name={available ? "check" : "clock"} className="h-3 w-3" aria-hidden="true" />
      {available ? "Available" : "Unavailable"}
    </span>
  );
}

export default function AdminProductsPage() {
  const {
    items,
    page,
    setPage,
    totalPages,
    total,
    searchInput,
    setSearchInput,
    status,
    reload,
    remove,
  } = useAdminProducts();

  const toast = useToast();
  const [pendingDelete, setPendingDelete] = useState<AdminProductListItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    if (!pendingDelete) return;
    const name = pendingDelete.title;
    setDeleting(true);
    try {
      await remove(pendingDelete.id);
      setPendingDelete(null);
      toast.success(`${name} deleted.`);
    } catch (e) {
      setPendingDelete(null);
      if (isApiError(e)) {
        if (e.isNotFound) {
          reload();
          toast.info(`${name} was already removed.`);
        } else if (e.isConflict) {
          toast.warning("This product can't be deleted because it's in use.");
        } else if (e.isForbidden) {
          toast.error("You don't have permission to delete products.");
        } else {
          toast.error("Couldn't delete the product. Please try again.");
        }
      } else {
        toast.error("Couldn't delete the product. Please try again.");
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-graphite sm:text-3xl">
            Products
          </h1>
          <p className="mt-1 text-sm text-graphite/60">
            {status === "ready" ? `${total} ${total === 1 ? "product" : "products"}` : "Manage menu products"}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-maroon px-5 text-sm font-semibold text-cream shadow-sm shadow-maroon/25 transition-colors hover:bg-maroon-bright"
        >
          <Icon name="spark" className="h-4 w-4" aria-hidden="true" />
          New product
        </Link>
      </div>

      {/* Search */}
      <div className="relative mt-5 max-w-md">
        <Icon
          name="target"
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite/40"
          aria-hidden="true"
        />
        <label htmlFor="admin-product-search" className="sr-only">
          Search products
        </label>
        <input
          id="admin-product-search"
          type="search"
          value={searchInput}
          maxLength={100}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search products…"
          className="min-h-11 w-full rounded-full border border-graphite/15 bg-white pl-10 pr-4 text-sm text-graphite placeholder:text-graphite/40 focus:border-maroon focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-[3px]"
        />
      </div>

      {/* Content states */}
      <div className="mt-5">
        {status === "loading" ? (
          <ListSkeleton />
        ) : status === "error" ? (
          <ErrorBlock onRetry={reload} />
        ) : items.length === 0 ? (
          <EmptyBlock searching={searchInput.trim().length > 0} />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-2xl border border-graphite/10 bg-white shadow-sm lg:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-graphite/10 bg-offwhite/60 text-xs font-semibold uppercase tracking-wide text-graphite/55">
                  <tr>
                    <th className="px-5 py-3">Product</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Price</th>
                    <th className="px-5 py-3">Macros</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-graphite/8">
                  {items.map((p) => (
                    <tr key={p.id} className="transition-colors hover:bg-offwhite/40">
                      <td className="px-5 py-3">
                        <span className="font-semibold text-graphite">{p.title}</span>
                      </td>
                      <td className="px-5 py-3 text-graphite/70">{p.category?.name ?? "—"}</td>
                      <td className="px-5 py-3 font-display font-bold text-graphite">{priceLabel(p.price)}</td>
                      <td className="px-5 py-3 text-graphite/70">
                        {p.nutrition.protein}g protein · {p.nutrition.calories} cal
                      </td>
                      <td className="px-5 py-3">
                        <AvailabilityPill available={p.is_available} />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            className="inline-flex min-h-9 items-center rounded-full border border-graphite/20 px-3.5 text-xs font-semibold text-graphite transition-colors hover:border-maroon hover:text-maroon"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => setPendingDelete(p)}
                            className="inline-flex min-h-9 items-center rounded-full border border-graphite/20 px-3.5 text-xs font-semibold text-graphite transition-colors hover:border-maroon hover:bg-maroon hover:text-cream"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="flex flex-col gap-3 lg:hidden">
              {items.map((p) => (
                <li key={p.id} className="rounded-2xl border border-graphite/10 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-base font-bold leading-tight text-graphite">{p.title}</p>
                      <p className="mt-0.5 text-xs text-graphite/55">{p.category?.name ?? "—"}</p>
                    </div>
                    <span className="font-display text-base font-bold text-graphite">{priceLabel(p.price)}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-graphite/60">
                    <span>{p.nutrition.protein}g protein · {p.nutrition.calories} cal</span>
                    <AvailabilityPill available={p.is_available} />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="inline-flex min-h-10 flex-1 items-center justify-center rounded-full border border-graphite/20 text-sm font-semibold text-graphite transition-colors hover:border-maroon hover:text-maroon"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(p)}
                      className="inline-flex min-h-10 flex-1 items-center justify-center rounded-full border border-graphite/20 text-sm font-semibold text-graphite transition-colors hover:border-maroon hover:bg-maroon hover:text-cream"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="inline-flex min-h-10 items-center rounded-full border border-graphite/20 px-4 text-sm font-semibold text-graphite transition-colors hover:border-maroon hover:text-maroon disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-graphite/60">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="inline-flex min-h-10 items-center rounded-full border border-graphite/20 px-4 text-sm font-semibold text-graphite transition-colors hover:border-maroon hover:text-maroon disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete product"
        message={
          <>
            Delete <span className="font-semibold text-graphite">{pendingDelete?.title}</span>? This action
            cannot be undone.
          </>
        }
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (!deleting) setPendingDelete(null);
        }}
      />
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-2xl border border-graphite/10 bg-white p-4 shadow-sm">
          <div className="h-4 w-48 rounded skeleton" />
          <div className="ml-auto h-4 w-16 rounded skeleton" />
          <div className="h-8 w-20 rounded-full skeleton" />
        </div>
      ))}
    </div>
  );
}

function ErrorBlock({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-graphite/15 bg-white/60 px-6 py-14 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-maroon/10 text-maroon">
        <Icon name="bolt" className="h-7 w-7" />
      </span>
      <h3 className="mt-4 font-display text-xl font-bold text-graphite">Couldn&apos;t load products</h3>
      <p className="mt-1 max-w-sm text-sm text-graphite/60">
        There was a problem reaching the server. Please try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-maroon px-6 text-sm font-semibold text-cream transition-colors hover:bg-maroon-bright"
      >
        Try again
      </button>
    </div>
  );
}

function EmptyBlock({ searching }: { searching: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-graphite/15 bg-white/60 px-6 py-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-maroon/10 text-maroon">
        <Icon name="protein" className="h-7 w-7" />
      </span>
      <h3 className="mt-4 font-display text-xl font-bold text-graphite">
        {searching ? "No products match your search" : "No products yet"}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-graphite/60">
        {searching ? "Try a different search term." : "Create your first product to get started."}
      </p>
      {!searching && (
        <Link
          href="/admin/products/new"
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-maroon px-6 text-sm font-semibold text-cream transition-colors hover:bg-maroon-bright"
        >
          <Icon name="spark" className="h-4 w-4" aria-hidden="true" />
          New product
        </Link>
      )}
    </div>
  );
}
