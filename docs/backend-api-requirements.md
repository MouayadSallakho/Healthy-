# Barbell Kitchen — Backend & API Requirements (Handoff)

**Audience:** Backend API developer + admin-panel developer
**Status of frontend:** Public `/products` menu page approved; landing page `/` approved. Data is **hardcoded** in TypeScript files; there is **no backend, API, auth, cart, or checkout** yet.
**Goal of this phase:** Build a backend + admin dashboard so the admin manages all menu data instead of editing code. **Menu management first — not an ordering system.**

> This document was written by inspecting the actual frontend code. Where the frontend does **not** confirm something, it is explicitly marked **`Not confirmed`** rather than invented. Field names in the DTOs intentionally match the current frontend types so integration is low-friction.

---

## 1. Executive Summary

The backend must support, in priority order:

1. **Public menu browsing** — serve the products/meals, categories, goals, and filter metadata that the public `/products` page renders today. The page currently filters/searches/sorts **client-side** over a local array; the backend must be able to serve the same data and (eventually) do filtering/search/sort/pagination server-side.
2. **Admin CRUD management** — a dashboard where the admin creates/edits/deletes products, categories, goals, ingredients, tags/badges, manages availability, prices, images, and the relations between them.
3. **Media / image management** — upload, replace, reorder, set-primary, and delete product images with server-side validation (do not trust file extensions).
4. **Filtering / search / sort** — reproduce the exact behavior the frontend already implements (see §5). The contract `filterAndSortProducts` must be preserved semantically.
5. **Product detail data** — everything the detail modal shows today (description, ingredients, macros, categories, goals, tag, price, availability).
6. **Future extensibility** — clean separation of **public read DTOs** vs **admin DTOs**, normalized relations, and room to add (later) cart/checkout, multi-branch, price variants/sizes, i18n, and per-product image galleries **without** rebuilding the model.

**Explicitly out of scope this phase:** cart, checkout, payments, user accounts/loyalty. (Note: the product card has two **leftover UI-only controls** — an "Add" button and a favorite heart — that have **no persistence**. See §2.7. They are not part of this backend and should be ignored until an ordering phase is scoped.)

---

## 2. Current Frontend Data Source Analysis

All menu data lives in two plain TypeScript modules. **There is no fetching of any kind.** `/products` prerenders as a fully static route.

### 2.1 `src/lib/products-content.ts` — PRIMARY source for the menu page

| Aspect | Detail |
|---|---|
| **What it contains** | The `Product[]` array (16 items today), all enums/IDs (`CategoryId`, `GoalId`, `MacroFilterId`, `SortId`, `Availability`), filter config (`categoryMeta`, `goalMeta`, `macroFilters`, `sortOptions`), the pure `filterAndSortProducts()` function, progressive-loading constants (`INITIAL_VISIBLE_PRODUCTS=10`, `PRODUCTS_BATCH_SIZE=10`), the `productsHeader` strip content, and helpers (`formatPrice`, `availabilityLabel`, `goalLabels`). |
| **How the UI uses it** | `ProductMenuShell` (client) imports `products` + `filterAndSortProducts`, memoizes the filtered/sorted result, slices it to the visible count, and renders `ProductGrid` (cards on `sm+`, compact rows on mobile) + `ProductDetailModal`. |
| **Maps to backend** | `products` → **Product** table (+ join tables for categories, goals, ingredients, images, badge). Config objects → **Category**, **Goal**, **MacroFilter** (static/seeded), **SortOption** (static). `productsHeader` → **Settings/RestaurantInfo**. |
| **Must become API-driven** | The `products` array → `GET /menu/products`. `filterAndSortProducts` logic → server query (§5). The config maps (`categoryMeta`/`goalMeta`/`macroFilters`/`sortOptions`) → `GET /menu/filters`. The hardcoded `productsHeader.address` → settings endpoint. |

**Exact `Product` shape today (the contract to preserve):**

```ts
type Product = {
  id: string;                 // slug-like, e.g. "grilled-chicken-fuel"
  name: string;
  image: string;              // single public path, e.g. "/images/meal-chicken.png"
  kind: "meal" | "plan";      // plans are weekly subscriptions
  tag: string;                // single freeform badge pill, e.g. "Bestseller"
  categories: CategoryId[];   // MULTIPLE categories per product (many-to-many)
  goals: GoalId[];            // MULTIPLE goals per product (many-to-many)
  shortDescription: string;   // card subtitle (line-clamped to 2)
  description: string;        // modal long copy
  ingredients: string[];      // modal list; for plans this is "What's included"
  macros: { protein: number; carbs: number; fat: number; calories: number };
  price: number;              // numeric, used for sorting + display
  unit?: string;              // suffix for plans only, e.g. "/ week"
  availability: "available" | "limited";
  featured?: boolean;         // drives "Featured" sort + landing highlights
};
```

**Enums today:**
- `CategoryId` = `signature | high-protein | low-carb | bulking | cutting | smoothies | plans`
- `GoalId` = `build | lose | maintain | clean`
- `MacroFilterId` = `protein40 | cal500 | carb30`
- `SortId` = `featured | price-asc | price-desc | protein-desc | calories-asc`
- `Availability` = `available | limited`

### 2.2 `src/lib/landing-content.ts` — landing page data (overlaps & diverges)

This file holds the landing-page copy **and a SECOND, divergent meal/plan model.** This is important: the backend should ideally become the single source so the divergence is eliminated.

| Block | Shape | Relationship to products-content |
|---|---|---|
| `featuredMeals` (4) + `menuItems` (6) | `Meal` type | **Different shape** from `Product`: `ingredients` is a **string** (not array), `price` is a **string** like `"$12.90"` (not number), `category` is a **single** string (not array). Same meals, different model. |
| `mealPlans` (4: bulk/cut/balanced/performance) | `MealPlan` type: `bestFor`, `mealsPerDay`, `cadence`, `price` (string), `icon`, `featured?` | **Duplicates** the `kind:"plan"` products in products-content but with extra marketing fields (`bestFor`, `mealsPerDay`) and no macros. |
| `macroGoals` (4) | `MacroGoal`: `mealStyle`, `calorieDirection`, `proteinFocus` | The **same 4 goals** as `GoalId`, enriched with marketing copy. Backend `Goal` entity can optionally carry these fields. |
| `footer` | `description`, `quickLinks`, `contact{address,phone,email}`, `hours[{day,time}]`, `socials[]` | → **Settings/RestaurantInfo** entity. |
| `promoMessages`, `hero`, `benefits`, `howItWorks`, `pickup`, `testimonials`, `faqs`, `finalCta`, `brand`, `navLinks` | Static marketing copy | **Mostly out of scope** for menu management. Could later be CMS-driven; for now treat as static or optional Settings/Content. **`Not confirmed`** whether admin needs to edit landing copy. |
| `PRODUCTS_ROUTE`, `INTRO_COOKIE` | constants | Frontend routing/intro only — not backend concerns. |

> **Recommendation:** the backend Product/Plan entity should be the single source for both pages. The landing page's `featuredMeals` / `menuItems` / `mealPlans` should later be derived from the same API (e.g. `featured=true` products, `type=plan`), retiring the divergent `Meal`/`MealPlan` shapes. The `MacroGoal` marketing fields fold into the `Goal` entity.

### 2.3 Icons
`categoryMeta`, `goalMeta`, `macroFilters` each carry an `icon` field that is a **string key** (e.g. `"dumbbell"`, `"flame"`) resolved by a fixed frontend icon registry (`IconName` union in `landing-content.ts`). **Store only the key string** — never SVG markup. The backend must validate the key against the known `IconName` set (or accept any string and let the frontend fall back). The `build` goal uses a special branded SVG (`BuildMuscleIcon`) handled entirely on the frontend.

### 2.4 Images
- 15 assets in `public/images/` (PNG photos + `logo-red.svg`, `logo-white.png`, two goal SVGs).
- **Each product references exactly ONE image path.** Several products **reuse the same file** (e.g. `meal-chicken.png` is used by 3 products; `hero-meal.png` by several). There is **no per-product image gallery** in the frontend today — the modal "carousel" slides between **different products**, not between multiple images of one product.
- **No `alt` text is stored.** Alt is derived in-component as `` `${name} — ${shortDescription}` ``.

### 2.5 Pricing & currency
- `price` is a **number**; rendered by `formatPrice()` as `` `$${price.toFixed(2)}` `` for meals, or `` `$${price} ${unit}` `` for plans (e.g. `"$129 / week"`). Currency symbol `$` is **hardcoded**; there is no currency field, no tax. **`Not confirmed`: currency (assumed USD), tax handling.**

### 2.6 Availability
- Binary today: `available | limited`. No quantity, no schedule, no per-day logic. `availabilityLabel()` → `"Available today"` / `"Limited today"`.

### 2.7 Leftover non-menu UI (ignore for this phase)
- `ProductCard` has an **"Add"** button → local `setAdded` state for 1.8s, **no cart, no persistence**.
- `ProductCard` has a **favorite heart** → local `useState`, **not persisted**.
- These are UI placeholders only. The detail modal's "Add to order" button was already removed. **No backend is required for these now.**

---

## 3. Domain Entities

Legend: **PK** primary key · **FK** foreign key · `req` required · `opt` optional.

### 3.1 Product
**Purpose:** A menu item — either a single `meal` or a weekly `plan`. The central entity.

| Field | Type | Req/Opt | Default | Validation / Notes |
|---|---|---|---|---|
| `id` | bigint / uuid | req (PK) | auto | Surrogate PK. |
| `slug` | string | req, unique | — | URL/lookup key (the current string `id`, e.g. `grilled-chicken-fuel`). Lowercase, kebab-case, unique. Used by detail fetch. |
| `name` | string | req | — | 1–120 chars. |
| `type` | enum(`meal`,`plan`) | req | `meal` | Maps to current `kind`. |
| `short_description` | string | req | — | ≤ 160 chars (card subtitle, 2-line clamp). |
| `description` | text | req | — | Long copy (modal). Sanitize for XSS on output. |
| `price` | decimal(8,2) (or integer minor units) | req | — | `> 0`. Store as decimal or cents; expose number to match frontend. |
| `currency` | string(3) | opt | `USD` | ISO 4217. **`Not confirmed`.** |
| `price_unit` | string | opt | null | Plan suffix, e.g. `"/ week"`. Typically required when `type=plan`. |
| `availability` | enum(`available`,`limited`,`unavailable`) | req | `available` | Frontend uses `available`/`limited`; add `unavailable` for admin hide-from-menu. |
| `is_featured` | boolean | req | `false` | Drives Featured sort + landing highlights. |
| `is_active` / `status` | boolean or enum(`draft`,`published`,`archived`) | req | `draft` | Publish gate. **Public API returns only published/active.** Distinct from `availability`. |
| `display_order` | integer | req | `0` | Preserves "authored order" used by the stable Featured sort (see §5). |
| `prep_time_min` / `prep_time_max` | integer | opt | null | **`Not confirmed`** if per-product; frontend shows a global "Ready in 15–20 min" only. |
| `meals_per_day` | string | opt | null | Plan-only marketing field (from landing `mealPlans`, e.g. "3 meals / day"). |
| `best_for` | string | opt | null | Plan-only marketing field (e.g. "Best for mass gain"). |
| Macro columns | see §3.4 | req | — | Embedded 1:1 (recommended as columns). |
| `protein_g` | integer | req | — | `>= 0`. |
| `carbs_g` | integer | req | — | `>= 0`. |
| `fat_g` | integer | req | — | `>= 0`. |
| `calories` | integer | req | — | `>= 0`. |
| `meta_title` | string | opt | null | SEO (optional). |
| `meta_description` | string | opt | null | SEO (optional). |
| `created_at` | timestamp | req | now | Audit. |
| `updated_at` | timestamp | req | now | Audit. |
| `deleted_at` | timestamp | opt | null | **Soft delete recommended** (preserve references / restore). |
| `created_by` / `updated_by` | FK admin_user | opt | null | Audit (optional). |

**Relationships:** M:N Category, M:N Goal, M:N Ingredient (or JSON), 1:N ProductImage, M:N or N:1 Badge.
**Indexing/search:** index `slug` (unique), `is_active`, `is_featured`, `availability`, `type`, `display_order`, `price`, `protein_g`, `calories`. Full-text index over `name`, `short_description`, `description`, ingredient text (see §5 search fields).

### 3.2 Category
**Purpose:** Menu grouping; single-select filter. Current set: `signature, high-protein, low-carb, bulking, cutting, smoothies, plans` (+ implicit `all`).

| Field | Type | Req | Notes |
|---|---|---|---|
| `id` | PK | req | |
| `slug` / `code` | string unique | req | Maps to `CategoryId` (e.g. `high-protein`). |
| `label` | string | req | Display, e.g. "High Protein". |
| `icon_key` | string | req | Frontend icon key (e.g. `protein`). Validate against icon set. |
| `display_order` | integer | req | Controls chip order (currently `all` first, then authored order). |
| `is_active` | boolean | req default true | Hide a category without deleting. |
| `created_at`/`updated_at`/`deleted_at` | timestamps | | Soft delete recommended. |

> `all` is a **virtual** filter (means "no category filter"), not a stored row. Don't seed it.

### 3.3 Goal
**Purpose:** Training-goal tags; multi-select filter. Set: `build, lose, maintain, clean`.

| Field | Type | Req | Notes |
|---|---|---|---|
| `id` | PK | req | |
| `slug`/`code` | string unique | req | Maps to `GoalId`. |
| `label` | string | req | "Build Muscle", etc. |
| `icon_key` | string | req | `build` uses branded icon on FE; store `dumbbell`/key anyway. |
| `display_order` | integer | req | Order: build, lose, maintain, clean. |
| `meal_style` | string | opt | From landing `macroGoals` (e.g. "Hearty protein + complex carbs"). |
| `calorie_direction` | string | opt | e.g. "Slight calorie surplus". |
| `protein_focus` | string | opt | e.g. "45–55g protein per meal". |
| `is_active`, timestamps, `deleted_at` | | | Soft delete recommended. |

### 3.4 Macro / Nutrition
**Purpose:** Per-product nutrition. **Recommendation: store as columns on Product** (`protein_g`, `carbs_g`, `fat_g`, `calories`) — it is strictly 1:1 and always shown together. A separate `nutrition` table (1:1) is acceptable but adds a join for no benefit. Validation: all integers `>= 0`. (For plans the frontend notes macros are "per meal" — keep that copy in `description`.)

**MacroFilter** (the 3 quick filters) is **static/seeded config**, not per-product data:

| code | label | predicate (MUST match frontend) |
|---|---|---|
| `protein40` | "40g+ protein" | `protein >= 40` |
| `cal500` | "Under 500 cal" | `calories < 500` |
| `carb30` | "Low carb" | `carbs <= 30` |

### 3.5 Ingredient
**Purpose:** Modal ingredient list (for plans: "What's included" lines). Currently a `string[]` per product (order matters).

**Recommendation (practical):** normalized **Ingredient** table + **product_ingredients** join with `position` for ordering. Benefits: admin reuse/autocomplete, consistent renames.
**Acceptable simpler alternative:** store `ingredients` as an ordered `JSON`/`text[]` column on Product (closest to current shape; less admin power). Pick one; the DTO output is the same ordered string array either way.

| Field (normalized) | Type | Req | Notes |
|---|---|---|---|
| `id` | PK | req | |
| `name` | string unique | req | "Grilled chicken breast". |
| `is_active`, timestamps | | | |
| **join** `product_ingredients` | `product_id` FK, `ingredient_id` FK, `position` int | | Ordered. |

### 3.6 ProductImage
**Purpose:** Product imagery. Frontend uses **one** image today, but the admin spec asks for upload/reorder/set-primary → model as **one-to-many** now (future-proof, low cost).

| Field | Type | Req | Notes |
|---|---|---|---|
| `id` | PK | req | |
| `product_id` | FK | req | |
| `url` | string | req | Public URL (or storage key resolved to URL). |
| `alt_text` | string | opt | Falls back to `name — short_description` if null (current FE behavior). |
| `is_primary` | boolean | req default false | Exactly one primary per product (enforce). The card/list/modal use the primary. |
| `display_order` | integer | req | For gallery ordering. |
| `width` / `height` | integer | opt | Helps `next/image` avoid layout shift; recommend 1200×900 / 4:3. |
| `mime_type` / `size_bytes` | | opt | Validation/audit. |
| timestamps, `deleted_at` | | | |

### 3.7 Badge / Tag
**Purpose:** The single uppercase pill on the card/modal (`product.tag`, e.g. "Bestseller", "Omega-3", "Weekly plan"). Today it's a freeform string, **one per product**.

**Recommendation:** a **Badge** table for reuse/consistency, with Product → **one primary badge** (the pill shown). Provide an optional M:N `product_badges` join only if multiple badges per product become a requirement (**`Not confirmed`** — UI shows one).

| Field | Type | Req | Notes |
|---|---|---|---|
| `id` | PK | req | |
| `slug` | string unique | req | e.g. `bestseller`. |
| `label` | string | req | "Bestseller". Rendered uppercase by CSS — store normal case. |
| `is_active`, timestamps | | | |

Product holds `badge_id` (nullable FK) → the pill. (Simplest acceptable alternative: keep `tag` as a plain string column on Product.)

### 3.8 Mapping / join entities
- `product_categories` (`product_id`, `category_id`) — **M:N, required** (products have multiple categories; data confirms it).
- `product_goals` (`product_id`, `goal_id`) — **M:N, required**.
- `product_ingredients` (`product_id`, `ingredient_id`, `position`) — M:N ordered (if normalized).
- `product_badges` (`product_id`, `badge_id`) — optional M:N (future).
Add composite indexes on each join (`product_id`, and the other FK) for filter performance.

### 3.9 MealPlan
**Purpose:** Weekly subscription products (`type=plan`). **Recommendation: do NOT create a separate table** — model plans as Products with `type='plan'` + the plan-only nullable fields (`price_unit`, `meals_per_day`, `best_for`). This matches the current single `products` array (which mixes meals and plans) and the landing `mealPlans`. Macros on a plan represent "per meal" (keep in copy). If plans later diverge significantly (multiple tiers, billing cadence), extract then.

### 3.10 PriceVariant (future / Not confirmed)
**Purpose:** Sizes/options with different prices. **None exist in the frontend today** (single `price` + optional `unit`). Include the design but mark **`Not confirmed`** — do not build unless the client confirms sizes (e.g. Regular/Large) are needed.

| Field | Type | Notes |
|---|---|---|
| `id` PK, `product_id` FK | | |
| `label` | string | "Regular", "Large", "Double protein". |
| `price` | decimal | per variant. |
| `is_default` | boolean | which price shows by default. |
| `display_order` | integer | |

### 3.11 AdminUser / Auth
**Purpose:** Authenticate the dashboard. Required (admin must log in).

| Field | Type | Req | Notes |
|---|---|---|---|
| `id` PK | | req | |
| `email` | string unique | req | Login. |
| `password_hash` | string | req | bcrypt/argon2 — never plaintext. |
| `name` | string | opt | |
| `role` | enum(`admin`,`editor`,…) | req default `admin` | Role support optional now; design for it (§12). **`Not confirmed`** if multiple roles needed. |
| `is_active` | boolean | req | Disable access. |
| `last_login_at`, timestamps | | | |

### 3.12 Settings / RestaurantInfo
**Purpose:** The non-product content the menu/footer renders: header address strip (`productsHeader.address`), footer `contact` (address/phone/email), `hours[]`, `socials[]`, and optionally `promoMessages`. Today all placeholders ("[Your Gym Name]", "+1 (000) 000-0000", "hello@barbellkitchen.example").

**Recommendation:** a single-row **settings** table (or typed key/value). Single location/branch today. Fields: `restaurant_name`, `address`, `phone`, `email`, `hours` (JSON: array of `{day, time}`), `social_links` (JSON), `promo_messages` (JSON, optional), `menu_header_title`, `menu_header_tagline`. **`Not confirmed`: multi-branch** (see §18).

---

## 4. Recommended Database Model

Practical, normalized-where-it-pays, not over-engineered. Use your stack's conventions (this doc is DB-agnostic; examples lean relational/PostgreSQL).

### 4.1 Tables

```
admin_users(id PK, email UNIQUE, password_hash, name, role, is_active,
            last_login_at, created_at, updated_at)

categories(id PK, slug UNIQUE, label, icon_key, display_order,
           is_active, created_at, updated_at, deleted_at)

goals(id PK, slug UNIQUE, label, icon_key, display_order,
      meal_style, calorie_direction, protein_focus,
      is_active, created_at, updated_at, deleted_at)

badges(id PK, slug UNIQUE, label, is_active, created_at, updated_at, deleted_at)

ingredients(id PK, name UNIQUE, is_active, created_at, updated_at, deleted_at)

products(id PK, slug UNIQUE, name, type ENUM('meal','plan'),
         short_description, description,
         price NUMERIC(8,2), currency CHAR(3) DEFAULT 'USD', price_unit NULL,
         protein_g INT, carbs_g INT, fat_g INT, calories INT,
         availability ENUM('available','limited','unavailable') DEFAULT 'available',
         status ENUM('draft','published','archived') DEFAULT 'draft',
         is_featured BOOL DEFAULT false,
         display_order INT DEFAULT 0,
         meals_per_day NULL, best_for NULL,
         prep_time_min NULL, prep_time_max NULL,
         badge_id FK->badges NULL,
         meta_title NULL, meta_description NULL,
         created_by FK->admin_users NULL, updated_by FK->admin_users NULL,
         created_at, updated_at, deleted_at NULL)

product_images(id PK, product_id FK->products, url, alt_text NULL,
               is_primary BOOL DEFAULT false, display_order INT,
               width NULL, height NULL, mime_type NULL, size_bytes NULL,
               created_at, updated_at, deleted_at NULL)

product_categories(product_id FK, category_id FK, PRIMARY KEY(product_id, category_id))
product_goals(product_id FK, goal_id FK, PRIMARY KEY(product_id, goal_id))
product_ingredients(product_id FK, ingredient_id FK, position INT,
                    PRIMARY KEY(product_id, ingredient_id))

-- optional / future
price_variants(id PK, product_id FK, label, price NUMERIC, is_default BOOL, display_order INT)
product_badges(product_id FK, badge_id FK, PRIMARY KEY(product_id, badge_id))

settings(id PK, restaurant_name, address, phone, email,
         hours JSON, social_links JSON, promo_messages JSON,
         menu_header_title, menu_header_tagline, updated_at)
```

### 4.2 Keys, slugs, ordering, timestamps
- **PKs:** surrogate `bigint` or `uuid`. **Slugs:** unique, lowercase kebab-case, generated from `name` (with collision suffixing); the current string ids become the seed slugs.
- **FKs:** all relations enforced; join tables use composite PKs. `ON DELETE` → prefer **soft delete** (`deleted_at`) over cascade so historical references survive.
- **Display order:** `display_order` on products, categories, goals, images — preserves "authored order" (the Featured sort relies on it; see §5).
- **Timestamps:** `created_at` / `updated_at` everywhere; `deleted_at` for soft delete on products, categories, goals, ingredients, badges, images.

### 4.3 Image table strategy
One-to-many `product_images`; exactly one `is_primary=true` per product (enforce in app logic / partial unique index). The public list DTO sends only the primary; the detail DTO can send the full ordered gallery (even if FE shows one today).

### 4.4 Normalization guidance
- **Normalize** categories, goals (clear shared vocab + filters), and badges (small reused set).
- **Ingredients:** normalize if the admin wants reuse/autocomplete; otherwise an ordered JSON array on the product is acceptable. Don't agonize.
- **Macros:** keep as Product columns (do not over-engineer into a table).
- **Don't** duplicate label strings across products — reference category/goal/badge rows by FK.

### 4.5 Indexes for search/filter
- `products`: `slug` (unique), `status`, `availability`, `type`, `is_featured`, `display_order`, `price`, `protein_g`, `calories`.
- Full-text index covering `name + short_description + description` (+ joined ingredient names) for search.
- Join tables: index both FK directions.

---

## 5. Public API Requirements

Base path suggestion: `/api/v1`. All public endpoints are **read-only, unauthenticated, GET**, and return **only `status='published'`** products. JSON only. Use the **Product Response DTO** (§8).

> **Filtering parity is mandatory.** The frontend logic in `filterAndSortProducts` is the spec. Reproduce it exactly:
> - **Category:** single-select; product matches if its categories include the selected category. `all`/absent = no filter.
> - **Goals:** multi-select, **AND** logic — product must include **every** selected goal (`goals.every(g => product.goals.includes(g))`).
> - **Macros:** multi-select, **AND** logic — product must satisfy **every** selected macro predicate: `protein40` → `protein >= 40`; `cal500` → `calories < 500`; `carb30` → `carbs <= 30`.
> - **Search (`q`):** case-insensitive substring match against the concatenation of: `name`, `short_description`, `description`, ingredient names (joined), category **labels**, and goal **labels**.
> - **Sort:** `featured` (default) = `is_featured` first, then **authored order** (`display_order`) — stable; `price-asc`; `price-desc`; `protein-desc` (by `protein_g` desc); `calories-asc` (by `calories` asc).
> - **Empty state:** a valid query with zero matches returns `200` with an empty `data` array (not 404).

### 5.1 `GET /menu/products` — list/browse
**Query params:**

| Param | Type | Notes |
|---|---|---|
| `category` | string (category slug) | single; omit or `all` = no filter. |
| `goals` | csv or repeated | e.g. `goals=build,lose`. AND logic. |
| `macros` | csv or repeated | values: `protein40,cal500,carb30`. AND logic. |
| `q` | string | search term. |
| `sort` | enum | `featured`(default)`|price-asc|price-desc|protein-desc|calories-asc`. |
| `type` | enum | optional `meal|plan` (FE doesn't pass this but useful). |
| `page` | int | 1-based (default 1). |
| `pageSize` | int | default 10 (mirrors `INITIAL_VISIBLE_PRODUCTS`); batch 10 (`PRODUCTS_BATCH_SIZE`). Cursor alternative acceptable. |

**Pagination / load-more:** the frontend loads 10, then 10-more via IntersectionObserver + button. Mirror with offset pagination (`page`/`pageSize`) returning `meta` so the client can implement "Show N more meals". Cursor pagination is an acceptable scale-up.

> **Phasing note:** A valid **Phase-1** implementation may ignore filter params and return the full published list, letting the existing client keep filtering/sorting/paging in memory (it already does, instantly, for a small catalog). **Phase-2** moves filter/search/sort/pagination server-side using the contract above. Either way, the response DTO is identical.

**Response `200`:**
```json
{
  "data": [
    {
      "id": 1,
      "slug": "grilled-chicken-fuel",
      "name": "Grilled Chicken Fuel",
      "type": "meal",
      "badge": "Bestseller",
      "shortDescription": "Grilled chicken, jasmine rice, broccoli & avocado.",
      "image": "https://cdn.barbellkitchen.example/products/grilled-chicken-fuel/primary.webp",
      "primaryImage": { "url": "https://.../primary.webp", "alt": "Grilled Chicken Fuel — Grilled chicken, jasmine rice, broccoli & avocado." },
      "categories": [{ "slug": "signature", "label": "Signature Bowls" }, { "slug": "high-protein", "label": "High Protein" }],
      "goals": [{ "slug": "build", "label": "Build Muscle" }, { "slug": "maintain", "label": "Maintain" }],
      "macros": { "protein": 49, "carbs": 52, "fat": 14, "calories": 540 },
      "price": 12.9,
      "currency": "USD",
      "priceUnit": null,
      "availability": "available",
      "featured": true,
      "displayOrder": 1
    }
  ],
  "meta": { "total": 16, "page": 1, "pageSize": 10, "hasMore": true, "appliedSort": "featured" }
}
```
**Statuses:** `200` ok · `400` invalid query param (bad sort/macro value) · `500`.

### 5.2 `GET /menu/products/{slug}` — detail (modal)
Returns the full **detail DTO** (§8) including `description`, ordered `ingredients`, all categories/goals, badge, macros, and image gallery.
**Statuses:** `200` · `404` unknown/unpublished slug · `500`.

### 5.3 `GET /menu/categories`
```json
{ "data": [ { "slug": "signature", "label": "Signature Bowls", "iconKey": "star", "displayOrder": 1 } ] }
```
Returns active categories ordered by `display_order`. (Frontend prepends a virtual "All".)

### 5.4 `GET /menu/goals`
```json
{ "data": [ { "slug": "build", "label": "Build Muscle", "iconKey": "dumbbell", "displayOrder": 1,
              "mealStyle": "Hearty protein + complex carbs", "calorieDirection": "Slight calorie surplus", "proteinFocus": "45–55g protein per meal" } ] }
```

### 5.5 `GET /menu/filters` — filter metadata (one call)
Bundles everything the filter UI needs so the client doesn't make 3 calls:
```json
{
  "categories": [ { "slug": "all", "label": "All", "iconKey": "spark" }, { "slug": "high-protein", "label": "High Protein", "iconKey": "protein" } ],
  "goals":      [ { "slug": "build", "label": "Build Muscle", "iconKey": "dumbbell" } ],
  "macros":     [ { "id": "protein40", "label": "40g+ protein", "iconKey": "protein" },
                  { "id": "cal500", "label": "Under 500 cal", "iconKey": "flame" },
                  { "id": "carb30", "label": "Low carb", "iconKey": "leaf" } ],
  "sortOptions":[ { "id": "featured", "label": "Featured" }, { "id": "price-asc", "label": "Price: Low to High" },
                  { "id": "price-desc", "label": "Price: High to Low" }, { "id": "protein-desc", "label": "Highest Protein" },
                  { "id": "calories-asc", "label": "Lowest Calories" } ]
}
```

### 5.6 `GET /menu/featured` (optional)
Convenience for the landing page's featured meals/plans. Equivalent to `GET /menu/products?featured=true`. **`Not confirmed`** whether landing should consume the API now.

### 5.7 `GET /menu/settings` — header strip + footer
```json
{
  "menuHeader": { "title": "Performance Menu", "tagline": "Fresh macro-counted meals prepared inside your gym.", "address": "Inside [Your Gym Name], [Street Address]",
                  "pills": [ { "iconKey": "dumbbell", "label": "Inside Your Gym" } ] },
  "contact": { "address": "…", "phone": "…", "email": "…" },
  "hours": [ { "day": "Mon – Fri", "time": "6:00 AM – 10:00 PM" } ],
  "socials": ["Instagram", "TikTok", "YouTube", "X"]
}
```

---

## 6. Admin API Requirements

Base path: `/api/v1/admin`. **All require auth** (Bearer token / session). All write endpoints validate input (§14) and return the **admin DTO** (which includes draft items, audit fields, all images, and inactive relations — kept separate from public DTOs). Use a consistent error envelope (§14).

### 6.1 Auth
| Method | Route | Body | Response | Notes |
|---|---|---|---|---|
| POST | `/auth/login` | `{ email, password }` | `{ token, expiresIn, user }` | `401` on bad creds; rate-limited. |
| POST | `/auth/refresh` | `{ refreshToken }` | `{ token, expiresIn }` | If using refresh tokens. |
| POST | `/auth/logout` | — | `204` | Invalidate session/refresh. |
| GET | `/auth/me` | — | `{ user }` | Current admin. |

### 6.2 Products
| Method | Route | Purpose |
|---|---|---|
| GET | `/products` | List (paginated, includes drafts; filter by `status`, `category`, `q`). |
| GET | `/products/{id}` | Full admin detail (all fields + relations + images). |
| POST | `/products` | Create (DTO §7). `201`. |
| PATCH | `/products/{id}` | Partial update. `200`. |
| DELETE | `/products/{id}` | Soft delete. `204`. |
| POST | `/products/{id}/activate` | Set `status=published`. `200`. |
| POST | `/products/{id}/deactivate` | Set `status=draft`/`archived`. `200`. |
| PATCH | `/products/{id}/availability` | Quick set `{ availability }`. `200`. |
| PATCH | `/products/reorder` | `{ items: [{id, displayOrder}] }` bulk order. `200`. |

**Relation management** (either embed in the product PATCH body as full arrays, or expose sub-routes — pick one and document it):
- `PUT /products/{id}/categories` `{ categorySlugs: [...] }`
- `PUT /products/{id}/goals` `{ goalSlugs: [...] }`
- `PUT /products/{id}/ingredients` `{ ingredients: ["...", "..."] }` (ordered)
- `PUT /products/{id}/badge` `{ badgeSlug }` (or null)

> Recommended: accept the **full product DTO with relation arrays** on create/update (simplest for the admin form), and additionally offer the lightweight `availability`/`reorder` endpoints for quick edits.

### 6.3 Images
| Method | Route | Body | Notes |
|---|---|---|---|
| POST | `/products/{id}/images` | `multipart/form-data` (`file`, `altText?`) | Validate signature/MIME/size (§9). `201` returns image record. |
| PATCH | `/products/{id}/images/reorder` | `{ items: [{imageId, displayOrder}] }` | Drag/drop ordering. |
| PATCH | `/products/{id}/images/{imageId}` | `{ altText?, isPrimary? }` | Set primary / edit alt. Setting primary clears others. |
| DELETE | `/products/{id}/images/{imageId}` | — | Remove file + record. `204`. |

### 6.4 Categories / Goals / Ingredients / Badges (same CRUD shape each)
| Method | Route | Notes |
|---|---|---|
| GET | `/categories` (`/goals`, `/ingredients`, `/badges`) | List incl. inactive. |
| POST | same | Create. `201`. Validate unique slug/name. |
| PATCH | `/{id}` | Update. `200`. |
| DELETE | `/{id}` | Soft delete. **`409`** if in use and you choose to block deletion (or reassign). |

### 6.5 Settings
| Method | Route | Notes |
|---|---|---|
| GET | `/settings` | Current restaurant info. |
| PUT | `/settings` | Update address/phone/email/hours/socials/header copy. `200`. |

### 6.6 Price variants (only if confirmed)
`GET/POST/PATCH/DELETE /products/{id}/variants` — build only if sizes are confirmed (§3.10).

**Standard error response** for all admin endpoints: see §14.

---

## 7. Product Create / Update DTO (request)

Single body usable for `POST` (create) and `PATCH` (partial). Relations passed as arrays of slugs/strings; images uploaded separately (§6.3) or referenced by id.

```json
{
  "name": "Grilled Chicken Fuel",
  "slug": "grilled-chicken-fuel",            // optional on create (auto from name); immutable-ish on update
  "type": "meal",                             // "meal" | "plan"
  "shortDescription": "Grilled chicken, jasmine rice, broccoli & avocado.",
  "description": "Our signature everyday plate: char-grilled chicken breast over fluffy jasmine rice…",

  "categorySlugs": ["signature", "high-protein"],
  "goalSlugs": ["build", "maintain"],
  "ingredients": ["Grilled chicken breast", "Jasmine rice", "Broccoli", "Avocado", "Olive oil"],
  "badgeSlug": "bestseller",                  // single pill; nullable

  "macros": { "protein": 49, "carbs": 52, "fat": 14, "calories": 540 },

  "price": 12.90,
  "currency": "USD",
  "priceUnit": null,                          // e.g. "/ week" for plans
  "priceVariants": [],                        // optional / future

  "availability": "available",                // available | limited | unavailable
  "status": "published",                      // draft | published | archived
  "isFeatured": true,
  "displayOrder": 1,

  "prepTimeMin": null,                         // optional
  "prepTimeMax": null,
  "mealsPerDay": null,                         // plan-only marketing
  "bestFor": null,                             // plan-only marketing

  "metaTitle": null,                           // SEO optional
  "metaDescription": null,

  "imageIds": [12, 13],                        // existing uploaded images to attach (order = displayOrder)
  "primaryImageId": 12
}
```

**Validation highlights:** `name` req (1–120); `slug` unique kebab-case; `type` in enum; `shortDescription` ≤160; `price` > 0; macros integers ≥0; `categorySlugs` must reference existing active categories (≥1 recommended); `goalSlugs` reference existing goals; `availability`/`status` in enum; if `type=plan` then `priceUnit` recommended required. Reject unknown fields or ignore (document which).

---

## 8. Product Response DTO

Two shapes — **list** (light, for the grid) and **detail** (full, for the modal). Field names mirror the current frontend `Product` type to minimize integration work (`shortDescription`, `macros`, `featured`, etc.). Map DB `badge`→`tag` if you want byte-for-byte parity with the current `Product.tag`; this doc uses `badge` and notes the alias.

### 8.1 List DTO (`GET /menu/products` items)
See §5.1 example. Minimum fields: `id, slug, name, type, badge (a.k.a tag), shortDescription, image (primary url), categories[], goals[], macros{protein,carbs,fat,calories}, price, currency, priceUnit, availability, featured, displayOrder`.

### 8.2 Detail DTO (`GET /menu/products/{slug}`)
```json
{
  "id": 10,
  "slug": "egg-protein-bowl",
  "name": "Egg Protein Bowl",
  "type": "meal",
  "badge": "High Protein",
  "shortDescription": "Chicken, salmon, soft egg, rice, broccoli & avocado.",
  "description": "The loaded signature bowl: grilled chicken and salmon with a soft-boiled egg, jasmine rice, broccoli and avocado — maximum protein in one plate.",
  "images": [
    { "id": 31, "url": "https://cdn…/egg-protein-bowl/1.webp", "alt": "Egg Protein Bowl — …", "isPrimary": true, "displayOrder": 1, "width": 1200, "height": 900 }
  ],
  "primaryImage": { "url": "https://cdn…/egg-protein-bowl/1.webp", "alt": "Egg Protein Bowl — …" },
  "categories": [ { "slug": "high-protein", "label": "High Protein" }, { "slug": "signature", "label": "Signature Bowls" } ],
  "goals": [ { "slug": "build", "label": "Build Muscle", "iconKey": "dumbbell" }, { "slug": "maintain", "label": "Maintain", "iconKey": "scale" } ],
  "ingredients": ["Grilled chicken", "Salmon", "Soft-boiled egg", "Jasmine rice", "Broccoli", "Avocado"],
  "macros": { "protein": 55, "carbs": 48, "fat": 24, "calories": 640 },
  "price": 16.90,
  "currency": "USD",
  "priceUnit": null,
  "availability": "available",
  "featured": true,
  "displayOrder": 10,
  "mealsPerDay": null,
  "bestFor": null
}
```
> **Plan example difference:** `type:"plan"`, `priceUnit:"/ week"`, `ingredients` reads as "What's included" lines (e.g. "3 meals / day", "Nutritionist approved"), `mealsPerDay`/`bestFor` populated.

---

## 9. Image Upload Requirements

| Requirement | Spec |
|---|---|
| **Accepted formats** | `.png`, `.webp`, `.jpg/.jpeg`. (Frontend optimizes via `next/image`; `.webp`/`.png` preferred.) Block SVG for product photos. |
| **Recommended dimensions** | **1200 × 900**, **4:3 landscape** (matches card `aspect-[4/3]` and modal). Reject < ~800×600. |
| **Max file size** | ~5 MB (configurable). Reject larger with `422`. |
| **Storage strategy** | Object storage (S3/GCS/Cloud) or a dedicated `/uploads` volume — **not** the Next.js `public/` folder in production. Store key in DB; serve via CDN URL. Add the host to `next.config.ts → images.remotePatterns` (frontend task, later). |
| **Generated URLs** | Stable, content-hashed, ideally immutable + long `Cache-Control`. |
| **Thumbnails / resized** | Recommended: generate a thumbnail (e.g. 400×300) + the 1200×900 master. (Optional — `next/image` can also resize from one master.) |
| **Primary image** | Exactly one `is_primary` per product; set-primary endpoint clears others. |
| **Alt text** | Optional field; FE falls back to `name — shortDescription`. |
| **Deletion / replacement** | Delete removes storage object + DB row; replacing = upload new + set primary + delete old (or PATCH). |
| **Validation / security** | **Do not trust the file extension or client MIME.** Validate the **magic-number/file signature**; re-encode/normalize via an image library to strip malicious payloads/EXIF; enforce size + dimension limits; randomized stored filenames; **auth-protected** endpoint; rate-limit; scan if available. Reject anything that isn't a real raster image. |

---

## 10. Admin Panel Functional Requirements

Pages / modules:

1. **Dashboard overview** — counts (total products, published vs draft, limited/unavailable), recent edits, quick links. (Lightweight; can be minimal v1.)
2. **Products list** — searchable, paginated table; columns: thumbnail, name, type, categories, price, availability, status, featured, updated_at; row actions (edit, activate/deactivate, quick-availability, delete with confirm).
3. **Product create/edit form** — see fields below.
4. **Categories management** — list/create/edit/delete; label, slug, icon key, display order, active toggle.
5. **Goals management** — same + marketing fields (mealStyle/calorieDirection/proteinFocus).
6. **Ingredients management** — list/create/edit/merge (if normalized).
7. **Tags/Badges management** — list/create/edit/delete.
8. **Media / images** — per-product gallery management (upload, reorder, set primary, alt, delete).
9. **Availability controls** — quick toggle from the list (no full edit needed).
10. **Settings** — restaurant name, address, phone, email, hours, socials, menu header copy.

**Product form fields & UX:**
- **Basic:** name, slug (auto, editable), type (meal/plan), shortDescription (counter ≤160), description (rich-but-sanitized or plain textarea), badge, featured toggle, display order.
- **Nutrition:** 4 numeric inputs (protein/carbs/fat/calories) with units; integers ≥0.
- **Pricing:** price (+ currency), priceUnit (shown when type=plan); price variants UX only if confirmed.
- **Images:** drag/drop uploader, thumbnail previews, drag-reorder, "set primary" radio, alt-text input, delete with confirm.
- **Relations:** multi-select for **categories** (≥1), multi-select for **goals**, ordered ingredient editor (add/remove/reorder chips), badge picker.
- **Availability/Status:** availability select; status (draft/published) with **active/inactive toggle**; optional **Save draft** vs **Publish**.
- **Live preview card** — render the product card/list-row + modal preview using the same DTO so the admin sees the public result before publishing.
- **Validation:** inline per-field errors mapped from the API error envelope (§14).

---

## 11. Admin Panel UX Recommendations

- **Searchable products table** with debounced search + **filters by category and status** (and type/availability).
- **Quick-edit availability** directly in the row (optimistic update + toast).
- **Image preview** thumbnails everywhere; **drag/drop ordering** for the gallery; clear "Primary" badge.
- **Confirmation dialogs** for all destructive actions (delete product/category/goal/image), with the item name echoed.
- **Form sections / tabs:** Basic info · Nutrition · Pricing · Images · Categories/Goals/Tags · Availability — reduces a long scroll.
- **Responsive admin layout** (sidebar nav + content); works on tablet.
- **Empty states** (no products yet, no images yet) with a clear primary action.
- **Loading / skeleton states** on tables, forms, and image grids; disable submit while saving (`aria-busy`).
- **Error handling:** surface field errors inline + a top-level toast for server errors; never lose unsaved form data on a failed save.
- **Slug helper:** auto-generate from name, warn on collision, lock after publish (to keep public URLs stable).
- **Unsaved-changes guard** when navigating away from a dirty form.

---

## 12. Security Requirements

- **Admin authentication** required for the whole admin API + panel. Bearer JWT or server session; short-lived access token (+ refresh) or secure HTTP-only cookie. Hash passwords with **bcrypt/argon2**.
- **Roles/permissions:** design for roles (`admin`, `editor`) even if only one ships now; gate destructive ops behind admin role. **`Not confirmed`** which roles are needed.
- **Protected admin routes:** every `/admin/*` endpoint checks a valid token + active user; reject with `401`/`403`.
- **No public write endpoints.** Public API is strictly read-only GET.
- **Upload validation:** signature/MIME validation, size + dimension limits, re-encode, random filenames, auth + rate-limit on the upload route (§9).
- **Rate limiting** on `/auth/login` (brute-force) and on uploads.
- **CORS:** allow only the known frontend origin(s); credentials per token strategy.
- **Input validation everywhere** (schema validation on every body/param); reject/normalize unknown fields.
- **XSS protection for descriptions:** sanitize rich text on input and/or escape on output; the frontend renders text content (no `dangerouslySetInnerHTML` today) — keep it that way. If rich text is allowed, whitelist tags.
- **SQL/NoSQL injection:** parameterized queries / ORM only.
- **Safe error responses:** never leak stack traces, SQL, or internal paths in production; consistent envelope (§14); log details server-side with a correlation id.
- **Transport:** HTTPS only; secure cookie flags (`HttpOnly`, `Secure`, `SameSite`).

---

## 13. Performance Requirements

- **Pagination / load-more:** offset (`page`/`pageSize`, default 10) or cursor; mirror `INITIAL_VISIBLE_PRODUCTS=10` / `PRODUCTS_BATCH_SIZE=10` so the existing UX maps cleanly.
- **Indexes:** as in §4.5 (slug, status, filter columns, FT search, join FKs).
- **Avoid N+1:** eager-load categories/goals/ingredients/primary image for list responses (single batched query or join + aggregation); never per-row queries in a loop.
- **List vs detail split:** list DTO sends only the **primary image** + label-only relations; the full gallery + long description load on detail. Keeps list payloads small.
- **Caching:** public menu + filter metadata change rarely → HTTP cache headers / ISR-friendly responses (the frontend doc `docs/products-performance.md` recommends server-side fetch with `revalidate` + tag-based invalidation on admin save). Keep **price/availability** fresh (short TTL or invalidate-on-write).
- **Image optimization:** serve content-hashed, CDN-cached, `immutable` URLs at the recommended 1200×900/4:3; let `next/image` handle responsive `sizes` + lazy loading (already implemented).
- **Response size:** avoid overfetching — don't return drafts/inactive relations on public endpoints; paginate.
- **Cache invalidation hook:** on admin create/update/delete/publish, expose/trigger a revalidation signal (webhook or tag) so the public site refreshes without a full rebuild.

---

## 14. Error Response Standard

Consistent envelope for all endpoints (especially admin writes):

```json
{
  "message": "Validation failed",
  "errors": {
    "name": ["Name is required"],
    "price": ["Price must be greater than zero"],
    "categorySlugs": ["At least one valid category is required"]
  }
}
```
For non-validation errors, `errors` may be omitted; always include a human `message` and (optionally) an internal `code` + `correlationId`.

**Status codes:**

| Code | Use |
|---|---|
| `200` | OK (GET, update). |
| `201` | Created (POST product/image/category…). |
| `204` | No content (delete, logout). |
| `400` | Malformed request / invalid query param (e.g. bad `sort`/`macro` value). |
| `401` | Missing/invalid auth. |
| `403` | Authenticated but not permitted (role). |
| `404` | Resource/slug not found (or unpublished on public detail). |
| `409` | Conflict (duplicate slug; delete blocked because in use). |
| `422` | Validation failed (body fields) / unprocessable upload (too big, wrong type). |
| `500` | Server error (no internal details leaked). |

---

## 15. Suggested API Contract Summary Table

| Area | Method | Endpoint | Purpose | Auth | Used by |
|---|---|---|---|---|---|
| Menu | GET | `/menu/products` | List/filter/search/sort/paginate | No | Public |
| Menu | GET | `/menu/products/{slug}` | Product detail (modal) | No | Public |
| Menu | GET | `/menu/categories` | Category list | No | Public |
| Menu | GET | `/menu/goals` | Goal list | No | Public |
| Menu | GET | `/menu/filters` | Filter+sort metadata bundle | No | Public |
| Menu | GET | `/menu/featured` | Featured products (landing) | No | Public |
| Menu | GET | `/menu/settings` | Header strip + footer info | No | Public |
| Auth | POST | `/admin/auth/login` | Login → token | No | Admin |
| Auth | POST | `/admin/auth/refresh` | Refresh token | No* | Admin |
| Auth | POST | `/admin/auth/logout` | Logout | Yes | Admin |
| Auth | GET | `/admin/auth/me` | Current user | Yes | Admin |
| Products | GET | `/admin/products` | List (incl. drafts) | Yes | Admin |
| Products | GET | `/admin/products/{id}` | Admin detail | Yes | Admin |
| Products | POST | `/admin/products` | Create | Yes | Admin |
| Products | PATCH | `/admin/products/{id}` | Update | Yes | Admin |
| Products | DELETE | `/admin/products/{id}` | Soft delete | Yes | Admin |
| Products | POST | `/admin/products/{id}/activate` | Publish | Yes | Admin |
| Products | POST | `/admin/products/{id}/deactivate` | Unpublish | Yes | Admin |
| Products | PATCH | `/admin/products/{id}/availability` | Quick availability | Yes | Admin |
| Products | PATCH | `/admin/products/reorder` | Bulk display order | Yes | Admin |
| Images | POST | `/admin/products/{id}/images` | Upload image | Yes | Admin |
| Images | PATCH | `/admin/products/{id}/images/reorder` | Reorder gallery | Yes | Admin |
| Images | PATCH | `/admin/products/{id}/images/{imageId}` | Set primary / alt | Yes | Admin |
| Images | DELETE | `/admin/products/{id}/images/{imageId}` | Delete image | Yes | Admin |
| Categories | GET/POST/PATCH/DELETE | `/admin/categories[/{id}]` | CRUD | Yes | Admin |
| Goals | GET/POST/PATCH/DELETE | `/admin/goals[/{id}]` | CRUD | Yes | Admin |
| Ingredients | GET/POST/PATCH/DELETE | `/admin/ingredients[/{id}]` | CRUD | Yes | Admin |
| Badges | GET/POST/PATCH/DELETE | `/admin/badges[/{id}]` | CRUD | Yes | Admin |
| Settings | GET/PUT | `/admin/settings` | Restaurant info | Yes | Admin |
| Variants | GET/POST/PATCH/DELETE | `/admin/products/{id}/variants` | Price variants (if confirmed) | Yes | Admin |

\* `/auth/refresh` uses the refresh token rather than the access token.

---

## 16. Backend Developer Checklist

- [ ] **Database migrations** for all tables in §4 (+ join tables, indexes, soft-delete columns).
- [ ] **Seed data:** categories (`signature, high-protein, low-carb, bulking, cutting, smoothies, plans`), goals (`build, lose, maintain, clean`), macro filters (static), sort options (static), badges (from current `tag` values), and the 16 current products (migrate from `products-content.ts`) so public output matches today.
- [ ] **Admin auth** (login, hashing, token/session, refresh, `me`, rate limiting).
- [ ] **Product CRUD** (+ activate/deactivate, availability quick-edit, reorder) with relation handling (categories/goals/ingredients/badge).
- [ ] **Image upload** (signature validation, resize/thumbnail, primary/reorder/alt/delete, storage + CDN).
- [ ] **Public menu endpoints** (`/menu/products`, `/{slug}`, `/categories`, `/goals`, `/filters`, `/settings`, optional `/featured`).
- [ ] **Filter/search/sort** parity with §5 (AND logic for goals/macros, exact macro predicates, search fields, Featured = featured-first then display_order).
- [ ] **Pagination** (page/pageSize default 10) with `meta.hasMore`.
- [ ] **Error envelope** + status codes (§14) applied consistently.
- [ ] **Swagger / OpenAPI** documentation for every endpoint with request/response examples.
- [ ] **Tests:** unit (filter/sort logic, validation), integration (CRUD + auth + upload), and a parity test that the public list matches the current 16 products.
- [ ] **Cache-invalidation hook** (tag/webhook) fired on admin writes for the public site.
- [ ] **Deployment notes:** env vars (DB URL, JWT secret, storage creds, allowed CORS origin, API base URL), HTTPS, storage bucket, backups, log/correlation ids.

---

## 17. Frontend Integration Notes (later phase — not now)

- **Replace hardcoded data:** swap `src/lib/products-content.ts`'s static `products` array for server-side fetches in `app/products/page.tsx` (Server Component), passing data into the existing `ProductMenuShell` as props. Keep the shell client-only for interaction. Retire the divergent landing `Meal`/`MealPlan` shapes by sourcing them from the same API.
- **Keep types aligned:** the API DTOs should map 1:1 to the existing `Product` type (`shortDescription`, `macros`, `featured`, etc.). If the DTO uses `badge`, alias it to the existing `tag` field (or rename `tag`→`badge` in one place). Keep `filterAndSortProducts`' contract stable; if filtering moves server-side, translate the same params.
- **Fetch strategy:** server-fetch the catalog with `revalidate` (ISR) per `docs/products-performance.md`; tag-based revalidation on admin save; keep price/availability fresh (short TTL or `no-store` split fetch).
- **Loading/skeleton:** the page already ships `ProductCardSkeleton` / `ProductListItemSkeleton` and progressive batching — reuse them for network states (Suspense fallback / pending fetch).
- **Error states:** add a graceful menu-failed state (the current empty state is for "no matches", not "fetch failed" — add a distinct one).
- **Image paths:** DTO returns absolute CDN URLs; add the image host to `next.config.ts → images.remotePatterns`. Keep `object-cover` + `aspect-[4/3]` + `sizes`. (`dangerouslyAllowSVG` is only needed for the brand logo/goal SVGs — keep it for those, not product photos.)
- **Env:** introduce `NEXT_PUBLIC_API_BASE_URL` (or server-only `API_BASE_URL`) — do not hardcode the API host.

---

## 18. Missing Information / Questions to Confirm

All marked **`Not confirmed`** in the frontend — confirm with client/backend before building the affected parts:

1. **Final prices & macros** — current values look like sample/placeholder data; confirm real numbers before seeding production.
2. **Currency & tax** — `$` is hardcoded, no tax field. Confirm currency (assumed USD) and whether tax applies.
3. **Product sizes / price variants** — none exist today. Confirm if meals/plans need sizes (Regular/Large) → build §3.10 only if yes.
4. **Per-product image galleries** — frontend uses one image per product. Confirm whether the admin needs multiple images per product (the model supports it regardless).
5. **Preparation time** — only a global "Ready in 15–20 min" exists; confirm if per-product prep time is needed.
6. **Availability schedule** — only binary `available`/`limited`. Confirm if time/day-based availability or stock counts are needed.
7. **Admin roles** — confirm single admin vs multiple roles/permissions.
8. **Landing-page content via API** — confirm whether `featuredMeals`/`menuItems`/`mealPlans`/`macroGoals`/marketing copy should become admin-editable now, or stay static.
9. **Cart / orders / payments** — explicitly out of scope now; confirm the future scope so the model stays compatible (the "Add"/favorite UI is currently non-functional).
10. **Image storage provider** — S3 / GCS / Cloudinary / local volume? Affects upload + URL strategy.
11. **i18n (Arabic/English)** — no evidence of localization today. Confirm if multilingual labels/descriptions are required (affects schema — translation tables).
12. **Multi-branch** — single-location placeholders today. Confirm if multiple gym locations/menus are needed (affects whether products/settings are per-branch).
13. **Inventory tracking** — none today. Confirm if stock counts are required.
14. **Restaurant placeholder data** — `"[Your Gym Name]"`, `"+1 (000) 000-0000"`, `"hello@barbellkitchen.example"` must be replaced with real values via Settings.
15. **Badge cardinality** — one pill shows today; confirm if multiple badges per product are ever needed.

---

## 19. Recommended Implementation Priority

1. **Core menu entities + migrations + seed** (products, categories, goals, ingredients, badges, images, joins, settings) — reproduce the current 16 products exactly.
2. **Public read APIs** (`/menu/*`) with filter/search/sort/pagination parity (§5) — unblocks frontend integration immediately.
3. **Admin auth** (login, hashing, tokens, rate limit).
4. **Admin CRUD APIs** (products + relations, categories/goals/ingredients/badges, settings; activate/deactivate; availability quick-edit; reorder).
5. **Image upload** (validation, resize, primary/reorder/alt/delete, storage + CDN).
6. **Swagger / OpenAPI docs** + tests (incl. public-output parity test) + cache-invalidation hook.
7. **Frontend integration** (replace hardcoded data, ISR/revalidate, remotePatterns, env var).
8. **Admin panel UI** (dashboard, products table + form, management pages, media).

---

## 20. Final Notes (constraints for the backend developer)

- **Don't over-engineer.** Single-location, modest menu. Build variants/galleries/i18n/multi-branch **only when confirmed** (§18) — but leave the model clean enough to add them.
- **Keep it extensible:** normalized categories/goals/badges, M:N joins, soft deletes, `display_order`, audit timestamps.
- **Design APIs cleanly:** versioned base path, consistent envelopes, plural resource routes, explicit query params.
- **Avoid N+1:** eager-load relations + primary image for list endpoints.
- **Public DTO ≠ Admin DTO:** public = published-only, light, label-only relations, primary image; admin = everything + drafts + audit + full gallery.
- **Validate everywhere** and never trust uploads (signature, not extension).
- **Make integration trivial:** keep DTO field names aligned with the existing frontend `Product` type, preserve the `filterAndSortProducts` semantics, and keep the 16-product public output identical after migration.

---

*Prepared from a read-only inspection of the Barbell Kitchen frontend (Next.js 16 / React 19 / TypeScript / Tailwind v4). No application code was modified. Primary sources: `src/lib/products-content.ts`, `src/lib/landing-content.ts`, and all components under `src/components/products/`. This Markdown can be converted to Word/PDF at any time (e.g. via Pandoc).*
