import type { Metadata } from "next";
import { TopPromoBar } from "@/components/landing/TopPromoBar";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ProductMenuHeader } from "@/components/products/ProductMenuHeader";
import { ProductMenuShell } from "@/components/products/ProductMenuShell";

export const metadata: Metadata = {
  title: "Menu — Barbell Kitchen",
  description:
    "Browse Barbell Kitchen's high-protein, macro-counted meals and weekly plans. Filter by goal, search, and order fresh meals prepared inside your gym.",
};

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

export default function ProductsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <TopPromoBar />
      <Navbar links={productNavLinks} logoHref="/" activeHref="/products" />

      <main className="flex-1">
        <ProductMenuHeader />
        <ProductMenuShell />
      </main>

      <Footer />
    </div>
  );
}
