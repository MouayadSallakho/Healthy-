import { Icon } from "@/components/landing/icons";

/**
 * Shown when the menu fails to load (network / server error). Branded, with a
 * working Retry button. Distinct from the empty state (no matching filters).
 */
export function ProductErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-graphite/15 bg-white/60 px-6 py-16 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-maroon/10 text-maroon">
        <Icon name="bolt" className="h-8 w-8" />
      </span>
      <h3 className="mt-5 font-display text-2xl font-bold tracking-tight text-graphite">
        We couldn&apos;t load the menu
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-graphite/60">
        Something went wrong reaching the kitchen. Please check your connection and try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-maroon px-6 text-sm font-semibold text-cream shadow-lg shadow-maroon/25 transition-colors hover:bg-maroon-bright"
      >
        <Icon name="spark" className="h-4 w-4" />
        Try again
      </button>
    </div>
  );
}
