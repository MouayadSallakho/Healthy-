/**
 * Admin product image upload/delete (Bearer-authenticated, multipart).
 *
 * - POST   /api/admin/products/{productId}/image   (field `image`; replaces existing)
 * - DELETE /api/admin/products/{productId}/image
 *
 * One image per product. Allowed: jpg/jpeg/png/webp, max 5 MB; SVG rejected.
 * The controller may return 200 or 201 — both are success (the API client only
 * throws on non-2xx). `Content-Type` is left unset so the browser adds the
 * multipart boundary.
 */
import { http, isApiError } from "@/lib/api";
import type { ApiEnvelope, ProductImage } from "@/lib/api";

export function uploadProductImage(
  productId: number,
  file: File,
): Promise<ApiEnvelope<ProductImage>> {
  const form = new FormData();
  form.append("image", file);
  return http.postForm<ApiEnvelope<ProductImage>>(`/admin/products/${productId}/image`, form);
}

export function deleteProductImage(productId: number): Promise<ApiEnvelope<null>> {
  return http.del<ApiEnvelope<null>>(`/admin/products/${productId}/image`);
}

/** Clean, user-facing message for an image upload/delete failure. */
export function imageErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.isValidation) {
      return error.fieldError("image") ?? "Check the file type and size (JPG, PNG, or WebP · up to 5 MB).";
    }
    if (error.status === 413) return "That image is too large (max 5 MB).";
    if (error.isNotFound) return "Product not found.";
    if (error.isForbidden) return "You don't have permission to manage this image.";
    if (error.isNetwork) return "Can't reach the server. Check your connection and try again.";
  }
  return "Couldn't process the image. Please try again.";
}
