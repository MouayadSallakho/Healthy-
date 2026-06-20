/**
 * Loading placeholder that mirrors ProductCard's shape so appending a batch
 * causes no layout shift. Server-safe, lightweight (plain divs + the `.skeleton`
 * shimmer utility). Decorative → aria-hidden.
 */
export function ProductCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-graphite/10 bg-white shadow-sm"
    >
      {/* Image */}
      <div className="aspect-[4/3] w-full skeleton" />

      <div className="flex flex-1 flex-col p-5">
        {/* Title */}
        <div className="h-5 w-3/5 rounded skeleton" />
        {/* Description */}
        <div className="mt-2.5 h-3.5 w-full rounded skeleton" />
        <div className="mt-1.5 h-3.5 w-4/5 rounded skeleton" />

        {/* Macros */}
        <div className="mt-4 grid grid-cols-4 gap-1 rounded-xl bg-offwhite p-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className="h-2 w-8 rounded skeleton" />
              <div className="h-3.5 w-9 rounded skeleton" />
            </div>
          ))}
        </div>

        {/* Price + availability */}
        <div className="mt-4 flex items-end justify-between">
          <div className="h-6 w-16 rounded skeleton" />
          <div className="h-3.5 w-20 rounded skeleton" />
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2 pt-1">
          <div className="h-11 flex-1 rounded-full skeleton" />
          <div className="h-11 w-20 rounded-full skeleton" />
        </div>
      </div>
    </div>
  );
}
