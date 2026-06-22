/**
 * Pure mappers: backend DTOs (snake_case) -> menu view models.
 *
 * Keeping this isolated means the approved UI components never touch raw API
 * shapes, and a future contract change only needs edits here.
 */
import type { ProductCard, ProductDetails } from "@/lib/api";
import type { MenuProduct, MenuProductDetail } from "./menu-types";

/** Map a public list card. List responses have no description/ingredients. */
export function mapProductCard(p: ProductCard): MenuProduct {
  return {
    id: String(p.id),
    numericId: p.id,
    name: p.title,
    image: p.image?.url ?? null,
    badge: p.goals[0]?.name ?? null,
    shortDescription: p.short_description ?? "",
    description: "",
    ingredients: [],
    categoryLabels: p.category ? [p.category.name] : [],
    goals: p.goals.map((g) => ({ id: g.id, name: g.name })),
    macros: p.nutrition,
    price: p.price,
    isAvailable: p.is_available,
  };
}

/** Map the detail-only fields (merged into the list view in the modal). */
export function mapProductDetail(p: ProductDetails): MenuProductDetail {
  return {
    description: p.description ?? "",
    ingredients: (p.ingredients ?? []).map((i) => i.name),
  };
}
