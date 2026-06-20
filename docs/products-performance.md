# /products — Performance & Caching Strategy

How the menu page renders fast today, and how to scale it when products move
behind an API. Implementation today is intentionally simple — no backend.

---

## Current setup (local/static data)

- **Data source:** `src/lib/products-content.ts` (local array). No fetching, no
  API, no client storage.
- **Static rendering:** `/products` has no dynamic/request-time APIs, so Next.js
  prerenders it as a static route (`○ Static` in the build output). The browser
  and CDN cache the HTML/JS/CSS as normal static assets.
- **Filtering/search/sort:** done client-side in `filterAndSortProducts`
  (pure function, memoized with `useMemo`). Fine for a small/medium menu.
- **Progressive rendering:** the grid renders only `INITIAL_VISIBLE_PRODUCTS`
  (10) matches, then loads `PRODUCTS_BATCH_SIZE` (10) more on scroll (an
  IntersectionObserver sentinel) or via the manual **Show N more meals** button.
  This keeps the DOM small even if the menu grows.
- **Images:** `next/image` with `object-cover`, fixed `aspect-[4/3]` (no layout
  shift), responsive `sizes`, lazy-loaded by default (no `priority` in the grid;
  there is no large above-the-fold image since the hero was replaced by a compact
  header). SVG support stays enabled in `next.config.ts` for logos/brand icons.
- **Motion:** restrained staggered reveal, gated by `useReducedMotion()`.

**Do not** add API caching, client-side caching, or `localStorage`/
`sessionStorage` for the menu while data is local — it adds complexity with no
benefit and risks stale data.

---

## Future setup (backend / API)

When products come from a CMS/admin/API, prefer **server-side fetching** in the
route (Server Component) and use Next.js caching deliberately:

### Fetching & revalidation
- Fetch on the server in `app/products/page.tsx` (or a server util), pass data to
  the existing `ProductMenuShell` as props. Keep the shell client-only for
  interaction; don't fetch in the client unless necessary.
- **Catalog (names, descriptions, images, macros)** changes rarely → cache with a
  reasonable revalidate window:
  ```ts
  // Time-based ISR
  export const revalidate = 3600; // 1 hour
  // or per-fetch:
  fetch(url, { next: { revalidate: 3600, tags: ["products"] } });
  ```
- **Admin edits a menu item** → use **tag-based revalidation** so changes appear
  without waiting for the window:
  ```ts
  import { revalidateTag } from "next/cache";
  revalidateTag("products", "max"); // Next.js 16 requires the cacheLife arg
  ```
  (Use `updateTag` in a Server Action for read-your-writes after an admin save.)
- **Price / availability** that changes frequently and must never be stale →
  fetch those fields with a short revalidate or `{ cache: "no-store" }`, ideally
  split from the cacheable catalog fetch so the bulk stays cached:
  ```ts
  fetch(pricingUrl, { cache: "no-store" });
  ```

### Images
- Serve product images from stable, content-hashed URLs and cache aggressively
  (long `Cache-Control`, `immutable`). Keep `next/image` with correct `sizes`.
- Add the image host to `images.remotePatterns` in `next.config.ts`.

### Search / filtering at scale
- **Small/medium menu (≤ a few hundred):** keep current client-side filtering +
  progressive rendering — simplest and instant.
- **Large catalog:** move filtering/search/pagination to the server/API (query
  params → server fetch), and convert progressive rendering into real paginated
  or cursor-based requests, keeping the same `INITIAL_VISIBLE_PRODUCTS` /
  `PRODUCTS_BATCH_SIZE` UX.

### Pitfalls to avoid
- Don't cache pricing/availability so long that users see stale values.
- Don't move everything to `no-store` (kills caching) — split volatile fields out.
- Don't fetch the whole catalog on the client on every interaction.
- Keep availability/pricing authoritative at order time (re-validate server-side
  when a real cart/checkout is added).
