/**
 * Lookup options for the product form (category / goals / ingredients).
 *
 * Uses the PUBLIC menu lookup endpoints, which return the COMPLETE list
 * (unpaginated) — ideal for form selectors and avoids pagination juggling. IDs
 * are always loaded from the API; never hardcoded.
 */
import { http } from "@/lib/api";
import type { ApiEnvelope, Category, Goal, Ingredient } from "@/lib/api";

export type LookupOption = { id: number; name: string };

export type ProductFormOptions = {
  categories: LookupOption[];
  goals: LookupOption[];
  ingredients: LookupOption[];
};

async function getAll<T extends { id: number; name: string }>(
  path: string,
  signal?: AbortSignal,
): Promise<LookupOption[]> {
  const res = await http.get<ApiEnvelope<T[]>>(path, undefined, false, signal);
  return res.data.map((x) => ({ id: x.id, name: x.name }));
}

export function fetchCategoryOptions(signal?: AbortSignal): Promise<LookupOption[]> {
  return getAll<Category>("/menu/categories", signal);
}

export function fetchGoalOptions(signal?: AbortSignal): Promise<LookupOption[]> {
  return getAll<Goal>("/menu/goals", signal);
}

export function fetchIngredientOptions(signal?: AbortSignal): Promise<LookupOption[]> {
  return getAll<Ingredient>("/menu/ingredients", signal);
}

/** Load all three selector lists in parallel. */
export async function loadProductFormOptions(signal?: AbortSignal): Promise<ProductFormOptions> {
  const [categories, goals, ingredients] = await Promise.all([
    fetchCategoryOptions(signal),
    fetchGoalOptions(signal),
    fetchIngredientOptions(signal),
  ]);
  return { categories, goals, ingredients };
}
