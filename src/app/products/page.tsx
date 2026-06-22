import type { Metadata } from "next";
import { BrandIntro } from "@/components/landing/BrandIntro";
import { TopPromoBar } from "@/components/landing/TopPromoBar";
import { Navbar } from "@/components/landing/Navbar";
import { HideOnScrollHeader } from "@/components/landing/HideOnScrollHeader";
import { Footer } from "@/components/landing/Footer";
import { ProductMenuHeader } from "@/components/products/ProductMenuHeader";
import { ProductMenuShell } from "@/components/products/ProductMenuShell";
import { fetchProducts, fetchCategories, fetchGoals } from "@/features/menu/menu-api";
import { buildProductQuery } from "@/features/menu/menu-query";
import { defaultMenuFilters, type MenuLookup, type MenuProduct } from "@/features/menu/menu-types";
import type { PaginationMeta } from "@/lib/api";

export const metadata: Metadata = {
  title: "Menu — Barbell Kitchen",
  description:
    "Browse Barbell Kitchen's high-protein, macro-counted meals and weekly plans. Filter by goal, search, and order fresh meals prepared inside your gym.",
};

// Live menu data changes via the admin dashboard, so render per request.
export const dynamic = "force-dynamic";

// Navbar config for this route: links point back to the landing sections; the
// current page (Menu) is marked active.
const productNavLinks = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/products" },
  { label: "Meal Plans", href: "/#plans" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "About", href: "/#inside-gym" },
  { label: "Contact", href: "/#footer" },
];

export default async function ProductsPage() {
  // Server-fetch the first page + lookups. Products failing → error state in the
  // shell (with retry); categories/goals failing degrade to empty filter lists.
  let initialProducts: MenuProduct[] = [];
  let initialPagination: PaginationMeta | null = null;
  let categories: MenuLookup[] = [];
  let goals: MenuLookup[] = [];
  let initialError = false;

  try {
    const page = await fetchProducts(buildProductQuery(defaultMenuFilters, 1));
    initialProducts = page.items;
    initialPagination = page.pagination;
  } catch {
    initialError = true;
  }

  try {
    [categories, goals] = await Promise.all([fetchCategories(), fetchGoals()]);
  } catch {
    // Filters degrade gracefully; the product grid still works.
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      {/* Shows on every entry/refresh; never reads or sets bk-intro-seen.
          Quick timing so the repeated intro doesn't nag. */}
      <BrandIntro mode="always" initialShouldShowIntro timingPreset="quick" />
      <HideOnScrollHeader fixedOnMobile>
        <TopPromoBar />
        <Navbar links={productNavLinks} logoHref="/" activeHref="/products" />
      </HideOnScrollHeader>

      <main className="flex-1">
        <ProductMenuHeader />
        <ProductMenuShell
          initialProducts={initialProducts}
          initialPagination={initialPagination}
          categories={categories}
          goals={goals}
          initialError={initialError}
        />
      </main>

      <Footer />
    </div>
  );
}
