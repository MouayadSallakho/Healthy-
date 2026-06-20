import { Icon } from "@/components/landing/icons";
import { productsHeader } from "@/lib/products-content";

/**
 * Compact, menu-first header for /products. Hidden on mobile (where the menu
 * is shown first, with an sr-only <h1> kept for SEO/accessibility) and shown as
 * a small branded info strip from `lg` up.
 */
export function ProductMenuHeader() {
  return (
    <>
      {/* Mobile keeps a heading for SEO/AT without the marketing block. */}
      <h1 className="sr-only lg:hidden">{productsHeader.title}</h1>

      <section
        aria-labelledby="menu-heading"
        className="hidden border-b border-graphite/10 bg-offwhite lg:block"
      >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:px-8 lg:py-6">
        <div>
          <h1
            id="menu-heading"
            className="font-display text-3xl font-bold tracking-tight text-graphite lg:text-4xl"
          >
            {productsHeader.title}
          </h1>
          <p className="mt-1 text-sm text-graphite/65 sm:text-base">
            {productsHeader.tagline}
          </p>
        </div>

        <div className="flex flex-col gap-3 lg:items-end">
          <ul className="flex flex-wrap gap-2">
            {productsHeader.pills.map((p) => (
              <li
                key={p.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-graphite/10 bg-white px-3 py-1.5 text-xs font-medium text-graphite/80 shadow-sm"
              >
                <Icon name={p.icon} className="h-3.5 w-3.5 text-maroon" aria-hidden="true" />
                {p.label}
              </li>
            ))}
          </ul>

          <p className="inline-flex w-fit items-center gap-2 rounded-full brushed-metal px-4 py-1.5 text-xs font-semibold text-graphite shadow-sm ring-1 ring-black/5">
            <PinIcon className="h-3.5 w-3.5 text-maroon" />
            {productsHeader.address}
          </p>
        </div>
      </div>
      </section>
    </>
  );
}

/** Local pin glyph (the shared icon set has no location marker). */
function PinIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 21s-6.5-5.4-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.6 12 21 12 21Z" />
      <circle cx="12" cy="10.5" r="2.4" />
    </svg>
  );
}
