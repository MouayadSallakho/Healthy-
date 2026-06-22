/**
 * Simple, professional placeholder for admin module pages whose full CRUD is
 * implemented in a later phase.
 */
export function AdminPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-bold tracking-tight text-graphite sm:text-3xl">
          {title}
        </h1>
        <span className="rounded-full bg-maroon/10 px-3 py-1 text-xs font-semibold text-maroon">
          Coming next
        </span>
      </div>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-graphite/65">{description}</p>

      <div className="mt-8 rounded-2xl border border-dashed border-graphite/15 bg-white/60 p-10 text-center">
        <p className="text-sm text-graphite/55">
          Management UI for this module will be implemented in the next phase.
        </p>
      </div>
    </div>
  );
}
