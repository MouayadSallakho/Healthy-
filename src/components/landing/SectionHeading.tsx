import { Reveal } from "@/components/motion/Reveal";

/**
 * Consistent eyebrow + heading + intro block used across sections.
 */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "center",
  tone = "dark",
  className = "",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  intro?: string;
  align?: "center" | "left";
  tone?: "dark" | "light";
  className?: string;
}) {
  const alignClasses =
    align === "center" ? "mx-auto text-center items-center" : "text-left items-start";
  const titleColor = tone === "light" ? "text-cream" : "text-graphite";
  const introColor = tone === "light" ? "text-silver-light/80" : "text-graphite/65";

  return (
    <Reveal
      className={`flex max-w-2xl flex-col gap-4 ${alignClasses} ${className}`}
    >
      {eyebrow && (
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-maroon">
          <span className="h-px w-6 bg-maroon/50" />
          {eyebrow}
        </span>
      )}
      <h2
        className={`font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem] ${titleColor}`}
      >
        {title}
      </h2>
      {intro && (
        <p className={`text-base leading-relaxed sm:text-lg ${introColor}`}>
          {intro}
        </p>
      )}
    </Reveal>
  );
}
