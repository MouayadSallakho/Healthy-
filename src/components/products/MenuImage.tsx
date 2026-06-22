import Image from "next/image";

/**
 * Product photo with a graceful fallback. Renders `next/image` (fill) when a URL
 * is present; otherwise a branded placeholder (graphite surface + faint white
 * logo) so a missing backend image never shows a broken image or shifts layout.
 *
 * The parent must be `relative` with a fixed aspect/size (the existing card,
 * list-row, and modal image containers all are).
 */
export function MenuImage({
  src,
  alt,
  sizes,
  className = "object-cover",
}: {
  src: string | null;
  alt: string;
  sizes: string;
  className?: string;
}) {
  if (src) {
    return <Image src={src} alt={alt} fill sizes={sizes} className={className} />;
  }
  return (
    <div className="absolute inset-0 grid place-items-center bg-graphite">
      <Image
        src="/images/logo-white.png"
        alt=""
        width={72}
        height={52}
        aria-hidden="true"
        className="h-9 w-auto opacity-25"
      />
      <span className="sr-only">{alt}</span>
    </div>
  );
}
