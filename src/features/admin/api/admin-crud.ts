/**
 * Generic admin CRUD for the simple taxonomy resources (categories, goals,
 * ingredients). All are Bearer-authenticated and share the same list/create/
 * update/delete shape; only the write body differs (categories add a
 * description). Wire shapes match `docs/backend-api/docs.json`.
 *
 * Delete returns 409 with codes CATEGORY.IN_USE / GOAL.IN_USE / INGREDIENT.IN_USE
 * when the resource is still referenced by products.
 */
import { http } from "@/lib/api";
import { ApiError } from "@/lib/api";
import type {
  ApiEnvelope,
  Category,
  CategoryWriteBody,
  Goal,
  GoalWriteBody,
  Ingredient,
  IngredientWriteBody,
  LookupQuery,
  PaginatedEnvelope,
  PaginationMeta,
  QueryParams,
} from "@/lib/api";

export type CrudListResult<R> = { items: R[]; pagination: PaginationMeta };

export type CrudApi<R, TBody> = {
  list: (query: LookupQuery, signal?: AbortSignal) => Promise<CrudListResult<R>>;
  create: (body: TBody) => Promise<R>;
  update: (id: number, body: TBody) => Promise<R>;
  remove: (id: number) => Promise<void>;
};

function makeCrud<R, TBody>(basePath: string): CrudApi<R, TBody> {
  return {
    async list(query, signal) {
      const params: QueryParams = { ...query };
      const res = await http.get<PaginatedEnvelope<R>>(basePath, params, true, signal);
      return { items: res.data, pagination: res.meta.pagination };
    },
    async create(body) {
      const res = await http.post<ApiEnvelope<R>>(basePath, body);
      return res.data;
    },
    async update(id, body) {
      const res = await http.put<ApiEnvelope<R>>(`${basePath}/${id}`, body);
      return res.data;
    },
    async remove(id) {
      await http.del<ApiEnvelope<null>>(`${basePath}/${id}`);
    },
  };
}

export const categoriesApi = makeCrud<Category, CategoryWriteBody>("/admin/categories");
export const goalsApi = makeCrud<Goal, GoalWriteBody>("/admin/goals");
export const ingredientsApi = makeCrud<Ingredient, IngredientWriteBody>("/admin/ingredients");

/* ---------------------------- Error mapping ----------------------------- */

export type ResourceFieldErrors = { name?: string; description?: string };

/** Map a 422 to the name/description fields. */
export function mapResourceFieldErrors(error: ApiError): ResourceFieldErrors {
  const fe = error.fieldErrors ?? {};
  return { name: fe.name?.[0], description: fe.description?.[0] };
}
