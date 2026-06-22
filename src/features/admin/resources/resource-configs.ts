import {
  categoriesApi,
  goalsApi,
  ingredientsApi,
} from "@/features/admin/api/admin-crud";
import type {
  Category,
  CategoryWriteBody,
  Goal,
  GoalWriteBody,
  Ingredient,
  IngredientWriteBody,
} from "@/lib/api";
import type { ResourceConfig } from "./resource-manager";

export const categoriesConfig: ResourceConfig<Category, CategoryWriteBody> = {
  title: "Categories",
  description: "Menu categories used by the public filters.",
  singular: "category",
  plural: "categories",
  hasDescription: true,
  inUseMessage: "This category is used by products and can't be deleted.",
  api: categoriesApi,
  toForm: (c) => ({ name: c.name, description: c.description ?? "" }),
  toBody: (v) => ({ name: v.name.trim(), description: v.description.trim() ? v.description.trim() : null }),
  getId: (c) => c.id,
  getName: (c) => c.name,
  getSubtitle: (c) => c.description ?? null,
  getCount: (c) => c.products_count ?? null,
};

export const goalsConfig: ResourceConfig<Goal, GoalWriteBody> = {
  title: "Goals / Tags",
  description: "Goals and badges shown on products and public filters.",
  singular: "goal",
  plural: "goals",
  hasDescription: false,
  inUseMessage: "This goal is used by products and can't be deleted.",
  api: goalsApi,
  toForm: (g) => ({ name: g.name, description: "" }),
  toBody: (v) => ({ name: v.name.trim() }),
  getId: (g) => g.id,
  getName: (g) => g.name,
  getSubtitle: () => null,
  getCount: (g) => g.products_count ?? null,
};

export const ingredientsConfig: ResourceConfig<Ingredient, IngredientWriteBody> = {
  title: "Ingredients",
  description: "Ingredients that products are built from.",
  singular: "ingredient",
  plural: "ingredients",
  hasDescription: false,
  inUseMessage: "This ingredient is used by products and can't be deleted.",
  api: ingredientsApi,
  toForm: (i) => ({ name: i.name, description: "" }),
  toBody: (v) => ({ name: v.name.trim() }),
  getId: (i) => i.id,
  getName: (i) => i.name,
  getSubtitle: () => null,
  getCount: (i) => i.products_count ?? null,
};
