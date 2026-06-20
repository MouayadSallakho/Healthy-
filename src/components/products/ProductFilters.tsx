"use client";

import type { ReactNode } from "react";
import { Icon } from "@/components/landing/icons";
import { BuildMuscleIcon } from "@/components/landing/BuildMuscleIcon";
import {
  filterCategories,
  categoryMeta,
  goalOrder,
  goalMeta,
  macroFilters,
  type FilterCategoryId,
  type GoalId,
  type MacroFilterId,
  type ProductFilters as Filters,
} from "@/lib/products-content";

/* ----------------------------- Primitives ------------------------------ */

/**
 * Accessible filter pill. Selection is conveyed by fill + a check icon (not
 * color alone). `iconNode` lets callers inject a custom glyph (e.g. the
 * BuildMuscleIcon, which needs a white/maroon variant per state).
 */
export function FilterChip({
  label,
  active,
  onClick,
  iconNode,
  ariaLabel,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  iconNode?: ReactNode;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={ariaLabel}
      onClick={onClick}
      className={`inline-flex min-h-10 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-sm font-medium transition-colors duration-200 ${
        active
          ? "border-maroon bg-maroon text-cream shadow-sm shadow-maroon/20"
          : "border-graphite/15 bg-white text-graphite/80 hover:border-maroon/50 hover:text-maroon"
      }`}
    >
      {iconNode}
      <span>{label}</span>
      {active && <Icon name="check" className="h-3.5 w-3.5" aria-hidden="true" />}
    </button>
  );
}

export function SearchField({
  value,
  onChange,
  id = "product-search",
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  id?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <label htmlFor={id} className="sr-only">
        Search meals
      </label>
      <Icon
        name="target"
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite/40"
        aria-hidden="true"
      />
      <input
        id={id}
        type="search"
        inputMode="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search meals, ingredients…"
        className="min-h-11 w-full rounded-full border border-graphite/15 bg-white pl-10 pr-4 text-sm text-graphite placeholder:text-graphite/40 focus:border-maroon focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-[3px]"
      />
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-graphite/55">
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

/** Goal chip with the correct BuildMuscleIcon variant for build. */
function GoalChip({
  goal,
  active,
  onClick,
}: {
  goal: GoalId;
  active: boolean;
  onClick: () => void;
}) {
  const icon =
    goal === "build" ? (
      <BuildMuscleIcon variant={active ? "white" : "maroon"} className="h-4 w-4" />
    ) : (
      <Icon name={goalMeta[goal].icon} className="h-4 w-4" aria-hidden="true" />
    );
  return (
    <FilterChip label={goalMeta[goal].label} active={active} onClick={onClick} iconNode={icon} />
  );
}

/* ----------------------------- Sidebar --------------------------------- */

type FiltersProps = {
  filters: Filters;
  activeCount: number;
  onCategory: (c: FilterCategoryId) => void;
  onToggleGoal: (g: GoalId) => void;
  onToggleMacro: (m: MacroFilterId) => void;
  onQuery: (q: string) => void;
  onClear: () => void;
};

/**
 * Desktop filter sidebar (hidden below lg — the mobile UI is MobileFilterBar).
 */
export function ProductFilters({
  filters,
  activeCount,
  onCategory,
  onToggleGoal,
  onToggleMacro,
  onQuery,
  onClear,
}: FiltersProps) {
  return (
    <div className="flex flex-col rounded-2xl border border-graphite/10 bg-white/70 shadow-sm backdrop-blur lg:max-h-[calc(100svh-var(--navbar-height)-3rem)]">
      {/* Header stays visible while the body scrolls */}
      <div className="flex shrink-0 items-center justify-between border-b border-graphite/10 px-6 py-4">
        <h2 className="font-display text-lg font-bold tracking-tight text-graphite">
          Filters
        </h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-maroon underline-offset-2 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Single internal scroll area for all groups */}
      <div className="flex min-h-0 flex-col gap-7 overflow-y-auto overscroll-contain px-6 py-6">
        <SearchField value={filters.query} onChange={onQuery} />

        <FilterGroup title="Category">
        {filterCategories.map((c) => (
          <FilterChip
            key={c}
            label={categoryMeta[c].label}
            active={filters.category === c}
            onClick={() => onCategory(c)}
            iconNode={<Icon name={categoryMeta[c].icon} className="h-4 w-4" aria-hidden="true" />}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Goal">
        {goalOrder.map((g) => (
          <GoalChip
            key={g}
            goal={g}
            active={filters.goals.includes(g)}
            onClick={() => onToggleGoal(g)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Macros">
        {macroFilters.map((m) => (
          <FilterChip
            key={m.id}
            label={m.label}
            active={filters.macros.includes(m.id)}
            onClick={() => onToggleMacro(m.id)}
            iconNode={<Icon name={m.icon} className="h-4 w-4" aria-hidden="true" />}
          />
        ))}
        </FilterGroup>
      </div>
    </div>
  );
}
