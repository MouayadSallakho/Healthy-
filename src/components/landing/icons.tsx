import type { SVGProps } from "react";
import type { IconName } from "@/lib/landing-content";

/**
 * Lightweight inline icon set (stroke-based, inherits `currentColor`).
 * Server-safe — no client directive needed. Resolve by name via <Icon />.
 */

type IconProps = SVGProps<SVGSVGElement> & { title?: string };

function Base({ title, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

const paths: Record<IconName, React.ReactNode> = {
  protein: (
    <>
      <path d="M7 3h10" />
      <path d="M8 3c0 4-2 5-2 9a6 6 0 0 0 12 0c0-4-2-5-2-9" />
      <path d="M6.5 12.5h11" />
    </>
  ),
  leaf: (
    <>
      <path d="M11 20A7 7 0 0 1 4 13c0-5 5-9 16-9 0 11-4 16-9 16Z" />
      <path d="M9 17c2.5-5 5.5-7 8-8" />
    </>
  ),
  scale: (
    <>
      <path d="M12 3v18" />
      <path d="M5 7h14" />
      <path d="M5 7 2.5 13a3 3 0 0 0 6 0L6 7" />
      <path d="M19 7l-2.5 6a3 3 0 0 0 6 0L19 7" />
      <path d="M8 21h8" />
    </>
  ),
  flame: (
    <>
      <path d="M12 3c1 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1.5.6-2.5 1.3-3.4C10 8.5 10.5 6 12 3Z" />
      <path d="M12 14a2 2 0 0 0 2-2c0 2-2 3-2 5" />
    </>
  ),
  bolt: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />,
  truck: (
    <>
      <path d="M2 6h11v9H2z" />
      <path d="M13 9h4l3 3v3h-7z" />
      <circle cx="6.5" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  dumbbell: (
    <>
      <path d="M6.5 6.5 17.5 17.5" />
      <path d="M3 8 8 3l2 2-5 5z" transform="translate(-0.5 0.5)" />
      <rect x="2.2" y="7.2" width="4" height="6" rx="1" transform="rotate(-45 4.2 10.2)" />
      <rect x="17.8" y="10.8" width="4" height="6" rx="1" transform="rotate(-45 19.8 13.8)" />
      <path d="M7 7 17 17" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  heart: (
    <path d="M12 20s-7-4.4-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 3.5C19 15.6 12 20 12 20Z" />
  ),
  check: <path d="M4 12.5 9 17.5 20 6.5" />,
  star: (
    <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.6l1-5.8L3.5 9.7l5.9-.9z" />
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 6v5c0 4.4 3 8 7 10 4-2 7-5.6 7-10V6l-7-3Z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  spark: (
    <>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="M12 8a4 4 0 0 0 4 4 4 4 0 0 0-4 4 4 4 0 0 0-4-4 4 4 0 0 0 4-4Z" />
    </>
  ),
};

export function Icon({
  name,
  className = "h-6 w-6",
  ...props
}: { name: IconName } & IconProps) {
  return (
    <Base className={className} {...props}>
      {paths[name]}
    </Base>
  );
}
