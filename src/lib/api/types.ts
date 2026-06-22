/**
 * TypeScript types mirroring the backend (Healthy Menu API) JSON contracts.
 *
 * Fields are **snake_case** to match the API exactly (source of truth:
 * `docs/backend-api/docs.json`). These are the raw wire types — mapping to the
 * existing frontend view models happens in a later phase (menu mappers), so the
 * approved UI components stay untouched.
 */

/* --------------------------- Response envelopes ------------------------- */

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type PaginationMeta = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number | null;
  to: number | null;
};

/** List responses wrap the array in `data` and pagination in `meta.pagination`. */
export type PaginatedEnvelope<T> = ApiEnvelope<T[]> & {
  meta: { pagination: PaginationMeta };
};

/* ------------------------------ Resources ------------------------------- */

export type Category = {
  id: number;
  name: string;
  description?: string | null;
  /** Present on admin list/show responses. */
  products_count?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type Goal = {
  id: number;
  name: string;
  products_count?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type Ingredient = {
  id: number;
  name: string;
  products_count?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type Nutrition = {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
};

export type ProductImage = {
  id: number;
  file_name: string;
  extension: string;
  file_size: number;
  /** Absolute, ready-to-render URL. */
  url: string;
};

/** Public product card (list). Has NO `ingredients` and NO full `description`. */
export type ProductCard = {
  id: number;
  title: string;
  short_description: string;
  price: number;
  nutrition: Nutrition;
  is_available: boolean;
  category: Category;
  goals: Goal[];
  image: ProductImage | null;
};

/**
 * Full product (public detail + admin show/create/update). Public detail returns
 * the core fields + `ingredients`; admin responses additionally include
 * `category_id`, `ingredient_ids`, `goal_ids`, counts, and audit timestamps.
 */
export type ProductDetails = {
  id: number;
  title: string;
  description: string;
  price: number;
  nutrition: Nutrition;
  is_available: boolean;
  category: Category;
  category_id?: number;
  ingredients: Ingredient[];
  ingredient_ids?: number[];
  goals: Goal[];
  goal_ids?: number[];
  ingredients_count?: number;
  goals_count?: number;
  image: ProductImage | null;
  created_at?: string;
  updated_at?: string;
};

/* ------------------------------- Auth ----------------------------------- */

export type AuthUser = { id: number; name: string; email: string };

export type LoginRequest = {
  email: string;
  password: string;
  device_name?: string;
};

export type LoginResponseData = {
  token: string;
  token_type: string;
  user: AuthUser;
};

/* ------------------------------- Health --------------------------------- */

export type HealthData = { module: string; status: string };

/* --------------------------- Query parameters --------------------------- */

export type PublicProductSort =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "calories_asc"
  | "protein_desc";

export type AdminProductSort = PublicProductSort | "oldest" | "title_asc";

export type PublicProductQuery = {
  search?: string;
  category_id?: number;
  goal_id?: number;
  min_protein?: number;
  max_calories?: number;
  max_carbs?: number;
  is_available?: boolean;
  sort?: PublicProductSort;
  page?: number;
  per_page?: number;
};

export type AdminProductQuery = {
  search?: string;
  category_id?: number;
  goal_id?: number;
  ingredient_id?: number;
  is_available?: boolean;
  sort?: AdminProductSort;
  page?: number;
  per_page?: number;
};

export type LookupQuery = {
  search?: string;
  page?: number;
  per_page?: number;
};

/* ----------------------------- Write bodies ----------------------------- */

/** Create/Update product body. PUT is a FULL replace — always send every field. */
export type ProductWriteBody = {
  category_id: number;
  title: string;
  description: string;
  price: number;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  is_available: boolean;
  /** Min 1; distinct; must exist. */
  ingredient_ids: number[];
  /** Min 1; distinct; must exist. */
  goal_ids: number[];
};

export type CategoryWriteBody = { name: string; description?: string | null };
export type GoalWriteBody = { name: string };
export type IngredientWriteBody = { name: string };
