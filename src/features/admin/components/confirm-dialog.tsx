"use client";

import { useEffect, useRef } from "react";

/**
 * Lightweight accessible confirmation dialog for destructive actions.
 * Escape / backdrop cancels; focus moves to the confirm button; body scroll is
 * locked while open. No animation library needed.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cancel"
        onClick={() => !loading && onCancel()}
        className="absolute inset-0 h-full w-full bg-ink/60 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="relative z-10 w-full max-w-md rounded-2xl bg-cream p-6 shadow-2xl"
      >
        <h2 id="confirm-title" className="font-display text-xl font-bold tracking-tight text-graphite">
          {title}
        </h2>
        <div className="mt-2 text-sm leading-relaxed text-graphite/70">{message}</div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex min-h-10 items-center rounded-full border border-graphite/20 px-5 text-sm font-semibold text-graphite transition-colors hover:border-graphite/40 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={loading}
            aria-busy={loading}
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-maroon px-5 text-sm font-semibold text-cream shadow-sm shadow-maroon/25 transition-colors hover:bg-maroon-bright disabled:opacity-60"
          >
            {loading ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
