@AGENTS.md

# Barbell Kitchen — premium gym-restaurant website

Marketing + menu site for a healthy, high-protein restaurant located **inside a gym**.
Two routes today: a cinematic **landing page** (`/`) and a **menu/products browsing
page** (`/products`). Current goal is to drive users to browse and (eventually) order
meals — there is **no** checkout, auth, cart persistence, or backend yet.

> ⚠️ Read `AGENTS.md` first: this is **Next.js 16** with breaking changes vs. older
> versions. When unsure about an API, read the bundled docs in
> `node_modules/next/dist/docs/` rather than relying on memory.

## Stack

- **Next.js 16** App Router (Turbopack default, React Compiler enabled in `next.config.ts`)
- **React 19.2**
- **TypeScript** (strict)
- **Tailwind CSS v4** — theme tokens via `@theme` in `src/app/globals.css` (no `tailwind.config.js`)
- **Motion** — import from `motion/react` (never `framer-motion`)
- `next/image`, `next/font` (Geist sans/mono + Oswald display)

## Commands

```bash
npm run dev      # next dev (Turbopack)
npm run build    # next build (runs tsc; fails on type errors)
npm run lint     # eslint (NOTE: `next lint` was removed in v16)
npm run start    # serve the production build
```

No separate `typecheck` script (build runs TypeScript); no `test` script.
If `node_modules` is missing, run `npm install` first.
Run `npm run lint` **and** `npm run build` after any code change and fix what they surface.

## Architecture

Pages are thin server components that compose section/feature components.

```
src/
  app/
    layout.tsx          fonts (Geist + Oswald) + metadata; <html>/<body>
    globals.css         Tailwind import + @theme brand tokens + utilities
    page.tsx            "/"  landing (server) — composes landing sections + BrandIntro
    products/page.tsx   "/products" menu (server) — Navbar + ProductMenuHeader + ProductMenuShell + Footer
  components/
    landing/            landing sections + shared primitives (Logo, CtaButton, icons, …)
    products/           menu page components (shell, filters, grid, card, modal, …)
    motion/Reveal.tsx   scroll-reveal wrappers (Reveal / RevealGroup / RevealItem)
  lib/
    landing-content.ts    landing copy/data + PRODUCTS_ROUTE constant + shared types (Meal, Macros, IconName)
    products-content.ts   product data, filter/sort config, filterAndSortProducts(), progressive constants
    landing-animations.ts shared Motion variants + easing
public/images/          food photos (.png), brand logos (logo-red.svg, logo-white.png),
                        custom goal icons (goal-build-muscle.svg / -white.svg), avatars, gym-counter
docs/
  visual-identity.md       brand/design system reference
  products-performance.md  current static strategy + future API caching guidance
scripts/                 one-off asset generators (not part of the build)
```

### Conventions

- **Server components by default.** Add `"use client"` only for interactivity/Motion.
  Static sections stay on the server and pass children into client `Reveal` wrappers.
- **Content lives in `lib/*-content.ts`**, not inside components.
- **Animations** use variants from `lib/landing-animations.ts`; premium easing `[0.22, 1, 0.36, 1]`.
- **Icons**: inline stroke set in `components/landing/icons.tsx` (`<Icon name="…" />`). Brand
  SVGs that ship their own fill (e.g. `goal-build-muscle`) get a dedicated wrapper
  (`BuildMuscleIcon`) with a pre-colored file per surface — never recolor those via CSS.
- **Path alias**: `@/*` → `src/*`. Keep components small and focused.

## Routing

- `/` — landing page.
- `/products` — menu/product browsing page (exists; do not build checkout/auth/backend unless asked).
- **All order/menu/plan CTAs route to `PRODUCTS_ROUTE`** (`/products`) from
  `lib/landing-content.ts`. Change that one constant to re-route them all.
- The products navbar passes `links={productNavLinks}`, `logoHref="/"`, `activeHref="/products"`
  (its nav links point back to landing sections like `/#plans`).

## Visual identity

Full reference: `docs/visual-identity.md`. Tokens live in `globals.css` `@theme`.

- Primary **maroon/burgundy** (`--color-maroon` `#7a1e2b`, + bright/dark/deep).
- Accent **brushed silver / ceramic-metallic** (`--color-silver*`; `.brushed-metal`, `.metal-divider`).
- Neutrals: charcoal/graphite/ink + cream/off-white (`.gym-surface` is the dark cinematic surface).
- **Green only inside food photos**, never as a brand/UI color.
- **Logo** (`components/landing/Logo.tsx`): `<Logo variant="red" />` on light/silver surfaces,
  `variant="white"` on dark/maroon surfaces. Near-square (~1.4:1) — size by height in tight bars.
- Premium gym/restaurant feel; avoid generic SaaS/template aesthetics.

## Image rules

- Reference with public paths, **no** `public/` prefix: `/images/foo.png` (never `/public/images/...`).
- Use `next/image`. Food photos `object-cover` with fixed aspect (e.g. `aspect-[4/3]`) + correct
  `sizes`; logos/icons `object-contain`. Always set dimensions/aspect to avoid layout shift.
- `next.config.ts` keeps `images.dangerouslyAllowSVG: true` (+ CSP) — **required** because the
  red logo and goal icons are SVGs served through `next/image`. Don't remove it.
- Do **not** set `images.unoptimized: true` globally (only for static export / non-Node deploys).

## Landing page (`/`)

`app/page.tsx` mounts `<BrandIntro />` then composes, in order:
TopPromoBar → Navbar → main{ HeroSection → BenefitStrip → FeaturedMeals → MenuPreviewTabs →
MealPlans → MacroGoalSelector → HowItWorks → InsideGymPickup → ResultsSection → FaqSection →
CtaSection } → Footer → MobileStickyOrder.

Key behavior:
- **BrandIntro**: one-time-per-session cinematic overlay (sessionStorage `bk-intro-seen`),
  ~2.4s, auto-reveals, skippable (button/Esc), fully skipped under reduced motion. It overlays
  the always-rendered page (SEO-safe, no-JS-safe) and is **only on `/`** (not `/products`).
- **Navbar**: sticky, accepts optional `links`/`logoHref`/`activeHref` (defaults = landing).
  Mobile menu via `MobileMenu` drawer.
- **Hero**: fills first viewport on `lg+` via `min-h-[calc(100svh-var(--top-chrome-height))]`.
- **MenuPreviewTabs / MacroGoalSelector / FaqSection**: client, interactive.
- **MobileStickyOrder**: mobile-only bottom CTA → `PRODUCTS_ROUTE`.

## Products / menu page (`/products`)

`app/products/page.tsx` = TopPromoBar → Navbar → `ProductMenuHeader` → `ProductMenuShell` → Footer.
`ProductMenuShell` (client) owns filter/search/sort + progressive state and composes everything.

Layout:
- **Menu-first.** `ProductMenuHeader` is **hidden on mobile** (an `sr-only <h1>` remains for
  SEO/AT) and shows as a compact branded info strip from `lg` up.
- **Desktop (`lg+`)**: left **sticky, internally scrollable** sidebar (`ProductFilters`) +
  product grid. The sidebar caps height with `max-h-[calc(100svh - var(--navbar-height) - 3rem)]`,
  pinned header (Filters + Clear all) over an `overflow-y-auto overscroll-contain` body.
- **Mobile (`< lg`)**: a sticky bar (`MobileFilterBar`) with order **category chips → search +
  Filters button**, then the grid below. Category row is horizontally scrollable with gradient
  fade edges, scroll-snap, hidden scrollbar, "All" first, and the selected chip auto-centers.
- Grid (`ProductGrid`): 1 col mobile → 2 col tablet → 3 col `lg`/`2xl` (current `GRID` constant).

Filters / search / sort:
- Logic is pure in `products-content.ts` (`filterAndSortProducts`), memoized in the shell.
- **Category is single-select**; **goal and macro filters are multi-select**.
- Search matches name, description, ingredients, category labels, and goal labels.
- Sort options come from `sortOptions` config (Featured / Price ↑ / Price ↓ / Highest Protein /
  Lowest Calories) — never hardcode duplicates.
- **Mobile**: Sort lives **inside the filter drawer** (drawer sections: Sort → Category → Goal →
  Macros), with Clear all + a "View N meals" apply button.
- **Empty state** (`ProductEmptyState`): clear message + working "Clear filters".

> **Current wiring note:** `ProductSortBar` and `ActiveFilterChips` exist and are designed to
> render the desktop top toolbar (meal count + "Showing X of Y" + active-filter chips + desktop
> Sort, with mobile showing only the count). That toolbar block is **currently commented out in
> `ProductMenuShell`**, so it does not render right now (this is why lint reports those two
> imports as unused). Mobile Sort still works via the drawer. Re-enable the commented block to
> restore the toolbar; don't duplicate it.

Filter drawer (`MobileFilterBar`) accessibility: `role="dialog"` + `aria-modal`, labelled title,
close via **X / backdrop / Escape**, body-scroll lock + restore, focus moved to Close and
restored on close.

## Progressive loading / performance

- `INITIAL_VISIBLE_PRODUCTS = 10`, `PRODUCTS_BATCH_SIZE = 10` (in `products-content.ts`).
- Renders only the visible slice; loads the next batch via an **IntersectionObserver sentinel**
  (auto-load near bottom) and a manual **"Show N more meals"** button (keyboard-accessible).
- Batch shows `ProductCardSkeleton` placeholders (matching card shape; `.skeleton` brushed-silver
  shimmer in `globals.css`) during a short ~280ms transition (skipped under reduced motion — no
  fake long delays since data is local/static).
- **Visible count resets to the initial value on any category/goal/macro/search/sort change**
  (handled in the shell's filter setters, not in an effect).
- Data is local/static → `/products` prerenders as a **static** route; no API/client/`localStorage`
  caching is added. See `docs/products-performance.md` for the future-API strategy.

## Accessibility

- Semantic landmarks + one `<h1>` per breakpoint (mobile uses an `sr-only` heading on `/products`).
- Real `<button>`/`<a>`; `aria-pressed` toggle chips, `aria-current` active route, `aria-busy` on load-more.
- Dialogs/drawers/modal: dialog semantics, Esc + backdrop close, focus moved in & restored, body
  scroll locked. Branded visible focus ring (`:focus-visible` maroon outline in `globals.css`).
- `useReducedMotion()` in every animated client component (+ global CSS reduced-motion fallback).
- **No horizontal overflow**: `html { overflow-x: clip }`; full-bleed elements use exact negative
  margins; flex/grid children use `min-w-0`; long footer text uses `break-words`.

## Important constraints (don't break these)

- Don't redesign the landing page, product cards, or the product modal unless explicitly asked.
- "Mobile only" requests must not change desktop (and vice-versa) — scope with responsive classes.
- Don't change product data, or filtering/search/sort logic, unless explicitly asked.
- Don't create the checkout/auth/backend; keep all order CTAs on `PRODUCTS_ROUTE`.
- Always inspect existing files before editing. Server components by default; `"use client"`
  only where interactivity/Motion is needed. Keep components small and focused.
- Run `npm run lint` and `npm run build` after code changes.
