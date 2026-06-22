/**
 * Admin Products CRUD (Bearer-authenticated). Wire shapes match
 * `docs/backend-api/docs.json` exactly.
 *
 * - GET    /api/admin/products        (paginated list, filters/sort)
 * - GET    /api/admin/products/{id}   (full detail for edit prefill)
 * - POST   /api/admin/products        (create; returns 201)
 * - PUT    /api/admin/products/{id}   (FULL replace — send every field)
 * - DELETE /api/admin/products/{id}
 *
 * 401 is handled globally by the API client (clear token + redirect to login).
 */
import { http } from "@/lib/api";
import { ApiError } from "@/lib/api";
import type {
  AdminProductQuery,
  ApiEnvelope,
  PaginatedEnvelope,
  PaginationMeta,
  ProductDetails,
  ProductWriteBody,
  QueryParams,
} from "@/lib/api";

/* Readable aliases over the shared wire types (item 8). */
export type AdminProductListItem = ProductDetails;
export type AdminProductDetails = ProductDetails;
export type ProductCreateRequest = ProductWriteBody;
export type ProductUpdateRequest = ProductWriteBody;

export const ADMIN_PRODUCTS_PER_PAGE = 10;

export type AdminProductsResult = {
  items: AdminProductListItem[];
  pagination: PaginationMeta;
};

export async function listAdminProducts(
  query: AdminProductQuery,
  signal?: AbortSignal,
): Promise<AdminProductsResult> {
  const params: QueryParams = { ...query };
  const res = await http.get<PaginatedEnvelope<ProductDetails>>(
    "/admin/products",
    params,
    true,
    signal,
  );
  return { items: res.data, pagination: res.meta.pagination };
}

export async function getAdminProduct(
  id: number,
  signal?: AbortSignal,
): Promise<AdminProductDetails> {
  const res = await http.get<ApiEnvelope<ProductDetails>>(
    `/admin/products/${id}`,
    undefined,
    true,
    signal,
  );
  return res.data;
}

export async function createAdminProduct(
  body: ProductCreateRequest,
): Promise<AdminProductDetails> {
  const res = await http.post<ApiEnvelope<ProductDetails>>("/admin/products", body);
  return res.data;
}

export async function updateAdminProduct(
  id: number,
  body: ProductUpdateRequest,
): Promise<AdminProductDetails> {
  const res = await http.put<ApiEnvelope<ProductDetails>>(`/admin/products/${id}`, body);
  return res.data;
}

export async function deleteAdminProduct(id: number): Promise<void> {
  await http.del<ApiEnvelope<null>>(`/admin/products/${id}`);
}

/* ---------------------------- Error mapping ----------------------------- */

/** Product fields that can carry a 422 validation message. */
const PRODUCT_FIELDS = [
  "title",
  "description",
  "price",
  "protein",
  "carbs",
  "fat",
  "calories",
  "category_id",
  "goal_ids",
  "ingredient_ids",
] as const;

export type ProductFieldErrors = Partial<Record<(typeof PRODUCT_FIELDS)[number], string>>;

/**
 * Extract per-field 422 messages. Also catches array-element keys
 * (e.g. `ingredient_ids.0`) and surfaces them under the parent field.
 */
export function mapProductFieldErrors(error: ApiError): ProductFieldErrors {
  const out: ProductFieldErrors = {};
  const fe = error.fieldErrors ?? {};
  for (const field of PRODUCT_FIELDS) {
    if (fe[field]?.length) {
      out[field] = fe[field][0];
    } else {
      const nested = Object.keys(fe).find((k) => k.startsWith(`${field}.`));
      if (nested && fe[nested]?.length) out[field] = fe[nested][0];
    }
  }
  return out;
}
