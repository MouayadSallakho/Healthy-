import Link from "next/link";
import { Icon } from "@/components/landing/icons";
import type { IconName } from "@/lib/landing-content";

const modules: { href: string; label: string; icon: IconName; desc: string }[] = [
  {
    href: "/admin/products",
    label: "Products",
    icon: "protein",
    desc: "Create and manage menu products — macros, pricing, availability, and images.",
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: "calendar",
    desc: "Organize the menu into categories used by the public filters.",
  },
  {
    href: "/admin/goals",
    label: "Goals / Tags",
    icon: "target",
    desc: "Manage goals and badges shown on product cards and filters.",
  },
  {
    href: "/admin/ingredients",
    label: "Ingredients",
    icon: "leaf",
    desc: "Maintain the ingredient list products are built from.",
  },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight text-graphite sm:text-3xl">
        Welcome to the dashboard
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-graphite/65">
        Manage the Barbell Kitchen menu from here. Choose a module to get started — full
        create / edit / delete tools are implemented in the next phase.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {modules.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="group flex items-start gap-4 rounded-2xl border border-graphite/10 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-maroon/40 hover:shadow-md"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-maroon/10 text-maroon">
              <Icon name={m.icon} className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-1.5 font-display text-lg font-bold tracking-tight text-graphite group-hover:text-maroon">
                {m.label}
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-graphite/60">{m.desc}</span>
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-8 rounded-2xl border border-dashed border-graphite/15 bg-white/60 px-5 py-4 text-sm text-graphite/55">
        Note: CRUD management (products, categories, goals, ingredients) and image upload will
        be implemented in the next phase. This dashboard currently confirms authentication and
        provides navigation.
      </p>
    </div>
  );
}
