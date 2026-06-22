"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/landing/icons";
import { isApiError } from "@/lib/api";
import {
  mapResourceFieldErrors,
  type CrudApi,
  type ResourceFieldErrors,
} from "@/features/admin/api/admin-crud";
import { ConfirmDialog } from "@/features/admin/components/confirm-dialog";
import { useToast } from "@/features/admin/components/toast-provider";
import { useAdminResource } from "./use-admin-resource";

/* ------------------------------ Config ---------------------------------- */

export type ResourceFormValues = { name: string; description: string };

export type ResourceConfig<R, TBody> = {
  title: string;
  description: string;
  singular: string;
  plural: string;
  /** Categories have a description field; goals/ingredients don't. */
  hasDescription: boolean;
  /** Message shown when a 409 (in-use) blocks deletion. */
  inUseMessage: string;
  api: CrudApi<R, TBody>;
  toForm: (row: R) => ResourceFormValues;
  toBody: (values: ResourceFormValues) => TBody;
  getId: (row: R) => number;
  getName: (row: R) => string;
  getSubtitle: (row: R) => string | null;
  getCount: (row: R) => number | null;
};

const inputClass =
  "min-h-11 w-full rounded-xl border border-graphite/15 bg-white px-3.5 text-sm text-graphite placeholder:text-graphite/40 focus:border-maroon focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-[3px]";

/* --------------------------- Create/Edit dialog ------------------------- */

function ResourceFormDialog({
  title,
  hasDescription,
  initialValues,
  submitting,
  serverErrors,
  onSubmit,
  onClose,
}: {
  title: string;
  hasDescription: boolean;
  initialValues: ResourceFormValues;
  submitting: boolean;
  serverErrors: ResourceFieldErrors;
  onSubmit: (values: ResourceFormValues) => void;
  onClose: () => void;
}) {
  const [values, setValues] = useState<ResourceFormValues>(initialValues);
  const [clientErrors, setClientErrors] = useState<ResourceFieldErrors>({});
  const nameRef = useRef<HTMLInputElement>(null);

  // Mount-only: focus the name field + lock body scroll.
  useEffect(() => {
    nameRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // Escape-to-close (re-bound when submitting/onClose change).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [submitting, onClose]);

  const errorFor = (f: keyof ResourceFieldErrors) => clientErrors[f] ?? serverErrors[f];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!values.name.trim()) {
      setClientErrors({ name: "Name is required." });
      nameRef.current?.focus();
      return;
    }
    setClientErrors({});
    onSubmit(values);
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cancel"
        onClick={() => !submitting && onClose()}
        className="absolute inset-0 h-full w-full bg-ink/60 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="resource-dialog-title"
        className="relative z-10 w-full max-w-md rounded-2xl bg-cream p-6 shadow-2xl"
      >
        <h2 id="resource-dialog-title" className="font-display text-xl font-bold tracking-tight text-graphite">
          {title}
        </h2>
        <form onSubmit={submit} noValidate className="mt-4 flex flex-col gap-4">
          <div>
            <label htmlFor="resource-name" className="mb-1.5 block text-sm font-semibold text-graphite">
              Name
            </label>
            <input
              id="resource-name"
              ref={nameRef}
              type="text"
              maxLength={255}
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
              aria-invalid={errorFor("name") ? true : undefined}
              aria-describedby={errorFor("name") ? "resource-name-err" : undefined}
              className={inputClass}
            />
            {errorFor("name") && (
              <p id="resource-name-err" className="mt-1.5 text-xs font-medium text-maroon">
                {errorFor("name")}
              </p>
            )}
          </div>

          {hasDescription && (
            <div>
              <label htmlFor="resource-description" className="mb-1.5 block text-sm font-semibold text-graphite">
                Description <span className="font-normal text-graphite/45">(optional)</span>
              </label>
              <textarea
                id="resource-description"
                rows={3}
                maxLength={2000}
                value={values.description}
                onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
                aria-invalid={errorFor("description") ? true : undefined}
                aria-describedby={errorFor("description") ? "resource-description-err" : undefined}
                className="w-full rounded-xl border border-graphite/15 bg-white p-3.5 text-sm leading-relaxed text-graphite placeholder:text-graphite/40 focus:border-maroon focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-[3px]"
              />
              {errorFor("description") && (
                <p id="resource-description-err" className="mt-1.5 text-xs font-medium text-maroon">
                  {errorFor("description")}
                </p>
              )}
            </div>
          )}

          <div className="mt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="inline-flex min-h-10 items-center rounded-full border border-graphite/20 px-5 text-sm font-semibold text-graphite transition-colors hover:border-graphite/40 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-maroon px-5 text-sm font-semibold text-cream shadow-sm shadow-maroon/25 transition-colors hover:bg-maroon-bright disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------ Manager --------------------------------- */

type DialogState<R> = { mode: "create"; row: null } | { mode: "edit"; row: R } | null;

export function ResourceManager<R, TBody>({ config }: { config: ResourceConfig<R, TBody> }) {
  const {
    items,
    page,
    setPage,
    totalPages,
    total,
    searchInput,
    setSearchInput,
    status,
    reload,
    afterMutation,
  } = useAdminResource(config.api);

  const toast = useToast();
  const label = config.singular.charAt(0).toUpperCase() + config.singular.slice(1);

  const [dialog, setDialog] = useState<DialogState<R>>(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState<ResourceFieldErrors>({});

  const [pendingDelete, setPendingDelete] = useState<R | null>(null);
  const [deleting, setDeleting] = useState(false);

  function openCreate() {
    setServerErrors({});
    setDialog({ mode: "create", row: null });
  }
  function openEdit(row: R) {
    setServerErrors({});
    setDialog({ mode: "edit", row });
  }
  function closeDialog() {
    if (!submitting) {
      setDialog(null);
      setServerErrors({});
    }
  }

  async function submitForm(values: ResourceFormValues) {
    if (!dialog) return;
    const creating = dialog.mode === "create";
    setSubmitting(true);
    setServerErrors({});
    try {
      const body = config.toBody(values);
      if (creating) await config.api.create(body);
      else await config.api.update(config.getId(dialog.row), body);
      setDialog(null);
      afterMutation();
      toast.success(`${label} ${creating ? "created" : "updated"}.`);
    } catch (e) {
      if (isApiError(e)) {
        if (e.isValidation) {
          setServerErrors(mapResourceFieldErrors(e));
          toast.error("Please fix the highlighted fields.");
        } else if (e.isForbidden) {
          toast.error("You don't have permission to do that.");
        } else if (e.isNotFound) {
          toast.error("That item no longer exists.");
        } else {
          toast.error("Couldn't save. Please try again.");
        }
      } else {
        toast.error("Couldn't save. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const lastOnPage = items.length === 1;
    setDeleting(true);
    try {
      await config.api.remove(config.getId(pendingDelete));
      setPendingDelete(null);
      afterMutation(lastOnPage);
      toast.success(`${label} deleted.`);
    } catch (e) {
      setPendingDelete(null);
      if (isApiError(e)) {
        if (e.isConflict) {
          toast.warning(config.inUseMessage);
        } else if (e.isNotFound) {
          reload();
          toast.info(`That ${config.singular} was already removed.`);
        } else {
          toast.error(`Couldn't delete the ${config.singular}. Please try again.`);
        }
      } else {
        toast.error(`Couldn't delete the ${config.singular}. Please try again.`);
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-graphite sm:text-3xl">
            {config.title}
          </h1>
          <p className="mt-1 text-sm text-graphite/60">
            {status === "ready" ? `${total} ${total === 1 ? config.singular : config.plural}` : config.description}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-maroon px-5 text-sm font-semibold text-cream shadow-sm shadow-maroon/25 transition-colors hover:bg-maroon-bright"
        >
          <Icon name="spark" className="h-4 w-4" aria-hidden="true" />
          Add {config.singular}
        </button>
      </div>

      {/* Search */}
      <div className="relative mt-5 max-w-md">
        <Icon
          name="target"
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite/40"
          aria-hidden="true"
        />
        <label htmlFor={`search-${config.singular}`} className="sr-only">
          Search {config.plural}
        </label>
        <input
          id={`search-${config.singular}`}
          type="search"
          value={searchInput}
          maxLength={100}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={`Search ${config.plural}…`}
          className="min-h-11 w-full rounded-full border border-graphite/15 bg-white pl-10 pr-4 text-sm text-graphite placeholder:text-graphite/40 focus:border-maroon focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-[3px]"
        />
      </div>

      {/* Content */}
      <div className="mt-5">
        {status === "loading" ? (
          <div className="flex flex-col gap-3" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 rounded-2xl border border-graphite/10 bg-white p-4 shadow-sm">
                <div className="h-4 w-48 rounded skeleton" />
                <div className="ml-auto h-8 w-16 rounded-full skeleton" />
              </div>
            ))}
          </div>
        ) : status === "error" ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-graphite/15 bg-white/60 px-6 py-14 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-maroon/10 text-maroon">
              <Icon name="bolt" className="h-7 w-7" />
            </span>
            <h3 className="mt-4 font-display text-xl font-bold text-graphite">Couldn&apos;t load {config.plural}</h3>
            <button
              type="button"
              onClick={reload}
              className="mt-5 inline-flex min-h-11 items-center rounded-full bg-maroon px-6 text-sm font-semibold text-cream transition-colors hover:bg-maroon-bright"
            >
              Try again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-graphite/15 bg-white/60 px-6 py-16 text-center">
            <h3 className="font-display text-xl font-bold text-graphite">
              {searchInput.trim() ? `No ${config.plural} match your search` : `No ${config.plural} yet`}
            </h3>
            {!searchInput.trim() && (
              <button
                type="button"
                onClick={openCreate}
                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-maroon px-6 text-sm font-semibold text-cream transition-colors hover:bg-maroon-bright"
              >
                <Icon name="spark" className="h-4 w-4" aria-hidden="true" />
                Add {config.singular}
              </button>
            )}
          </div>
        ) : (
          <>
            <ul className="flex flex-col gap-2.5">
              {items.map((row) => {
                const id = config.getId(row);
                const subtitle = config.getSubtitle(row);
                const count = config.getCount(row);
                return (
                  <li
                    key={id}
                    className="flex items-center gap-4 rounded-2xl border border-graphite/10 bg-white p-4 shadow-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-graphite">{config.getName(row)}</p>
                      {subtitle && <p className="mt-0.5 line-clamp-1 text-sm text-graphite/55">{subtitle}</p>}
                      {count !== null && count !== undefined && (
                        <p className="mt-0.5 text-xs text-graphite/45">
                          Used by {count} {count === 1 ? "product" : "products"}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        className="inline-flex min-h-9 items-center rounded-full border border-graphite/20 px-3.5 text-xs font-semibold text-graphite transition-colors hover:border-maroon hover:text-maroon"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(row)}
                        className="inline-flex min-h-9 items-center rounded-full border border-graphite/20 px-3.5 text-xs font-semibold text-graphite transition-colors hover:border-maroon hover:bg-maroon hover:text-cream"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="inline-flex min-h-10 items-center rounded-full border border-graphite/20 px-4 text-sm font-semibold text-graphite transition-colors hover:border-maroon hover:text-maroon disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-graphite/60">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="inline-flex min-h-10 items-center rounded-full border border-graphite/20 px-4 text-sm font-semibold text-graphite transition-colors hover:border-maroon hover:text-maroon disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {dialog && (
        <ResourceFormDialog
          title={dialog.mode === "create" ? `Add ${config.singular}` : `Edit ${config.singular}`}
          hasDescription={config.hasDescription}
          initialValues={dialog.mode === "edit" ? config.toForm(dialog.row) : { name: "", description: "" }}
          submitting={submitting}
          serverErrors={serverErrors}
          onSubmit={submitForm}
          onClose={closeDialog}
        />
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete ${config.singular}`}
        message={
          <>
            Delete <span className="font-semibold text-graphite">{pendingDelete ? config.getName(pendingDelete) : ""}</span>?
            This action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (!deleting) setPendingDelete(null);
        }}
      />
    </div>
  );
}
