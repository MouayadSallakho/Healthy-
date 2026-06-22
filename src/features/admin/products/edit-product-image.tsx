"use client";

import Image from "next/image";
import { useState } from "react";
import { isApiError } from "@/lib/api";
import type { ProductImage } from "@/lib/api";
import {
  deleteProductImage,
  imageErrorMessage,
  uploadProductImage,
} from "@/features/admin/api/admin-product-images";
import { ConfirmDialog } from "@/features/admin/components/confirm-dialog";
import { useToast } from "@/features/admin/components/toast-provider";
import { ProductImagePicker } from "./product-image-picker";

/**
 * Edit-mode image manager: shows the current saved image and lets the admin
 * upload, replace, or delete it. Upload/delete hit the API immediately (image
 * is independent of the product PUT) and report the new image up via
 * `onImageChange`. Outcomes are surfaced via toasts; pre-upload file validation
 * stays inline at the picker.
 */
export function EditProductImage({
  productId,
  image,
  onImageChange,
}: {
  productId: number;
  image: ProductImage | null;
  onImageChange: (image: ProductImage | null) => void;
}) {
  const toast = useToast();
  const [pending, setPending] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const busy = uploading || deleting;

  async function handleUpload() {
    if (!pending || busy) return;
    const replaced = Boolean(image);
    setUploading(true);
    try {
      const res = await uploadProductImage(productId, pending);
      onImageChange(res.data);
      setPending(null);
      toast.success(replaced ? "Image replaced." : "Image uploaded.");
    } catch (e) {
      toast.error(imageErrorMessage(e));
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete() {
    if (busy) return;
    setDeleting(true);
    try {
      await deleteProductImage(productId);
      onImageChange(null);
      setConfirmOpen(false);
      toast.success("Image removed.");
    } catch (e) {
      // Already gone on the server → treat as removed locally.
      if (isApiError(e) && e.isNotFound) {
        onImageChange(null);
        setConfirmOpen(false);
        toast.info("Image was already removed.");
      } else {
        toast.error(imageErrorMessage(e));
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {image && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-graphite sm:w-44">
            <Image
              src={image.url}
              alt="Current product image"
              fill
              sizes="(max-width: 640px) 100vw, 176px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-graphite/50">Current image</p>
            <p className="mt-1 truncate text-sm text-graphite/70">{image.file_name}</p>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={busy}
              className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-full border border-graphite/20 px-3.5 text-xs font-semibold text-graphite transition-colors hover:border-maroon hover:bg-maroon hover:text-cream disabled:opacity-50"
            >
              Delete image
            </button>
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-sm font-semibold text-graphite">
          {image ? "Replace image" : "Upload image"}
        </p>
        <ProductImagePicker onFileChange={setPending} disabled={busy} />
      </div>

      {pending && (
        <div>
          <button
            type="button"
            onClick={handleUpload}
            disabled={busy}
            aria-busy={uploading}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-maroon px-5 text-sm font-semibold text-cream shadow-sm shadow-maroon/25 transition-colors hover:bg-maroon-bright disabled:opacity-60"
          >
            {uploading ? "Uploading…" : image ? "Upload & replace" : "Upload image"}
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete image"
        message="Remove the current product image? You can upload a new one anytime."
        confirmLabel="Delete image"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deleting) setConfirmOpen(false);
        }}
      />
    </div>
  );
}
