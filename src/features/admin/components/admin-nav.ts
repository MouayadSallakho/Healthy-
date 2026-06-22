import type { IconName } from "@/lib/landing-content";

/** Admin sidebar navigation (shared by desktop sidebar + mobile drawer). */
export const adminNavItems: { label: string; href: string; icon: IconName }[] = [
  { label: "Dashboard", href: "/admin", icon: "spark" },
  { label: "Products", href: "/admin/products", icon: "protein" },
  { label: "Categories", href: "/admin/categories", icon: "calendar" },
  { label: "Goals / Tags", href: "/admin/goals", icon: "target" },
  { label: "Ingredients", href: "/admin/ingredients", icon: "leaf" },
];

/** Active-state test: Dashboard matches `/admin` exactly; others by prefix. */
export function isNavItemActive(href: string, pathname: string): boolean {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}
