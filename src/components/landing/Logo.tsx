import Image from "next/image";

/**
 * Brand logo. Two real assets, picked by `variant`:
 *
 * - `red`   → /images/logo-red.svg   (maroon mark, for light / brushed-silver surfaces)
 * - `white` → /images/logo-white.png (white mark, for dark surfaces)
 *
 * Both assets are near-square (~1.4:1), so callers size by HEIGHT in tight
 * spots (navbar) and by WIDTH where there's room (intro/footer). `object-contain`
 * guarantees the logo is never stretched, and the intrinsic width/height reserve
 * the correct aspect ratio to avoid layout shift.
 */
const LOGOS = {
  red: { src: "/images/logo-red.svg", width: 196, height: 140 },
  white: { src: "/images/logo-white.png", width: 351, height: 251 },
} as const;

export function Logo({
  variant = "red",
  className = "h-10 w-auto",
  priority = false,
}: {
  variant?: "red" | "white";
  /** Sizing/utility classes — provide exactly one of height or width as fixed. */
  className?: string;
  priority?: boolean;
}) {
  const { src, width, height } = LOGOS[variant];
  return (
    <Image
      src={src}
      alt="Barbell Kitchen logo"
      width={width}
      height={height}
      priority={priority}
      className={`object-contain ${className}`}
    />
  );
}
