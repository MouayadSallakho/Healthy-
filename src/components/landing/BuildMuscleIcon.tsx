import Image from "next/image";

/**
 * Custom "Build Muscle" goal icon supplied as a brand SVG asset.
 *
 * Two pre-colored files (the fill lives inside the SVG, so we never force a CSS
 * color):
 *  - `maroon` → /images/goal-build-muscle.svg        (for dark / neutral surfaces)
 *  - `white`  → /images/goal-build-muscle-white.svg  (#f8f4ef, for maroon surfaces)
 *
 
 * Decorative (always paired with a visible text label) → empty alt + aria-hidden.
 * `object-contain` + the intrinsic 35×16 ratio keep it un-stretched inside
 * whatever box the caller sizes via `className`.
 */
const SOURCES = {
  maroon: "/images/goal-build-muscle.svg",
  white: "/images/goal-build-muscle-white.svg",
} as const;

export function BuildMuscleIcon({
  variant = "maroon",
  className = "",
}: {
  variant?: "maroon" | "white";
  className?: string;
}) {
  return (
    <Image
      src={SOURCES[variant]}
      alt=""
      aria-hidden="true"
      width={35}
      height={16}
      className={`object-contain ${className}`}
    />
  );
}
