# HK Cocteles — Site Redesign & Dependency Upgrade

**Date:** 2026-11-16
**Status:** Approved design, pending spec review

## Goal

Turn the current bare home page into a promotional site for the HK Cocteles
location (Prados de Oriente, Cali) that shows off the menu, and bring the
project up to the latest major versions of its dependencies.

## Scope

In scope:
- Dependency upgrade to latest majors.
- New landing page at `/` (hero, featured drinks, about, location/hours/map,
  photo gallery, footer).
- Restyle of `/menu` to the new visual system (same data and structure).
- Shared menu data module; fix of the `active` flag parsing.
- SEO metadata and LocalBusiness structured data.

Out of scope:
- `/admin` UI changes (only touched if the upgrade requires it).
- Unifying the SQLite (`menu.db`) and Google Sheets data sources.
- Online ordering, payments, i18n.

## 1. Dependency upgrade

| Package | From | To |
|---|---|---|
| next | 15.5.3 | 16.x (latest) |
| eslint-config-next | 15.5.3 | 16.x (matching next) |
| react / react-dom | 19.1.0 | 19.x (latest) |
| better-sqlite3 | ^12.2.0 | ^13 |
| @types/better-sqlite3 | ^7.6.13 | latest |
| @types/node | ^20 | ^22 |
| others (papaparse, tailwind, typescript, eslint, @types/*) | — | latest within major |

Expected breaking-change work:
- `eslint.config.mjs`: replace `FlatCompat` + `compat.extends(...)` with the
  native flat config exported by `eslint-config-next` 16. Remove
  `@eslint/eslintrc` if no longer needed.
- `package.json` scripts: drop `--turbopack` (default in Next 16).
- Route handlers in `src/app/api/menu/**/[id|key]/route.ts` already await
  `params` — verify only.
- `better-sqlite3` 13: verify native build and the `src/lib/database.ts`
  API usage still compile/run.

Done when `npm run build` and `npm run lint` pass with no errors.

## 2. Visual system

Bright, logo-inspired, mobile-first.

- **Palette** (Tailwind 4 `@theme` tokens in `globals.css`):
  - `cream` background `#FFF8EC`
  - `ink` outlines/text `#3A2E28` (logo's dark brown)
  - `hk-orange` `#F7941D`, `hk-magenta` `#FF4FE6`, `hk-mint` `#6DFF9C`,
    `hk-cyan` `#00A9CE`, `hk-yellow` `#EAFF2A`, `hk-purple` `#B04CF5`
  - Exact values to be sampled from `public/img/logo.webp` during
    implementation; the names above are the contract.
- **Type:** display font `Baloo 2` (chunky, rounded) via `next/font/google`
  for headings; `Nunito` for body. Remove unused Geist fonts.
- **Sticker card** pattern: `border-[3px] border-ink rounded-2xl` plus an
  offset hard shadow (`shadow-[4px_4px_0_var(--color-ink)]`), exposed as a
  reusable `.sticker` utility in `globals.css`.
- **Buttons:** primary (orange fill) and WhatsApp (green fill), both sticker
  style.
- The existing dark background and dot pattern in `globals.css` are replaced.
  `/admin` keeps working but will render on the new light background; that is
  acceptable.
- Data-driven Tailwind classes coming from the sheet (`bgColor` like
  `bg-blue-100`, section `color` like `text-red-600`) must keep being
  generated. They are currently picked up because they appear literally in
  `src/lib/database.ts`; add an `@source inline(...)` safelist in
  `globals.css` covering the `bg-*-100` and `text-*-600` color sets so this
  no longer depends on the seed file.

## 3. Site content config

`src/content/site.ts` — single typed object, the only place to edit business
info:

```ts
export const site = {
  name: "HK Cocteles",
  tagline: "Cócteles granizados con y sin licor",
  about: string[],            // paragraphs, draft Spanish copy
  address: "Calle 28 # 24A - 106 - Prados de Oriente - Cali",
  mapsQuery: string,          // used for embed + "Cómo llegar" link
  phone: "3180318210",
  whatsapp: "573180318210",   // wa.me format
  whatsappMessage: "¡Hola HK! Quiero hacer un pedido 🍹",
  hours: { days: string; open: string; close: string }[], // placeholder
  social: { facebook, instagram, tiktok },  // existing URLs
};
```

Header, footer, location section, WhatsApp buttons and JSON-LD all read from
this object.

## 4. Menu data module

`src/lib/menu.ts` (server-only):

- `getMenu(): Promise<MenuData>` — fetches each sheet tab (`sections`,
  `sizes`, `subsections`, `items`) **once** in parallel (currently `items` is
  refetched per section), assembles the same `MenuData` shape `/menu` uses
  today, sorted by `orderIndex`.
- Fetch uses `next: { revalidate: 60 }` instead of `cache: "no-store"`, so
  sheet edits appear within ~1 minute and pages are served fast.
- `active` parsed with an explicit helper: `"1"`, `"true"`, `"TRUE"`,
  `"sí"` → true; everything else false. (Today `Boolean("0") === true`, so
  items marked inactive in the sheet still show.)
- `getFeaturedDrinks(limit = 6)` — active items in active sections that have
  an `image`, de-duplicated by `name` (con/sin licor repeat flavors), in
  section then item order.
- Types (`MenuItem`, `Size`, `Subsection`, `MenuSection`, `MenuData`) move
  from `menu/page.tsx` into this module and are exported.
- **Error handling:** if the sheet fetch fails or returns unparseable data,
  `getMenu` throws; the landing page catches and hides the featured section;
  `/menu` shows a friendly "Menú no disponible, escríbenos por WhatsApp"
  message with the WhatsApp button instead of crashing.

## 5. Components

`src/components/`:

- `SiteHeader` — logo, anchor links (Menú, Nosotros, Ubicación, Galería),
  WhatsApp button; collapses to a compact bar on mobile. Used on `/` and
  `/menu`.
- `SiteFooter` — address, phone, hours summary, social icons (existing SVGs
  moved into `SocialIcons`).
- `WhatsAppButton` — builds `https://wa.me/<whatsapp>?text=<encoded message>`.
- `landing/Hero`, `landing/FeaturedDrinks`, `landing/About`,
  `landing/Location`, `landing/Gallery`.

### Landing page (`/`)

Order: Header → Hero → FeaturedDrinks → About → Location → Gallery → Footer.

- **Hero:** logo, tagline as headline, short subline, CTAs *Ver menú*
  (`/menu`) and *Pide por WhatsApp*. Decorative shapes (triangles, bolts,
  drops) echoing the logo, CSS/SVG only.
- **FeaturedDrinks:** up to 6 sticker cards (image, name, description) from
  `getFeaturedDrinks`; "Ver menú completo" link. Hidden if data unavailable.
- **About:** heading + `site.about` paragraphs.
- **Location:** address, hours table, "Cómo llegar" link
  (`https://www.google.com/maps/search/?api=1&query=<mapsQuery>`), and a
  lazy-loaded Google Maps iframe
  (`https://www.google.com/maps?q=<mapsQuery>&output=embed`, no API key).
- **Gallery:** reads image filenames from `public/img/gallery/` at build time
  (server component, `fs.readdir`). If empty, renders 6 colored placeholder
  tiles in brand colors. Below: "Síguenos en Instagram" button.

### `/menu`

- Uses `getMenu()`; same rendering logic for sizes / subsections / items /
  toppings, restyled with sticker cards and brand tokens.
- Sticky horizontal section tabs (anchor links to each active section,
  scrollable on mobile).
- Shared `SiteHeader` / `SiteFooter`.
- `revalidate = 60` on the page.

## 6. SEO

- Root layout: `lang="es"`, `metadata` with `metadataBase`, title template
  (`%s · HK Cocteles`), description, Open Graph + Twitter card using the logo.
- `/menu` gets its own title/description.
- JSON-LD `BarOrPub` (a schema.org `LocalBusiness` subtype) script on `/` built from
  `src/content/site.ts` (name, address, telephone, openingHours, sameAs).

## 7. Verification

No test suite exists; verification is:
1. `npm run lint` and `npm run build` pass.
2. Browser check of `/`, `/menu`, `/admin` at 375px and desktop widths:
   no horizontal scroll, featured drinks render from the sheet, map loads,
   WhatsApp link correct, menu sections/tabs work, admin still loads.
3. `active` parsing: confirm in the browser that the live sheet's sections
   and items render, and check the `parseActive` helper against `"1"`, `"0"`,
   `""`, `"TRUE"`, `"FALSE"` with a one-off `node` script.
