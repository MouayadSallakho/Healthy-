"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isApiError } from "@/lib/api";
import type { ProductWriteBody } from "@/lib/api";
import { Icon } from "@/components/landing/icons";
import { loadProductFormOptions, type ProductFormOptions } from "@/features/admin/api/admin-lookups";
import {
  createAdminProduct,
  mapProductFieldErrors,
  type ProductFieldErrors,
} from "@/features/admin/api/admin-products";
import { uploadProductImage } from "@/features/admin/api/admin-product-images";
import { useToast } from "@/features/admin/components/toast-provider";
import { ProductForm } from "@/features/admin/products/product-form";
import { ProductImagePicker } from "@/features/admin/products/product-image-picker";
import { AdminFormShell, OptionsError, OptionsLoading } from "@/features/admin/products/product-page-parts";

export default function NewProductPage() {
  const router = useRouter();
  const toast = useToast();
  const [options, setOptions] = useState<ProductFormOptions | null>(null);
  const [optionsError, setOptionsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverFieldErrors, setServerFieldErrors] = useState<ProductFieldErrors>({});
  const [reloadKey, setReloadKey] = useState(0);

  // Selected-but-not-yet-uploaded image (uploaded after the product is created).
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  // If the product was created but its image upload failed, recover here.
  const [createdNeedsImage, setCreatedNeedsImage] = useState<{ id: number; title: string } | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const raf = requestAnimationFrame(() => {
      setOptions(null);
      setOptionsError(false);
      loadProductFormOptions(ctrl.signal)
        .then((o) => setOptions(o))
        .catch((e) => {
          if (!(e instanceof Error && e.name === "AbortError")) setOptionsError(true);
        });
    });
    return () => {
      cancelAnimationFrame(raf);
      ctrl.abort();
    };
  }, [reloadKey]);

  const handleSubmit = useCallback(
    async (body: ProductWriteBody) => {
      setSubmitting(true);
      setServerFieldErrors({});
      try {
        const created = await createAdminProduct(body);
        // Product exists now. Upload the image if one was selected.
        if (pendingImage) {
          try {
            await uploadProductImage(created.id, pendingImage);
          } catch {
            // Product is created; only the image failed → offer recovery.
            toast.warning(`${created.title} was created, but the image upload failed.`);
            setCreatedNeedsImage({ id: created.id, title: created.title });
            setSubmitting(false);
            return;
          }
        }
        toast.success(`${created.title} created.`);
        router.replace(`/admin/products/${created.id}/edit`);
      } catch (e) {
        if (isApiError(e)) {
          if (e.isValidation) {
            setServerFieldErrors(mapProductFieldErrors(e));
            toast.error("Please fix the highlighted fields.");
          } else if (e.isForbidden) {
            toast.error("You don't have permission to create products.");
          } else {
            toast.error("Couldn't create the product. Please try again.");
          }
        } else {
          toast.error("Couldn't create the product. Please try again.");
        }
        setSubmitting(false);
      }
    },
    [pendingImage, router, toast],
  );

  // Recovery view: product created, image upload failed.
  if (createdNeedsImage) {
    return (
      <AdminFormShell title="Product created" backHref="/admin/products">
        <div className="rounded-2xl border border-graphite/10 bg-white p-6 shadow-sm">
          <p className="flex items-start gap-2 rounded-xl border border-maroon/20 bg-maroon/8 px-4 py-3 text-sm text-maroon">
            <Icon name="bolt" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              <strong>{createdNeedsImage.title}</strong> was created, but the image couldn&apos;t be uploaded.
              You can add it from the edit page.
            </span>
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={`/admin/products/${createdNeedsImage.id}/edit`}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-maroon px-6 text-sm font-semibold text-cream transition-colors hover:bg-maroon-bright"
            >
              Edit product to add image
            </Link>
            <Link
              href="/admin/products"
              className="inline-flex min-h-11 items-center rounded-full border border-graphite/20 px-6 text-sm font-semibold text-graphite transition-colors hover:border-maroon hover:text-maroon"
            >
              Back to products
            </Link>
          </div>
        </div>
      </AdminFormShell>
    );
  }

  return (
    <AdminFormShell title="New product" backHref="/admin/products">
      {optionsError ? (
        <OptionsError onRetry={() => setReloadKey((k) => k + 1)} />
      ) : !options ? (
        <OptionsLoading />
      ) : (
        <ProductForm
          mode="create"
          options={options}
          submitting={submitting}
          serverFieldErrors={serverFieldErrors}
          imageSlot={
            <div>
              <p className="mb-2 text-xs text-graphite/55">
                Optional. The image is uploaded right after the product is created.
              </p>
              <ProductImagePicker onFileChange={setPendingImage} disabled={submitting} />
            </div>
          }
          onSubmit={handleSubmit}
          onCancel={() => router.push("/admin/products")}
        />
      )}
    </AdminFormShell>
  );
}
