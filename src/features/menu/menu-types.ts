/**
 * View-model + filter types for the public menu (`/products`).
 *
 * `MenuProduct` is the shape the approved UI components render. It is produced
 * from the backend `ProductCard`/`ProductDetails` DTOs by the mappers, so the
 * components don't depend on the raw API shape. We reuse the macro-filter and
 * sort *config* from `products-content.ts` (pure config, not hardcoded product
 * data) so the chips/labels stay identical to the approved design.
 */
import type { Nutrition } from "@/lib/api";
import type { MacroFilterId, SortId } from "@/lib/products-content";

/** A simple {id,name} lookup (categories, goals). */
export type MenuLookup = { id: number; name: string };

export type MenuProduct = {
  /** Stringified backend id — used as React key + modal selection. */
  id: string;
  /** Raw numeric backend id — used for the detail fetch. */
  numericId: number;
  name: string;
  /** Absolute image URL, or null (→ branded placeholder). */
  image: string | null;
  /** Card pill (first goal name), or null. */
  badge: string | null;
  shortDescription: string;
  /** Empty in list responses; filled by the detail fetch. */
  description: string;
  /** Empty in list responses; filled by the detail fetch. */
  ingredients: string[];
  /** Category display labels (backend has one category per product). */
  categoryLabels: string[];
  goals: MenuLookup[];
  macros: Nutrition;
  price: number;
  isAvailable: boolean;
};

/** Fields only present in the detail response (merged into the modal view). */
export type MenuProductDetail = {
  description: string;
  ingredients: string[];
};

export type MenuFilters = {
  query: string;
  /** Backend category id, or null = "All" (omit category_id). */
  categoryId: number | null;
  /** Single-select: backend goal id, or null = none (omit goal_id). */
  goalId: number | null;
  macros: MacroFilterId[];
  sort: SortId;
};

export const defaultMenuFilters: MenuFilters = {
  query: "",
  categoryId: null,
  goalId: null,
  macros: [],
  sort: "featured",
};
