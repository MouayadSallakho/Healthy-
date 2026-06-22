/**
 * Translate UI filter state -> backend query params for GET /api/menu/products.
 *
 * Only documented params/values are sent (no invented sorts/filters). Macro
 * chips map to independent numeric params (combined as AND by the backend).
 */
import type { PublicProductSort, QueryParams } from "@/lib/api";
import type { SortId } from "@/lib/products-content";
import type { MenuFilters } from "./menu-types";

/** Backend public default is 12; matches the approved batch feel. */
export const PRODUCTS_PER_PAGE = 12;

/** Frontend sort id -> backend sort value. "featured" has no backend sort → newest. */
const SORT_MAP: Record<SortId, PublicProductSort> = {
  featured: "newest",
  "price-asc": "price_asc",
  "price-desc": "price_desc",
  "protein-desc": "protein_desc",
  "calories-asc": "calories_asc",
};

export function buildProductQuery(
  filters: MenuFilters,
  page: number,
  perPage: number = PRODUCTS_PER_PAGE,
): QueryParams {
  const query: QueryParams = { page, per_page: perPage, sort: SORT_MAP[filters.sort] };

  const search = filters.query.trim();
  if (search) query.search = search.slice(0, 100); // backend max 100 chars

  if (filters.categoryId !== null) query.category_id = filters.categoryId;
  if (filters.goalId !== null) query.goal_id = filters.goalId;

  // "Under 500 cal" is strictly `< 500` in the approved UI → 499 inclusive.
  if (filters.macros.includes("protein40")) query.min_protein = 40;
  if (filters.macros.includes("cal500")) query.max_calories = 499;
  if (filters.macros.includes("carb30")) query.max_carbs = 30;

  return query;
}
