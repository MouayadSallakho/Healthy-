"use client";

import { useId, useState, type ReactNode } from "react";
import type { ProductWriteBody, ProductDetails } from "@/lib/api";
import type { LookupOption, ProductFormOptions } from "@/features/admin/api/admin-lookups";
import type { ProductFieldErrors } from "@/features/admin/api/admin-products";

/* ------------------------------ Values ---------------------------------- */

/** Numeric fields are kept as strings while editing (empty/partial input). */
export type ProductFormValues = {
  title: string;
  description: string;
  price: string;
  protein: string;
  carbs: string;
  fat: string;
  calories: string;
  category_id: number | null;
  goal_ids: number[];
  ingredient_ids: number[];
  is_available: boolean;
};

export const emptyProductFormValues: ProductFormValues = {
  title: "",
  description: "",
  price: "",
  protein: "",
  carbs: "",
  fat: "",
  calories: "",
  category_id: null,
  goal_ids: [],
  ingredient_ids: [],
  is_available: true,
};

/** Build initial form values from a fetched product (edit prefill). */
export function productToFormValues(p: ProductDetails): ProductFormValues {
  return {
    title: p.title ?? "",
    description: p.description ?? "",
    price: String(p.price ?? ""),
    protein: String(p.nutrition?.protein ?? ""),
    carbs: String(p.nutrition?.carbs ?? ""),
    fat: String(p.nutrition?.fat ?? ""),
    calories: String(p.nutrition?.calories ?? ""),
    category_id: p.category_id ?? p.category?.id ?? null,
    goal_ids: p.goal_ids ?? p.goals?.map((g) => g.id) ?? [],
    ingredient_ids: p.ingredient_ids ?? p.ingredients?.map((i) => i.id) ?? [],
    is_available: p.is_available ?? true,
  };
}

/* --------------------------- Client validation -------------------------- */

function numberError(raw: string, max: number, integer = false): string | undefined {
  if (raw.trim() === "") return "Required.";
  const n = Number(raw);
  if (Number.isNaN(n)) return "Enter a number.";
  if (n < 0) return "Cannot be negative.";
  if (integer && !Number.isInteger(n)) return "Whole number only.";
  if (n > max) return `Max ${max}.`;
  return undefined;
}

function validate(values: ProductFormValues): ProductFieldErrors {
  const e: ProductFieldErrors = {};
  if (!values.title.trim()) e.title = "Title is required.";
  else if (values.title.length > 180) e.title = "Max 180 characters.";

  if (!values.description.trim()) e.description = "Description is required.";
  else if (values.description.length > 5000) e.description = "Max 5000 characters.";

  e.price = numberError(values.price, 999999.99);
  e.protein = numberError(values.protein, 999.99);
  e.carbs = numberError(values.carbs, 999.99);
  e.fat = numberError(values.fat, 999.99);
  e.calories = numberError(values.calories, 9999, true);

  if (values.category_id === null) e.category_id = "Select a category.";
  if (values.goal_ids.length === 0) e.goal_ids = "Select at least one goal.";
  if (values.ingredient_ids.length === 0) e.ingredient_ids = "Select at least one ingredient.";

  // Drop undefined keys.
  (Object.keys(e) as (keyof ProductFieldErrors)[]).forEach((k) => {
    if (!e[k]) delete e[k];
  });
  return e;
}

function toBody(values: ProductFormValues): ProductWriteBody {
  return {
    category_id: values.category_id as number,
    title: values.title.trim(),
    description: values.description.trim(),
    price: Number(values.price),
    protein: Number(values.protein),
    carbs: Number(values.carbs),
    fat: Number(values.fat),
    calories: Number(values.calories),
    is_available: values.is_available,
    ingredient_ids: values.ingredient_ids,
    goal_ids: values.goal_ids,
  };
}

/* ----------------------------- UI helpers ------------------------------- */

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-graphite/10 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="font-display text-lg font-bold tracking-tight text-graphite">{title}</h2>
      {description && <p className="mt-1 text-sm text-graphite/55">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-xs font-medium text-maroon">
      {message}
    </p>
  );
}

const inputClass =
  "min-h-11 w-full rounded-xl border border-graphite/15 bg-white px-3.5 text-sm text-graphite placeholder:text-graphite/40 focus:border-maroon focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-[3px]";

function OptionChips({
  options,
  selected,
  onToggle,
  emptyText,
}: {
  options: LookupOption[];
  selected: number[];
  onToggle: (id: number) => void;
  emptyText: string;
}) {
  if (options.length === 0) {
    return <p className="text-sm text-graphite/50">{emptyText}</p>;
  }
  return (
    <div className="flex max-h-44 flex-wrap gap-2 overflow-y-auto overscroll-contain rounded-xl border border-graphite/10 bg-offwhite/50 p-3">
      {options.map((o) => {
        const active = selected.includes(o.id);
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(o.id)}
            className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors ${
              active
                ? "border-maroon bg-maroon text-cream"
                : "border-graphite/15 bg-white text-graphite/80 hover:border-maroon/50 hover:text-maroon"
            }`}
          >
            {o.name}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------- Form ----------------------------------- */

type ProductFormProps = {
  mode: "create" | "edit";
  options: ProductFormOptions;
  initialValues?: ProductFormValues;
  submitting: boolean;
  /** Per-field messages from a backend 422. */
  serverFieldErrors?: ProductFieldErrors;
  /** Content for the "Product image" section (picker on create, manager on edit). */
  imageSlot?: ReactNode;
  onSubmit: (body: ProductWriteBody) => void;
  onCancel?: () => void;
};

export function ProductForm({
  mode,
  options,
  initialValues,
  submitting,
  serverFieldErrors,
  imageSlot,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>(initialValues ?? emptyProductFormValues);
  const [clientErrors, setClientErrors] = useState<ProductFieldErrors>({});
  const baseId = useId();

  const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (clientErrors[key as keyof ProductFieldErrors]) {
      setClientErrors((e) => ({ ...e, [key]: undefined }));
    }
  };

  const errorFor = (key: keyof ProductFieldErrors): string | undefined =>
    clientErrors[key] ?? serverFieldErrors?.[key];

  const toggleId = (key: "goal_ids" | "ingredient_ids", id: number) => {
    setValues((v) => {
      const list = v[key];
      return { ...v, [key]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id] };
    });
    if (clientErrors[key]) setClientErrors((e) => ({ ...e, [key]: undefined }));
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    const errors = validate(values);
    setClientErrors(errors);
    if (Object.keys(errors).length > 0) {
      // Focus the first invalid field for quick correction.
      const first = document.querySelector<HTMLElement>('[aria-invalid="true"]');
      first?.focus();
      return;
    }
    onSubmit(toBody(values));
  }

  const fid = (name: string) => `${baseId}-${name}`;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <Section title="Basic information">
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor={fid("title")} className="mb-1.5 block text-sm font-semibold text-graphite">
              Title
            </label>
            <input
              id={fid("title")}
              type="text"
              maxLength={180}
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              aria-invalid={errorFor("title") ? true : undefined}
              aria-describedby={errorFor("title") ? fid("title-err") : undefined}
              className={inputClass}
              placeholder="e.g. Chicken Protein Bowl"
            />
            <FieldError id={fid("title-err")} message={errorFor("title")} />
          </div>
          <div>
            <label htmlFor={fid("description")} className="mb-1.5 block text-sm font-semibold text-graphite">
              Description
            </label>
            <textarea
              id={fid("description")}
              rows={4}
              maxLength={5000}
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              aria-invalid={errorFor("description") ? true : undefined}
              aria-describedby={errorFor("description") ? fid("description-err") : undefined}
              className="w-full rounded-xl border border-graphite/15 bg-white p-3.5 text-sm leading-relaxed text-graphite placeholder:text-graphite/40 focus:border-maroon focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-[3px]"
              placeholder="Grilled chicken breast with rice, broccoli, avocado…"
            />
            <FieldError id={fid("description-err")} message={errorFor("description")} />
          </div>
        </div>
      </Section>

      <Section title="Nutrition" description="Per serving. Macros in grams; calories as a whole number.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {([
            { key: "protein", label: "Protein (g)", step: "0.1" },
            { key: "carbs", label: "Carbs (g)", step: "0.1" },
            { key: "fat", label: "Fat (g)", step: "0.1" },
            { key: "calories", label: "Calories", step: "1" },
          ] as const).map((f) => (
            <div key={f.key}>
              <label htmlFor={fid(f.key)} className="mb-1.5 block text-sm font-semibold text-graphite">
                {f.label}
              </label>
              <input
                id={fid(f.key)}
                type="number"
                inputMode="decimal"
                min={0}
                step={f.step}
                value={values[f.key]}
                onChange={(e) => set(f.key, e.target.value)}
                aria-invalid={errorFor(f.key) ? true : undefined}
                aria-describedby={errorFor(f.key) ? fid(`${f.key}-err`) : undefined}
                className={inputClass}
              />
              <FieldError id={fid(`${f.key}-err`)} message={errorFor(f.key)} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Pricing">
        <div className="max-w-xs">
          <label htmlFor={fid("price")} className="mb-1.5 block text-sm font-semibold text-graphite">
            Price
          </label>
          <input
            id={fid("price")}
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={values.price}
            onChange={(e) => set("price", e.target.value)}
            aria-invalid={errorFor("price") ? true : undefined}
            aria-describedby={errorFor("price") ? fid("price-err") : undefined}
            className={inputClass}
            placeholder="12.50"
          />
          <FieldError id={fid("price-err")} message={errorFor("price")} />
        </div>
      </Section>

      <Section title="Category, goals & ingredients" description="Loaded from the live menu data.">
        <div className="flex flex-col gap-5">
          <div className="max-w-sm">
            <label htmlFor={fid("category")} className="mb-1.5 block text-sm font-semibold text-graphite">
              Category
            </label>
            <select
              id={fid("category")}
              value={values.category_id ?? ""}
              onChange={(e) => set("category_id", e.target.value === "" ? null : Number(e.target.value))}
              aria-invalid={errorFor("category_id") ? true : undefined}
              aria-describedby={errorFor("category_id") ? fid("category-err") : undefined}
              className={`${inputClass} appearance-none`}
            >
              <option value="">Select a category…</option>
              {options.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <FieldError id={fid("category-err")} message={errorFor("category_id")} />
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-semibold text-graphite">Goals / tags</span>
            <OptionChips
              options={options.goals}
              selected={values.goal_ids}
              onToggle={(id) => toggleId("goal_ids", id)}
              emptyText="No goals available."
            />
            <FieldError id={fid("goals-err")} message={errorFor("goal_ids")} />
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-semibold text-graphite">Ingredients</span>
            <OptionChips
              options={options.ingredients}
              selected={values.ingredient_ids}
              onToggle={(id) => toggleId("ingredient_ids", id)}
              emptyText="No ingredients available."
            />
            <FieldError id={fid("ingredients-err")} message={errorFor("ingredient_ids")} />
          </div>
        </div>
      </Section>

      <Section title="Availability">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={values.is_available}
            onChange={(e) => set("is_available", e.target.checked)}
            className="h-5 w-5 rounded border-graphite/30 text-maroon focus-visible:outline-2 focus-visible:outline-offset-2 accent-maroon"
          />
          <span className="text-sm font-medium text-graphite">Available on the menu</span>
        </label>
      </Section>

      <Section title="Product image" description="JPG, PNG, or WebP · up to 5 MB.">
        {imageSlot ?? (
          <div className="rounded-xl border border-dashed border-graphite/20 bg-offwhite/40 px-5 py-8 text-center">
            <p className="text-sm text-graphite/50">
              Image upload is available from this product&apos;s page.
            </p>
          </div>
        )}
      </Section>

      <div className="sticky bottom-0 flex items-center justify-end gap-3 rounded-2xl border border-graphite/10 bg-white/90 p-4 shadow-sm backdrop-blur">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="inline-flex min-h-11 items-center rounded-full border border-graphite/20 px-5 text-sm font-semibold text-graphite transition-colors hover:border-graphite/40 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          aria-busy={submitting}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-maroon px-6 text-sm font-semibold text-cream shadow-sm shadow-maroon/25 transition-colors hover:bg-maroon-bright disabled:opacity-60"
        >
          {submitting ? "Saving…" : mode === "create" ? "Create product" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
