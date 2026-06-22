"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPT_ATTR = "image/jpeg,image/png,image/webp";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB (5120 KB)

/**
 * Client-side image validation (UX only — the backend remains source of truth).
 * Checks MIME and extension; explicitly rejects SVG; enforces the 5 MB limit.
 */
export function validateImageFile(file: File): string | null {
  const name = file.name.toLowerCase();
  if (file.type === "image/svg+xml" || name.endsWith(".svg")) {
    return "SVG files aren't allowed.";
  }
  const typeOk = ACCEPTED_TYPES.includes(file.type) || /\.(jpe?g|png|webp)$/.test(name);
  if (!typeOk) return "Use a JPG, PNG, or WebP image.";
  if (file.size > MAX_BYTES) return "Image must be 5 MB or smaller.";
  return null;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Reusable local-file picker: click or drag/drop, validates, previews (via an
 * object URL that is always revoked), and bubbles the valid `File` (or null) up.
 * It does NOT upload — the parent decides when/where to send it.
 */
export function ProductImagePicker({
  onFileChange,
  disabled = false,
}: {
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<string | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Always revoke the last object URL on unmount.
  useEffect(() => () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
  }, []);

  function applyPreview(file: File | null) {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    if (file) {
      const url = URL.createObjectURL(file);
      urlRef.current = url;
      setPreviewUrl(url);
      setFileName(file.name);
      setFileSize(file.size);
    } else {
      setPreviewUrl(null);
      setFileName(null);
      setFileSize(0);
    }
  }

  function handleFile(file: File | undefined) {
    if (!file) return;
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    applyPreview(file);
    onFileChange(file);
  }

  function clear() {
    setError(null);
    applyPreview(null);
    onFileChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div
      onDragOver={(e) => {
        if (disabled) return;
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        if (disabled) return;
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files?.[0]);
      }}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT_ATTR}
        disabled={disabled}
        onChange={(e) => handleFile(e.target.files?.[0])}
        className="sr-only"
      />

      {previewUrl ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-graphite sm:w-44">
            <Image src={previewUrl} alt="Selected image preview" fill unoptimized className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-graphite">{fileName}</p>
            <p className="mt-0.5 text-xs text-graphite/55">{formatBytes(fileSize)}</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={disabled}
                className="inline-flex min-h-9 items-center rounded-full border border-graphite/20 px-3.5 text-xs font-semibold text-graphite transition-colors hover:border-maroon hover:text-maroon disabled:opacity-50"
              >
                Change
              </button>
              <button
                type="button"
                onClick={clear}
                disabled={disabled}
                className="inline-flex min-h-9 items-center rounded-full border border-graphite/20 px-3.5 text-xs font-semibold text-graphite transition-colors hover:border-maroon hover:text-maroon disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors disabled:opacity-50 ${
            dragOver ? "border-maroon bg-maroon/5" : "border-graphite/20 bg-offwhite/40 hover:border-maroon/50"
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7 text-graphite/40" aria-hidden="true">
            <path
              d="M12 16V4m0 0L8 8m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-sm font-semibold text-graphite">Click to upload or drag &amp; drop</span>
          <span className="text-xs text-graphite/50">JPG, PNG, or WebP · up to 5 MB</span>
        </button>
      )}

      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-maroon">
          {error}
        </p>
      )}
    </div>
  );
}
