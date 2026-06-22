"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { isApiError } from "@/lib/api";
import type { ProductWriteBody } from "@/lib/api";
import { loadProductFormOptions, type ProductFormOptions } from "@/features/admin/api/admin-lookups";
import {
  getAdminProduct,
  mapProductFieldErrors,
  updateAdminProduct,
  type AdminProductDetails,
  type ProductFieldErrors,
} from "@/features/admin/api/admin-products";
import { useToast } from "@/features/admin/components/toast-provider";
import { ProductForm, productToFormValues } from "@/features/admin/products/product-form";
import { EditProductImage } from "@/features/admin/products/edit-product-image";
import {
  AdminFormShell,
  OptionsError,
  OptionsLoading,
  ProductNotFound,
} from "@/features/admin/products/product-page-parts";

type Status = "loading" | "ready" | "notfound" | "error";

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export default function EditProductPage() {
  const router = useRouter();
  const toast = useToast();
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  const validId = Number.isInteger(id) && id > 0;

  const [product, setProduct] = useState<AdminProductDetails | null>(null);
  const [options, setOptions] = useState<ProductFormOptions | null>(null);
  const [status, setStatus] = useState<Status>(validId ? "loading" : "notfound");
  const [reloadKey, setReloadKey] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [serverFieldErrors, setServerFieldErrors] = useState<ProductFieldErrors>({});

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!validId) return;
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    // Deferred a frame so setState isn't called synchronously in the effect.
    const raf = requestAnimationFrame(() => {
      setStatus("loading");
      (async () => {
        try {
          const [prod, opts] = await Promise.all([
            getAdminProduct(id, ctrl.signal),
            loadProductFormOptions(ctrl.signal),
          ]);
          setProduct(prod);
          setOptions(opts);
          setStatus("ready");
        } catch (e) {
          if (isAbortError(e)) return;
          if (isApiError(e) && e.isNotFound) setStatus("notfound");
          else setStatus("error");
        }
      })();
    });
    return () => {
      cancelAnimationFrame(raf);
      ctrl.abort();
    };
  }, [id, validId, reloadKey]);

  const handleSave = useCallback(
    async (body: ProductWriteBody) => {
      setSubmitting(true);
      setServerFieldErrors({});
      try {
        const updated = await updateAdminProduct(id, body);
        setProduct(updated);
        toast.success("Product updated.");
      } catch (e) {
        if (isApiError(e)) {
          if (e.isValidation) {
            setServerFieldErrors(mapProductFieldErrors(e));
            toast.error("Please fix the highlighted fields.");
          } else if (e.isNotFound) {
            toast.error("This product no longer exists.");
            setStatus("notfound");
          } else if (e.isConflict) {
            toast.error("This change conflicts with existing data.");
          } else if (e.isForbidden) {
            toast.error("You don't have permission to edit products.");
          } else {
            toast.error("Couldn't save the product. Please try again.");
          }
        } else {
          toast.error("Couldn't save the product. Please try again.");
        }
      } finally {
        setSubmitting(false);
      }
    },
    [id, toast],
  );

  if (status === "notfound") return <ProductNotFound />;

  return (
    <AdminFormShell title={product ? `Edit: ${product.title}` : "Edit product"} backHref="/admin/products">
      {status === "error" ? (
        <OptionsError onRetry={() => setReloadKey((k) => k + 1)} />
      ) : status === "loading" || !product || !options ? (
        <OptionsLoading />
      ) : (
        <ProductForm
          mode="edit"
          options={options}
          initialValues={productToFormValues(product)}
          submitting={submitting}
          serverFieldErrors={serverFieldErrors}
          imageSlot={
            <EditProductImage
              productId={product.id}
              image={product.image}
              onImageChange={(img) => setProduct((p) => (p ? { ...p, image: img } : p))}
            />
          }
          onSubmit={handleSave}
          onCancel={() => router.push("/admin/products")}
        />
      )}
    </AdminFormShell>
  );
}
