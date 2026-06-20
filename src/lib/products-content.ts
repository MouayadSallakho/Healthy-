/**
 * Product/menu data + filtering logic for the /products page.
 *
 * Pure data and pure helpers only (no JSX) so this stays a server-safe module
 * and can later be swapped for real API data without touching the UI: keep the
 * `Product` shape and the `filterAndSortProducts` contract stable.
 */
import type { IconName, Macros } from "@/lib/landing-content";
import { PRODUCTS_ROUTE } from "@/lib/landing-content";

export { PRODUCTS_ROUTE };
export type { Macros };

/* ----------------------------- Types ----------------------------------- */

export type CategoryId =
  | "signature"
  | "high-protein"
  | "low-carb"
  | "bulking"
  | "cutting"
  | "smoothies"
  | "plans";

export type FilterCategoryId = "all" | CategoryId;

export type GoalId = "build" | "lose" | "maintain" | "clean";

export type MacroFilterId = "protein40" | "cal500" | "carb30";

export type Availability = "available" | "limited";

export type Product = {
  id: string;
  name: string;
  image: string;
  kind: "meal" | "plan";
  /** Short pill shown on the card. */
  tag: string;
  /** Categories this product matches when filtering. */
  categories: CategoryId[];
  goals: GoalId[];
  shortDescription: string;
  description: string;
  ingredients: string[];
  macros: Macros;
  /** Numeric price for sorting. */
  price: number;
  /** Suffix for plans, e.g. "/ week". */
  unit?: string;
  availability: Availability;
  featured?: boolean;
};

export type SortId =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "protein-desc"
  | "calories-asc";

export type ProductFilters = {
  query: string;
  category: FilterCategoryId;
  goals: GoalId[];
  macros: MacroFilterId[];
  sort: SortId;
};

/* --------------------------- Filter config ----------------------------- */

export const categoryMeta: Record<FilterCategoryId, { label: string; icon: IconName }> = {
  all: { label: "All", icon: "spark" },
  signature: { label: "Signature Bowls", icon: "star" },
  "high-protein": { label: "High Protein", icon: "protein" },
  "low-carb": { label: "Low Carb", icon: "leaf" },
  bulking: { label: "Bulking", icon: "dumbbell" },
  cutting: { label: "Cutting", icon: "flame" },
  smoothies: { label: "Smoothies", icon: "bolt" },
  plans: { label: "Meal Plans", icon: "calendar" },
};

export const filterCategories: FilterCategoryId[] = [
  "all",
  "signature",
  "high-protein",
  "low-carb",
  "bulking",
  "cutting",
  "smoothies",
  "plans",
];

/** `build` is rendered with the custom BuildMuscleIcon; others use Icon. */
export const goalMeta: Record<GoalId, { label: string; icon: IconName }> = {
  build: { label: "Build Muscle", icon: "dumbbell" },
  lose: { label: "Lose Fat", icon: "flame" },
  maintain: { label: "Maintain", icon: "scale" },
  clean: { label: "Eat Clean", icon: "leaf" },
};

export const goalOrder: GoalId[] = ["build", "lose", "maintain", "clean"];

export const macroFilters: { id: MacroFilterId; label: string; icon: IconName }[] = [
  { id: "protein40", label: "40g+ protein", icon: "protein" },
  { id: "cal500", label: "Under 500 cal", icon: "flame" },
  { id: "carb30", label: "Low carb", icon: "leaf" },
];

const macroPredicates: Record<MacroFilterId, (m: Macros) => boolean> = {
  protein40: (m) => m.protein >= 40,
  cal500: (m) => m.calories < 500,
  carb30: (m) => m.carbs <= 30,
};

export const sortOptions: { id: SortId; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "protein-desc", label: "Highest Protein" },
  { id: "calories-asc", label: "Lowest Calories" },
];

export const defaultFilters: ProductFilters = {
  query: "",
  category: "all",
  goals: [],
  macros: [],
  sort: "featured",
};

/* ------------------------ Progressive rendering ------------------------ */

/** How many products to show before the first "load more" / auto-load. */
export const INITIAL_VISIBLE_PRODUCTS = 10;
/** How many additional products each batch reveals. */
export const PRODUCTS_BATCH_SIZE = 10;

/* --------------------------- Menu header ------------------------------- */

/**
 * Compact, menu-first header content (replaces the old tall hero so products
 * sit higher on the page).
 */
export const productsHeader = {
  title: "Performance Menu",
  tagline: "Fresh macro-counted meals prepared inside your gym.",
  address: "Inside [Your Gym Name], [Street Address]",
  pills: [
    { icon: "dumbbell" as IconName, label: "Inside Your Gym" },
    { icon: "clock" as IconName, label: "Ready in 15–20 min" },
    { icon: "protein" as IconName, label: "High Protein" },
    { icon: "scale" as IconName, label: "Macro Counted" },
  ],
};

/* ------------------------------ Helpers -------------------------------- */

export function formatPrice(product: Pick<Product, "price" | "unit">): string {
  return product.unit
    ? `$${product.price} ${product.unit}`
    : `$${product.price.toFixed(2)}`;
}

export function availabilityLabel(a: Availability): string {
  return a === "available" ? "Available today" : "Limited today";
}

/** Goal labels for a product, e.g. ["Build Muscle", "Maintain"]. */
export function goalLabels(goals: GoalId[]): string[] {
  return goals.map((g) => goalMeta[g].label);
}

/**
 * Pure filter + sort used by the client shell. Searches name, description,
 * ingredients, category labels and goal labels.
 */
export function filterAndSortProducts(
  items: Product[],
  filters: ProductFilters,
): Product[] {
  const q = filters.query.trim().toLowerCase();

  const filtered = items.filter((p) => {
    if (filters.category !== "all" && !p.categories.includes(filters.category)) {
      return false;
    }
    if (filters.goals.length && !filters.goals.every((g) => p.goals.includes(g))) {
      return false;
    }
    if (filters.macros.length && !filters.macros.every((m) => macroPredicates[m](p.macros))) {
      return false;
    }
    if (q) {
      const haystack = [
        p.name,
        p.shortDescription,
        p.description,
        p.ingredients.join(" "),
        p.categories.map((c) => categoryMeta[c].label).join(" "),
        goalLabels(p.goals).join(" "),
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const sorted = [...filtered];
  switch (filters.sort) {
    case "price-asc":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "protein-desc":
      sorted.sort((a, b) => b.macros.protein - a.macros.protein);
      break;
    case "calories-asc":
      sorted.sort((a, b) => a.macros.calories - b.macros.calories);
      break;
    default:
      // Featured first, otherwise keep authored order.
      sorted.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  }
  return sorted;
}

/* ------------------------------ Products ------------------------------- */

export const products: Product[] = [
  {
    id: "grilled-chicken-fuel",
    name: "Grilled Chicken Fuel",
    image: "/images/meal-chicken.png",
    kind: "meal",
    tag: "Bestseller",
    categories: ["signature", "high-protein"],
    goals: ["build", "maintain"],
    shortDescription: "Grilled chicken, jasmine rice, broccoli & avocado.",
    description:
      "Our signature everyday plate: char-grilled chicken breast over fluffy jasmine rice with roasted broccoli and creamy avocado. Balanced, filling, and built to fuel training.",
    ingredients: ["Grilled chicken breast", "Jasmine rice", "Broccoli", "Avocado", "Olive oil"],
    macros: { protein: 49, carbs: 52, fat: 14, calories: 540 },
    price: 12.9,
    availability: "available",
    featured: true,
  },
  {
    id: "lemon-herb-salmon",
    name: "Lemon Herb Salmon",
    image: "/images/meal-salmon.png",
    kind: "meal",
    tag: "Omega-3",
    categories: ["signature", "high-protein"],
    goals: ["maintain", "clean"],
    shortDescription: "Atlantic salmon, sweet potato, asparagus & greens.",
    description:
      "Crispy-skin Atlantic salmon with roasted sweet potato, grilled asparagus and fresh greens. Rich in omega-3s and clean, slow-release carbs.",
    ingredients: ["Atlantic salmon", "Sweet potato", "Asparagus", "Mixed greens", "Lemon & herbs"],
    macros: { protein: 42, carbs: 38, fat: 22, calories: 520 },
    price: 14.5,
    availability: "available",
    featured: true,
  },
  {
    id: "steak-power-bowl",
    name: "Steak Power Bowl",
    image: "/images/meal-steak.png",
    kind: "meal",
    tag: "Bulking",
    categories: ["signature", "bulking", "high-protein"],
    goals: ["build"],
    shortDescription: "Lean sirloin, brown rice, black beans & peppers.",
    description:
      "Seared lean sirloin over brown rice with black beans and charred peppers — a calorie-dense, protein-packed bowl for serious training days.",
    ingredients: ["Lean sirloin", "Brown rice", "Black beans", "Bell peppers", "Chimichurri"],
    macros: { protein: 51, carbs: 60, fat: 18, calories: 620 },
    price: 15.9,
    availability: "available",
    featured: true,
  },
  {
    id: "turkey-macro-bowl",
    name: "Turkey Macro Bowl",
    image: "/images/meal-turkey.png",
    kind: "meal",
    tag: "Lean",
    categories: ["high-protein", "cutting"],
    goals: ["lose", "maintain"],
    shortDescription: "Lean turkey, quinoa, kale & roasted veg.",
    description:
      "Seasoned lean ground turkey with quinoa, kale and roasted seasonal vegetables. High protein, controlled calories — ideal for leaning out.",
    ingredients: ["Lean ground turkey", "Quinoa", "Kale", "Roasted vegetables"],
    macros: { protein: 44, carbs: 34, fat: 12, calories: 430 },
    price: 12.5,
    availability: "available",
  },
  {
    id: "lean-low-carb-bowl",
    name: "Lean Low-Carb Bowl",
    image: "/images/meal-lowcarb.png",
    kind: "meal",
    tag: "Low Carb",
    categories: ["low-carb", "cutting", "high-protein"],
    goals: ["lose", "clean"],
    shortDescription: "Chicken, cauliflower rice, avocado & greens.",
    description:
      "Grilled chicken over cauliflower rice with avocado and a generous bed of mixed greens. Low carb, high protein, high volume — satisfying without the extra calories.",
    ingredients: ["Grilled chicken", "Cauliflower rice", "Avocado", "Mixed greens"],
    macros: { protein: 46, carbs: 18, fat: 20, calories: 420 },
    price: 13.5,
    availability: "available",
  },
  {
    id: "recovery-smoothie",
    name: "Recovery Smoothie",
    image: "/images/meal-smoothie.png",
    kind: "meal",
    tag: "Post-workout",
    categories: ["smoothies"],
    goals: ["build", "maintain"],
    shortDescription: "Whey, banana, peanut butter, oats & almond milk.",
    description:
      "A creamy post-workout shake with whey protein, banana, peanut butter and oats blended in almond milk — fast carbs and protein for recovery.",
    ingredients: ["Whey protein", "Banana", "Peanut butter", "Oats", "Almond milk"],
    macros: { protein: 35, carbs: 44, fat: 10, calories: 410 },
    price: 8.5,
    availability: "available",
  },
  {
    id: "chicken-bulk-bowl",
    name: "Chicken Bulk Bowl",
    image: "/images/meal-chicken.png",
    kind: "meal",
    tag: "Bulking",
    categories: ["bulking", "high-protein"],
    goals: ["build"],
    shortDescription: "Double chicken, white rice & roasted veg.",
    description:
      "A bigger build: double portion of grilled chicken with white rice and roasted vegetables, dialed up for a clean calorie surplus.",
    ingredients: ["Grilled chicken (double)", "White rice", "Roasted vegetables", "Olive oil"],
    macros: { protein: 62, carbs: 78, fat: 16, calories: 720 },
    price: 15.5,
    availability: "available",
  },
  {
    id: "salmon-cut-plate",
    name: "Salmon Cut Plate",
    image: "/images/meal-salmon.png",
    kind: "meal",
    tag: "Cutting",
    categories: ["cutting", "high-protein", "low-carb"],
    goals: ["lose"],
    shortDescription: "Salmon, asparagus & leafy greens, low carb.",
    description:
      "A lean cut: salmon fillet with grilled asparagus and leafy greens, kept low-carb for fat-loss phases while keeping protein and omega-3s high.",
    ingredients: ["Salmon fillet", "Asparagus", "Leafy greens", "Lemon"],
    macros: { protein: 40, carbs: 14, fat: 21, calories: 410 },
    price: 14.9,
    availability: "limited",
  },
  {
    id: "steak-performance-plate",
    name: "Steak Performance Plate",
    image: "/images/meal-steak.png",
    kind: "meal",
    tag: "Performance",
    categories: ["signature", "high-protein"],
    goals: ["build", "maintain"],
    shortDescription: "Sirloin, sweet potato mash & greens.",
    description:
      "Seared sirloin with sweet potato mash and sautéed greens — a balanced performance plate for strength and recovery.",
    ingredients: ["Sirloin steak", "Sweet potato mash", "Sautéed greens", "Pepper jus"],
    macros: { protein: 48, carbs: 46, fat: 19, calories: 560 },
    price: 16.5,
    availability: "available",
  },
  {
    id: "egg-protein-bowl",
    name: "Egg Protein Bowl",
    image: "/images/hero-meal.png",
    kind: "meal",
    tag: "High Protein",
    categories: ["high-protein", "signature"],
    goals: ["build", "maintain"],
    shortDescription: "Chicken, salmon, soft egg, rice, broccoli & avocado.",
    description:
      "The loaded signature bowl: grilled chicken and salmon with a soft-boiled egg, jasmine rice, broccoli and avocado — maximum protein in one plate.",
    ingredients: ["Grilled chicken", "Salmon", "Soft-boiled egg", "Jasmine rice", "Broccoli", "Avocado"],
    macros: { protein: 55, carbs: 48, fat: 24, calories: 640 },
    price: 16.9,
    availability: "available",
    featured: true,
  },
  {
    id: "sweet-potato-chicken-bowl",
    name: "Sweet Potato Chicken Bowl",
    image: "/images/meal-chicken.png",
    kind: "meal",
    tag: "Energy",
    categories: ["signature", "high-protein", "bulking"],
    goals: ["build"],
    shortDescription: "Grilled chicken, sweet potato & broccoli.",
    description:
      "Grilled chicken with roasted sweet potato and broccoli — slow-release carbs for sustained energy through long training sessions.",
    ingredients: ["Grilled chicken", "Sweet potato", "Broccoli", "Olive oil"],
    macros: { protein: 47, carbs: 58, fat: 13, calories: 560 },
    price: 13.9,
    availability: "available",
  },
  {
    id: "green-recovery-salad",
    name: "Green Recovery Salad",
    image: "/images/meal-lowcarb.png",
    kind: "meal",
    tag: "Greens",
    categories: ["low-carb"],
    goals: ["clean", "lose"],
    shortDescription: "Chicken, avocado, seeds & leafy greens.",
    description:
      "A light, nutrient-dense salad with grilled chicken, avocado, mixed seeds and crisp leafy greens — clean eating made satisfying.",
    ingredients: ["Grilled chicken", "Avocado", "Mixed seeds", "Leafy greens", "Vinaigrette"],
    macros: { protein: 38, carbs: 16, fat: 22, calories: 390 },
    price: 12.9,
    availability: "available",
  },
  {
    id: "balanced-weekly-plan",
    name: "Balanced Weekly Plan",
    image: "/images/hero-meal.png",
    kind: "plan",
    tag: "Weekly plan",
    categories: ["plans"],
    goals: ["maintain", "clean"],
    shortDescription: "Macro-balanced meals, prepped fresh all week.",
    description:
      "Two macro-balanced meals per day, prepared fresh and ready inside your gym. Nutritionist-approved, flexible week to week — pause or cancel anytime. (Macros shown are per meal.)",
    ingredients: ["2 meals / day", "Rotating signature menu", "Nutritionist approved", "In-gym pickup or delivery"],
    macros: { protein: 42, carbs: 45, fat: 16, calories: 500 },
    price: 109,
    unit: "/ week",
    availability: "available",
  },
  {
    id: "bulk-weekly-plan",
    name: "Bulk Weekly Plan",
    image: "/images/meal-steak.png",
    kind: "plan",
    tag: "Weekly plan",
    categories: ["plans", "bulking"],
    goals: ["build"],
    shortDescription: "Calorie-dense, high-protein meals for mass gain.",
    description:
      "Three calorie-dense, high-protein meals per day to support muscle growth, prepped fresh and ready in-gym. Flexible week to week. (Macros shown are per meal.)",
    ingredients: ["3 meals / day", "High-calorie protein menu", "Nutritionist approved", "In-gym pickup or delivery"],
    macros: { protein: 55, carbs: 70, fat: 20, calories: 700 },
    price: 129,
    unit: "/ week",
    availability: "available",
    featured: true,
  },
  {
    id: "cut-weekly-plan",
    name: "Cut Weekly Plan",
    image: "/images/meal-lowcarb.png",
    kind: "plan",
    tag: "Weekly plan",
    categories: ["plans", "cutting"],
    goals: ["lose"],
    shortDescription: "Lean, calorie-controlled meals that keep protein high.",
    description:
      "Three lean, calorie-controlled meals per day that keep protein high while you cut, prepped fresh and ready in-gym. Flexible week to week. (Macros shown are per meal.)",
    ingredients: ["3 meals / day", "Lean high-protein menu", "Nutritionist approved", "In-gym pickup or delivery"],
    macros: { protein: 45, carbs: 28, fat: 13, calories: 410 },
    price: 119,
    unit: "/ week",
    availability: "available",
  },
  {
    id: "performance-weekly-plan",
    name: "Performance Weekly Plan",
    image: "/images/hero-meal.png",
    kind: "plan",
    tag: "Weekly plan",
    categories: ["plans"],
    goals: ["build", "maintain"],
    shortDescription: "Meals + smoothie built around your training days.",
    description:
      "Three meals plus a recovery smoothie per day, built around your training and recovery, prepped fresh and ready in-gym. Flexible week to week. (Macros shown are per meal.)",
    ingredients: ["3 meals + smoothie / day", "Training-day focused menu", "Nutritionist approved", "In-gym pickup or delivery"],
    macros: { protein: 50, carbs: 55, fat: 18, calories: 600 },
    price: 149,
    unit: "/ week",
    availability: "limited",
    featured: true,
  },
];
