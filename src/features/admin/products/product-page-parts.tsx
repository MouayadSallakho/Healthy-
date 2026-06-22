"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/landing/icons";

/** Shared header + banners + container for the create/edit product pages. */
export function AdminFormShell({
  title,
  backHref,
  serverError,
  successMessage,
  children,
}: {
  title: string;
  backHref: string;
  serverError?: string | null;
  successMessage?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-graphite/60 transition-colors hover:text-maroon"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to products
      </Link>

      <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-graphite sm:text-3xl">
        {title}
      </h1>

      {successMessage && (
        <p
          role="status"
          className="mt-4 flex items-center gap-2 rounded-xl border border-maroon/20 bg-maroon/8 px-4 py-3 text-sm font-medium text-maroon"
        >
          <Icon name="check" className="h-4 w-4 shrink-0" aria-hidden="true" />
          {successMessage}
        </p>
      )}

      {serverError && (
        <p
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-xl border border-maroon/20 bg-maroon/8 px-4 py-3 text-sm text-maroon"
        >
          <Icon name="bolt" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{serverError}</span>
        </p>
      )}

      <div className="mt-5">{children}</div>
    </div>
  );
}

export function OptionsLoading() {
  return (
    <div className="grid place-items-center rounded-2xl border border-graphite/10 bg-white py-20">
      <div className="flex flex-col items-center gap-3 text-graphite/55">
        <span
          className="h-8 w-8 animate-spin rounded-full border-2 border-maroon/25 border-t-maroon"
          aria-hidden="true"
        />
        <span className="text-sm font-medium">Loading form…</span>
      </div>
    </div>
  );
}

export function OptionsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-graphite/15 bg-white/60 px-6 py-16 text-center">
      <h3 className="font-display text-xl font-bold text-graphite">Couldn&apos;t load form data</h3>
      <p className="mt-1 max-w-sm text-sm text-graphite/60">
        We couldn&apos;t load categories, goals, and ingredients. The form is disabled until this loads.
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

export function ProductNotFound() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-graphite/60 transition-colors hover:text-maroon"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to products
      </Link>
      <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-graphite/15 bg-white/60 px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-graphite">Product not found</h1>
        <p className="mt-1 max-w-sm text-sm text-graphite/60">
          This product may have been deleted or the link is incorrect.
        </p>
        <Link
          href="/admin/products"
          className="mt-5 inline-flex min-h-11 items-center rounded-full bg-maroon px-6 text-sm font-semibold text-cream transition-colors hover:bg-maroon-bright"
        >
          Back to products
        </Link>
      </div>
    </div>
  );
}
