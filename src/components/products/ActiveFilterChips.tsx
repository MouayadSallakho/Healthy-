"use client";

import {
  categoryMeta,
  goalMeta,
  macroFilters,
  type FilterCategoryId,
  type GoalId,
  type MacroFilterId,
  type ProductFilters as Filters,
} from "@/lib/products-content";

const macroLabel = (id: MacroFilterId) =>
  macroFilters.find((m) => m.id === id)?.label ?? id;

type Props = {
  filters: Filters;
  onCategory: (c: FilterCategoryId) => void;
  onToggleGoal: (g: GoalId) => void;
  onToggleMacro: (m: MacroFilterId) => void;
  onClear: () => void;
};

/**
 * Summary of the active filters shown near the meal count. Each chip is a
 * toggle that removes its filter when clicked (no X icon — clicking the chip,
 * or the same control in the sidebar, removes it). Renders a subtle "Showing
 * all meals" note when nothing is active.
 */
export function ActiveFilterChips({
  filters,
  onCategory,
  onToggleGoal,
  onToggleMacro,
  onClear,
}: Props) {
  const chips: { key: string; label: string; onRemove: () => void }[] = [];

  if (filters.category !== "all") {
    chips.push({
      key: `cat-${filters.category}`,
      label: categoryMeta[filters.category].label,
      onRemove: () => onCategory("all"),
    });
  }
  for (const g of filters.goals) {
    chips.push({ key: `goal-${g}`, label: goalMeta[g].label, onRemove: () => onToggleGoal(g) });
  }
  for (const m of filters.macros) {
    chips.push({ key: `macro-${m}`, label: macroLabel(m), onRemove: () => onToggleMacro(m) });
  }

  if (chips.length === 0) {
    return <span className="text-sm text-graphite/45">Showing all meals</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ul className="flex flex-wrap items-center gap-2">
        {chips.map((c) => (
          <li key={c.key}>
            <button
              type="button"
              onClick={c.onRemove}
              aria-label={`Remove ${c.label} filter`}
              className="inline-flex min-h-8 items-center rounded-full border border-maroon/25 bg-maroon/10 px-3 text-xs font-semibold text-maroon transition-colors hover:bg-maroon/20"
            >
              {c.label}
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onClear}
        className="text-xs font-semibold text-graphite/55 underline-offset-2 hover:text-maroon hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
