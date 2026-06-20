import { Icon } from "@/components/landing/icons";

/**
 * Premium empty state shown when no products match the active filters/search.
 */
export function ProductEmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-graphite/15 bg-white/60 px-6 py-16 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-maroon/10 text-maroon">
        <Icon name="target" className="h-8 w-8" />
      </span>
      <h3 className="mt-5 font-display text-2xl font-bold tracking-tight text-graphite">
        No meals match those filters
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-graphite/60">
        Try a different category or goal, clear your search, or reset everything to see the
        full menu again.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-maroon px-6 text-sm font-semibold text-cream shadow-lg shadow-maroon/25 transition-colors hover:bg-maroon-bright"
      >
        <Icon name="spark" className="h-4 w-4" />
        Clear filters
      </button>
    </div>
  );
}
