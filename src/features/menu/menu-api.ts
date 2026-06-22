/**
 * Public menu endpoint calls (no auth). Returns mapped view models so callers
 * (server page + client shell + modal) never touch raw DTOs.
 */
import { http } from "@/lib/api";
import type {
  ApiEnvelope,
  Category,
  Goal,
  PaginatedEnvelope,
  PaginationMeta,
  ProductCard,
  ProductDetails,
  QueryParams,
} from "@/lib/api";
import { mapProductCard, mapProductDetail } from "./menu-mappers";
import type { MenuLookup, MenuProduct, MenuProductDetail } from "./menu-types";

export type ProductsPage = { items: MenuProduct[]; pagination: PaginationMeta };

/** GET /api/menu/products */
export async function fetchProducts(
  query: QueryParams,
  signal?: AbortSignal,
): Promise<ProductsPage> {
  const res = await http.get<PaginatedEnvelope<ProductCard>>(
    "/menu/products",
    query,
    false,
    signal,
  );
  return { items: res.data.map(mapProductCard), pagination: res.meta.pagination };
}

/** GET /api/menu/categories (unpaginated). */
export async function fetchCategories(signal?: AbortSignal): Promise<MenuLookup[]> {
  const res = await http.get<ApiEnvelope<Category[]>>(
    "/menu/categories",
    undefined,
    false,
    signal,
  );
  return res.data.map((c) => ({ id: c.id, name: c.name }));
}

/** GET /api/menu/goals (unpaginated). */
export async function fetchGoals(signal?: AbortSignal): Promise<MenuLookup[]> {
  const res = await http.get<ApiEnvelope<Goal[]>>("/menu/goals", undefined, false, signal);
  return res.data.map((g) => ({ id: g.id, name: g.name }));
}

/**
 * GET /api/menu/products/{id} — full detail (description + ingredients).
 * Cached per id for the page lifetime so re-opening/navigating is instant.
 */
const detailCache = new Map<number, MenuProductDetail>();

export async function fetchProductDetail(
  id: number,
  signal?: AbortSignal,
): Promise<MenuProductDetail> {
  const cached = detailCache.get(id);
  if (cached) return cached;
  const res = await http.get<ApiEnvelope<ProductDetails>>(
    `/menu/products/${id}`,
    undefined,
    false,
    signal,
  );
  const mapped = mapProductDetail(res.data);
  detailCache.set(id, mapped);
  return mapped;
}
