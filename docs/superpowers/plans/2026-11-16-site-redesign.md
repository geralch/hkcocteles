# HK Cocteles Site Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the HK Cocteles Next.js app to the latest major versions and replace the bare home page with a bright, logo-inspired promotional landing page, restyling `/menu` to match.

**Architecture:** Pure menu-shaping logic lives in `src/lib/menu-data.ts` (unit-tested with `node --test`), fetched from the existing Google Sheet by `src/lib/menu.ts` with 60s revalidation. Business info lives in `src/content/site.ts`. Shared header/footer/WhatsApp components in `src/components/`, landing sections in `src/components/landing/`. Design tokens and the `sticker`/`btn` utilities live in `src/app/globals.css` (Tailwind 4).

**Tech Stack:** Next.js 16.4, React 19.3, Tailwind CSS 4, TypeScript 5.9, papaparse, better-sqlite3 13 (admin only), Node 24 built-in test runner.

**Spec:** `docs/superpowers/specs/2026-11-16-site-redesign-design.md`

## Global Constraints

- Node ≥ 22 (better-sqlite3 13 requirement); dev machine runs Node 24.
- `next` and `eslint-config-next` pinned to the same version: `16.4.6`.
- `react` / `react-dom`: `19.3.1`. TypeScript stays on 5.x (`^5`), ESLint stays on 9.x (`^9`) — do not take TS 7 / ESLint 10.
- All user-facing copy is Spanish; `<html lang="es">`.
- Business info (address, phone, hours, about, social links) is only read from `src/content/site.ts` — never hard-coded in components.
- Menu data source stays the Google Sheet at `GOOGLE_SHEETS_URL`; `/admin` and `/api/menu/*` behaviour is unchanged.
- `active` is true only for `"1"`, `"true"`, `"sí"`, `"si"`, `"yes"` (case-insensitive, trimmed).
- Mobile first: no horizontal page scroll at 375px width.
- Text colors must stay readable: use `text-hk-orange-ink` (not `text-hk-orange`) for orange text on light backgrounds.

---

### Task 1: Upgrade dependencies and tooling

**Files:**
- Modify: `package.json`, `package-lock.json`
- Modify: `eslint.config.mjs`
- Modify: `tsconfig.json`

**Interfaces:**
- Produces: `npm test` script running `node --test "src/**/*.test.ts"`; tsconfig option `allowImportingTsExtensions: true` so test files can `import ... from "./x.ts"`.

- [ ] **Step 1: Install current lockfile to get a baseline**

Run: `npm install`
Expected: installs without errors (node_modules is currently missing).

- [ ] **Step 2: Upgrade runtime dependencies**

```bash
npm install next@16.4.6 react@19.3.1 react-dom@19.3.1 better-sqlite3@^13.2.0 @types/better-sqlite3@^9.6.0 papaparse@^5.7.1
```

- [ ] **Step 3: Upgrade dev dependencies and drop FlatCompat**

```bash
npm install -D eslint-config-next@16.4.6 eslint@^9 typescript@^5 @types/node@^22 @types/react@^19 @types/react-dom@^19 @types/papaparse@latest tailwindcss@^4 @tailwindcss/postcss@^4
npm uninstall @eslint/eslintrc
```

- [ ] **Step 4: Replace `eslint.config.mjs` with the native flat config**

```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
```

- [ ] **Step 5: Update scripts in `package.json`**

Turbopack is the default in Next 16, so drop the flag, and add the test script:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "test": "node --test \"src/**/*.test.ts\""
},
```

- [ ] **Step 6: Allow `.ts` import extensions in `tsconfig.json`**

Add to `compilerOptions` (valid because `noEmit` is already `true`):

```json
"allowImportingTsExtensions": true,
```

- [ ] **Step 7: Verify lint and build**

Run: `npm run lint && npm run build`
Expected: both succeed. `next build` may rewrite `tsconfig.json` (e.g. `jsx: "react-jsx"`, extra `include` entries) — keep its changes. Fix any new lint errors in existing files minimally (no refactors). The `[id]`/`[key]` route handlers already `await params`; no change expected there.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json eslint.config.mjs tsconfig.json
git commit -m "Upgrade to Next 16, React 19.3 and better-sqlite3 13"
```

---

### Task 2: Menu data module

**Files:**
- Create: `src/lib/menu-data.ts`
- Create: `src/lib/menu-data.test.ts`
- Create: `src/lib/menu.ts`

**Interfaces:**
- Consumes: `GOOGLE_SHEETS_URL` from `@/app/constants/environment`; `SECTIONS`, `SIZES`, `SUBSECTIONS`, `ITEMS` from `@/app/constants/database`.
- Produces (from `src/lib/menu-data.ts`):
  - `interface MenuItem { id: number; name: string; description?: string; price?: string; emoji: string; bgColor: string; image?: string }`
  - `type FeaturedDrink = MenuItem & { image: string }`
  - `interface Size { size: string; price: string }`
  - `interface Subsection { title: string; items: MenuItem[] }`
  - `interface MenuSection { key: string; title: string; icon: string; color: string; sizes: Size[]; items: MenuItem[]; subsections: Subsection[] }`
  - `parseActive(value: string | undefined): boolean`
  - `buildMenu(data: SheetData): MenuSection[]` — active sections only, sorted by `orderIndex`, empty sections dropped
  - `pickFeatured(menu: MenuSection[], limit?: number): FeaturedDrink[]`
- Produces (from `src/lib/menu.ts`): `getMenu(): Promise<MenuSection[]>`, `getFeaturedDrinks(limit?: number): Promise<FeaturedDrink[]>`. Both throw if the sheet can't be fetched/parsed.

- [ ] **Step 1: Write the failing tests** — `src/lib/menu-data.test.ts`

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildMenu, parseActive, pickFeatured } from "./menu-data.ts";
import type { SheetData, SheetItem, SheetSection } from "./menu-data.ts";

const section = (overrides: Partial<SheetSection>): SheetSection => ({
  key: "s",
  title: "Section",
  icon: "🍹",
  color: "text-red-600",
  active: "1",
  orderIndex: "0",
  ...overrides,
});

const item = (overrides: Partial<SheetItem>): SheetItem => ({
  id: "1",
  sectionKey: "s",
  subsectionId: "",
  name: "Item",
  description: "",
  price: "",
  emoji: "🍹",
  bgColor: "bg-red-100",
  image: "",
  active: "1",
  orderIndex: "0",
  ...overrides,
});

const sheet = (overrides: Partial<SheetData>): SheetData => ({
  sections: [],
  sizes: [],
  subsections: [],
  items: [],
  ...overrides,
});

test("parseActive accepts only explicit truthy values", () => {
  for (const value of ["1", "true", "TRUE", " sí ", "si", "yes"]) {
    assert.equal(parseActive(value), true, value);
  }
  for (const value of ["0", "", "false", "FALSE", "no", undefined]) {
    assert.equal(parseActive(value), false, String(value));
  }
});

test("buildMenu drops inactive sections and items", () => {
  const menu = buildMenu(
    sheet({
      sections: [section({ key: "a" }), section({ key: "b", active: "0" })],
      items: [
        item({ id: "1", sectionKey: "a", name: "Shown" }),
        item({ id: "2", sectionKey: "a", name: "Hidden", active: "0" }),
        item({ id: "3", sectionKey: "b", name: "In hidden section" }),
      ],
    }),
  );
  assert.deepEqual(menu.map((s) => s.key), ["a"]);
  assert.deepEqual(menu[0].items.map((i) => i.name), ["Shown"]);
});

test("buildMenu sorts sections and items by orderIndex", () => {
  const menu = buildMenu(
    sheet({
      sections: [section({ key: "late", orderIndex: "5" }), section({ key: "early", orderIndex: "1" })],
      items: [
        item({ id: "1", sectionKey: "late", name: "B", orderIndex: "2" }),
        item({ id: "2", sectionKey: "late", name: "A", orderIndex: "1" }),
        item({ id: "3", sectionKey: "early" }),
      ],
    }),
  );
  assert.deepEqual(menu.map((s) => s.key), ["early", "late"]);
  assert.deepEqual(menu[1].items.map((i) => i.name), ["A", "B"]);
});

test("buildMenu attaches sizes, groups subsection items and drops empty sections", () => {
  const menu = buildMenu(
    sheet({
      sections: [section({ key: "esp" }), section({ key: "empty" })],
      sizes: [{ sectionKey: "esp", size: "16 oz", price: "$15.000" }],
      subsections: [
        { id: "10", sectionKey: "esp", title: "Frutales", orderIndex: "0" },
        { id: "11", sectionKey: "esp", title: "Sin items", orderIndex: "1" },
      ],
      items: [item({ id: "1", sectionKey: "esp", subsectionId: "10", name: "Mango", price: "$16.000" })],
    }),
  );
  assert.equal(menu.length, 1);
  assert.deepEqual(menu[0].sizes, [{ size: "16 oz", price: "$15.000" }]);
  assert.deepEqual(menu[0].items, []);
  assert.deepEqual(menu[0].subsections.map((s) => s.title), ["Frutales"]);
  assert.equal(menu[0].subsections[0].items[0].price, "$16.000");
  assert.equal(menu[0].subsections[0].items[0].description, undefined);
});

test("pickFeatured keeps items with images, dedupes by name and respects the limit", () => {
  const menu = buildMenu(
    sheet({
      sections: [section({ key: "sin" }), section({ key: "con", orderIndex: "1" })],
      items: [
        item({ id: "1", sectionKey: "sin", name: "Mora Azul", image: "/img/a.png" }),
        item({ id: "2", sectionKey: "sin", name: "Sin foto" }),
        item({ id: "3", sectionKey: "sin", name: "Lulo", image: "/img/b.png", orderIndex: "1" }),
        item({ id: "4", sectionKey: "con", name: "mora azul", image: "/img/a.png" }),
        item({ id: "5", sectionKey: "con", name: "Sandía", image: "/img/c.png", orderIndex: "1" }),
      ],
    }),
  );
  assert.deepEqual(pickFeatured(menu).map((d) => d.name), ["Mora Azul", "Lulo", "Sandía"]);
  assert.deepEqual(pickFeatured(menu, 2).map((d) => d.id), [1, 3]);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — cannot find module `./menu-data.ts`.

- [ ] **Step 3: Implement `src/lib/menu-data.ts`**

```ts
// Pure menu shaping: no Next.js or network imports, so it runs under `node --test`.

// Rows as they come from the Google Sheet CSV tabs (every cell is a string).
export interface SheetSection {
  key: string;
  title: string;
  icon: string;
  color: string;
  active: string;
  orderIndex: string;
}

export interface SheetSize {
  sectionKey: string;
  size: string;
  price: string;
}

export interface SheetSubsection {
  id: string;
  sectionKey: string;
  title: string;
  orderIndex: string;
}

export interface SheetItem {
  id: string;
  sectionKey: string;
  subsectionId: string;
  name: string;
  description: string;
  price: string;
  emoji: string;
  bgColor: string;
  image: string;
  active: string;
  orderIndex: string;
}

export interface SheetData {
  sections: SheetSection[];
  sizes: SheetSize[];
  subsections: SheetSubsection[];
  items: SheetItem[];
}

export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price?: string;
  emoji: string;
  bgColor: string;
  image?: string;
}

export type FeaturedDrink = MenuItem & { image: string };

export interface Size {
  size: string;
  price: string;
}

export interface Subsection {
  title: string;
  items: MenuItem[];
}

export interface MenuSection {
  key: string;
  title: string;
  icon: string;
  color: string;
  sizes: Size[];
  items: MenuItem[];
  subsections: Subsection[];
}

const TRUTHY = new Set(["1", "true", "sí", "si", "yes"]);

// The sheet stores flags as text, and Boolean("0") is true, so parse explicitly.
export function parseActive(value: string | undefined): boolean {
  return TRUTHY.has((value ?? "").trim().toLowerCase());
}

const byOrder = (a: { orderIndex: string }, b: { orderIndex: string }) =>
  (parseInt(a.orderIndex) || 0) - (parseInt(b.orderIndex) || 0);

const toMenuItem = (item: SheetItem): MenuItem => ({
  id: parseInt(item.id),
  name: item.name,
  description: item.description || undefined,
  price: item.price || undefined,
  emoji: item.emoji,
  bgColor: item.bgColor,
  image: item.image || undefined,
});

// Only what should be shown: active sections and items, in sheet order,
// without sections or subsections that end up empty.
export function buildMenu(data: SheetData): MenuSection[] {
  const activeItems = data.items.filter((item) => parseActive(item.active)).sort(byOrder);

  return data.sections
    .filter((section) => parseActive(section.active))
    .sort(byOrder)
    .map((section) => ({
      key: section.key,
      title: section.title,
      icon: section.icon,
      color: section.color,
      sizes: data.sizes
        .filter((size) => size.sectionKey === section.key)
        .map(({ size, price }) => ({ size, price })),
      items: activeItems
        .filter((item) => item.sectionKey === section.key && !item.subsectionId)
        .map(toMenuItem),
      subsections: data.subsections
        .filter((subsection) => subsection.sectionKey === section.key)
        .sort(byOrder)
        .map((subsection) => ({
          title: subsection.title,
          items: activeItems.filter((item) => item.subsectionId === subsection.id).map(toMenuItem),
        }))
        .filter((subsection) => subsection.items.length > 0),
    }))
    .filter((section) => section.items.length > 0 || section.subsections.length > 0);
}

// Con licor and sin licor repeat the same flavors, so dedupe by name.
export function pickFeatured(menu: MenuSection[], limit = 6): FeaturedDrink[] {
  const seen = new Set<string>();
  const featured: FeaturedDrink[] = [];

  for (const section of menu) {
    const items = [...section.items, ...section.subsections.flatMap((subsection) => subsection.items)];
    for (const item of items) {
      const name = item.name.trim().toLowerCase();
      if (!item.image || seen.has(name)) continue;
      seen.add(name);
      featured.push({ ...item, image: item.image });
      if (featured.length === limit) return featured;
    }
  }

  return featured;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: 5 tests PASS.

- [ ] **Step 5: Implement `src/lib/menu.ts`**

```ts
import Papa from "papaparse";
import { GOOGLE_SHEETS_URL } from "@/app/constants/environment";
import { ITEMS, SECTIONS, SIZES, SUBSECTIONS } from "@/app/constants/database";
import { buildMenu, pickFeatured } from "./menu-data";
import type {
  FeaturedDrink,
  MenuSection,
  SheetItem,
  SheetSection,
  SheetSize,
  SheetSubsection,
} from "./menu-data";

// Sheet edits show up on the site within this many seconds.
const REVALIDATE_SECONDS = 60;

async function fetchTab<T>(tab: string): Promise<T[]> {
  const res = await fetch(`${GOOGLE_SHEETS_URL}${tab}`, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) {
    throw new Error(`Google Sheets tab "${tab}" responded ${res.status}`);
  }
  const { data, errors } = Papa.parse<T>(await res.text(), { header: true, skipEmptyLines: true });
  if (errors.length > 0) {
    throw new Error(`Could not parse Google Sheets tab "${tab}": ${errors[0].message}`);
  }
  return data;
}

export async function getMenu(): Promise<MenuSection[]> {
  const [sections, sizes, subsections, items] = await Promise.all([
    fetchTab<SheetSection>(SECTIONS),
    fetchTab<SheetSize>(SIZES),
    fetchTab<SheetSubsection>(SUBSECTIONS),
    fetchTab<SheetItem>(ITEMS),
  ]);
  return buildMenu({ sections, sizes, subsections, items });
}

export async function getFeaturedDrinks(limit = 6): Promise<FeaturedDrink[]> {
  return pickFeatured(await getMenu(), limit);
}
```

- [ ] **Step 6: Verify types and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/lib/menu-data.ts src/lib/menu-data.test.ts src/lib/menu.ts
git commit -m "Add shared menu data module with active-flag fix"
```

---

### Task 3: Site content, design tokens and root layout

**Files:**
- Create: `src/content/site.ts`
- Modify: `src/app/globals.css` (full replacement)
- Modify: `src/app/layout.tsx` (full replacement)

**Interfaces:**
- Produces: `site` object and `fullAddress` string from `@/content/site`; CSS tokens `cream`, `ink`, `hk-orange`, `hk-orange-ink`, `hk-magenta`, `hk-mint`, `hk-cyan`, `hk-yellow`, `hk-purple`, `whatsapp` (usable as `bg-*`, `text-*`, `border-*`); fonts `font-display` (Baloo 2) and `font-sans` (Nunito); utilities `sticker` and `btn` (`btn` sets no padding/font-size — callers add `px-* py-* text-*`).

- [ ] **Step 1: Create `src/content/site.ts`**

```ts
// Business info shown across the site. Edit it here; every page reads from it.
// The hours and the "about" text are drafts: replace them with the real ones.
export const site = {
  name: "HK Cocteles",
  url: "https://hkcocteles.com",
  tagline: "Cócteles granizados con y sin licor",
  description:
    "Granizados con y sin licor, sodas y toppings en Prados de Oriente, Cali. Ven por el tuyo o pídelo por WhatsApp.",
  about: [
    "En HK Cocteles convertimos el antojo en fiesta: granizados preparados al momento, con y sin licor, llenos de color y sabor.",
    "Desde Prados de Oriente, en Cali, mezclamos frutas, siropes y toppings para que cada vaso sea único. Ven con tus amigos, arma tu combinación favorita o pídela por WhatsApp.",
  ],
  address: {
    street: "Calle 28 # 24A - 106",
    neighborhood: "Prados de Oriente",
    city: "Cali",
    region: "Valle del Cauca",
    country: "CO",
  },
  mapsQuery: "Calle 28 # 24A-106, Prados de Oriente, Cali, Colombia",
  phone: "3180318210",
  whatsapp: "573180318210",
  whatsappMessage: "¡Hola HK! Quiero hacer un pedido 🍹",
  // `schema` uses schema.org openingHours format for Google.
  hours: [
    { days: "Lunes a jueves", time: "3:00 pm – 10:00 pm", schema: "Mo-Th 15:00-22:00" },
    { days: "Viernes y sábado", time: "3:00 pm – 12:00 am", schema: "Fr-Sa 15:00-23:59" },
    { days: "Domingos y festivos", time: "2:00 pm – 9:00 pm", schema: "Su 14:00-21:00" },
  ],
  social: {
    instagram: "https://instagram.com/hkcocteles",
    facebook: "https://facebook.com/hkcocteles",
    tiktok: "https://tiktok.com/@hkcocteles",
  },
} as const;

export const fullAddress = `${site.address.street} - ${site.address.neighborhood} - ${site.address.city}`;
```

- [ ] **Step 2: Replace `src/app/globals.css`**

```css
@import "tailwindcss";

/* Menu colors come from the Google Sheet as class names, which Tailwind can't
   see in the source, so generate the whole range up front. */
@source inline("bg-{red,orange,amber,yellow,lime,green,emerald,teal,cyan,sky,blue,indigo,violet,purple,fuchsia,pink,rose,gray}-100");
@source inline("text-{red,orange,amber,yellow,lime,green,emerald,teal,cyan,sky,blue,indigo,violet,purple,fuchsia,pink,rose,gray}-600");

/* Colors sampled from the logo. */
@theme {
  --color-cream: #fff8ec;
  --color-ink: #3a2e28;
  --color-hk-orange: #f7941d;
  --color-hk-orange-ink: #b85a00; /* readable orange for text on light backgrounds */
  --color-hk-magenta: #ff4fe6;
  --color-hk-mint: #6dff9c;
  --color-hk-cyan: #00a9ce;
  --color-hk-yellow: #eaff2a;
  --color-hk-purple: #b04cf5;
  --color-whatsapp: #25d366;
}

@theme inline {
  --font-display: var(--font-baloo);
  --font-sans: var(--font-nunito);
}

html {
  scroll-behavior: smooth;
}

body {
  background: var(--color-cream);
  color: var(--color-ink);
}

/* Logo-style card: thick outline with a hard offset shadow. */
@utility sticker {
  border: 3px solid var(--color-ink);
  border-radius: 1rem;
  box-shadow: 4px 4px 0 var(--color-ink);
}

@utility btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--color-ink);
  border: 3px solid var(--color-ink);
  border-radius: 9999px;
  box-shadow: 3px 3px 0 var(--color-ink);
  transition: transform 150ms, box-shadow 150ms;

  &:hover {
    transform: translate(-1px, -1px);
    box-shadow: 5px 5px 0 var(--color-ink);
  }

  &:active {
    transform: translate(2px, 2px);
    box-shadow: 1px 1px 0 var(--color-ink);
  }
}
```

- [ ] **Step 3: Replace `src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import { site } from "@/content/site";
import "./globals.css";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} · ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: site.name,
    title: `${site.name} · ${site.tagline}`,
    description: site.description,
    images: [{ url: "/img/logo.webp", width: 1469, height: 1847, alt: site.name }],
  },
  twitter: {
    card: "summary",
    title: `${site.name} · ${site.tagline}`,
    description: site.description,
    images: ["/img/logo.webp"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/img/ico.png", type: "image/png" },
    ],
    apple: "/img/ico.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${baloo.variable} ${nunito.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Verify**

Run: `npm run lint && npm run build`
Expected: both pass. (The old `/` and `/menu` pages will look off on the cream background until Tasks 5–6 replace them; that's expected.)

- [ ] **Step 5: Commit**

```bash
git add src/content/site.ts src/app/globals.css src/app/layout.tsx
git commit -m "Add site content config, brand theme and SEO metadata"
```

---

### Task 4: Shared components (links, icons, WhatsApp button, header, footer)

**Files:**
- Create: `src/lib/links.ts`
- Create: `src/lib/links.test.ts`
- Create: `src/components/SocialIcons.tsx`
- Create: `src/components/WhatsAppButton.tsx`
- Create: `src/components/SiteHeader.tsx`
- Create: `src/components/SiteFooter.tsx`

**Interfaces:**
- Consumes: `site`, `fullAddress` from `@/content/site`; `sticker`/`btn` utilities and color tokens from Task 3.
- Produces:
  - `whatsappUrl(phone: string, message?: string): string`, `mapsSearchUrl(query: string): string`, `mapsEmbedUrl(query: string): string` from `@/lib/links`
  - `SocialIcon({ name, className })` with `name: "whatsapp" | "facebook" | "instagram" | "tiktok"`, and `SocialLinks({ className })` from `@/components/SocialIcons`
  - default export `WhatsAppButton({ label?, className? })` from `@/components/WhatsAppButton` (caller supplies padding/text size classes)
  - default exports `SiteHeader()` (sticky, `h-16`) and `SiteFooter()`

- [ ] **Step 1: Write the failing tests** — `src/lib/links.test.ts`

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { mapsEmbedUrl, mapsSearchUrl, whatsappUrl } from "./links.ts";

test("whatsappUrl strips non-digits and encodes the message", () => {
  assert.equal(
    whatsappUrl("+57 318-031-8210", "¡Hola HK! 🍹"),
    `https://wa.me/573180318210?text=${encodeURIComponent("¡Hola HK! 🍹")}`,
  );
});

test("whatsappUrl without a message has no query string", () => {
  assert.equal(whatsappUrl("573180318210"), "https://wa.me/573180318210");
});

test("maps urls encode the query", () => {
  assert.equal(mapsEmbedUrl("Calle 28 # 24A"), "https://www.google.com/maps?q=Calle%2028%20%23%2024A&output=embed");
  assert.equal(
    mapsSearchUrl("Calle 28 # 24A"),
    "https://www.google.com/maps/search/?api=1&query=Calle%2028%20%23%2024A",
  );
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — cannot find module `./links.ts`.

- [ ] **Step 3: Implement `src/lib/links.ts`**

```ts
export function whatsappUrl(phone: string, message?: string): string {
  const base = `https://wa.me/${phone.replace(/\D/g, "")}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function mapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

// Plain embed URL: works without a Google Maps API key.
export function mapsEmbedUrl(query: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: all tests PASS (5 menu + 3 links).

- [ ] **Step 5: Create `src/components/SocialIcons.tsx`**

The icon shapes are reused verbatim from the existing 24×24 SVGs in `src/app/page.tsx`. Its only `<path d="…">` elements (the map pin uses `fillRule` first, so it is excluded) are, in order: WhatsApp, Facebook, Instagram, TikTok. Print them as a ready-to-paste object literal (must run before Task 5 replaces `page.tsx`):

```bash
node -e 'const s=require("fs").readFileSync("src/app/page.tsx","utf8");const [whatsapp,facebook,instagram,tiktok]=[...s.matchAll(/<path d="([^"]+)"/g)].map(m=>m[1]);console.log(JSON.stringify({whatsapp,facebook,instagram,tiktok},null,2))'
```

Expected: an object with four non-empty strings starting `M17.472`, `M24 12.073`, `M12 2.163`, `M12.525.02`. Write the file with that object as `ICON_PATHS`:

```tsx
import { site } from "@/content/site";

// Paths copied from the original home page SVGs (24×24 viewBox).
const ICON_PATHS = {
  whatsapp: "M17.472 14.382c-.297-.149…", // full strings from the command output
  facebook: "M24 12.073c0-6.627…",
  instagram: "M12 2.163c3.204 0…",
  tiktok: "M12.525.02c1.31-.02…",
} as const;

export type SocialIconName = keyof typeof ICON_PATHS;

export function SocialIcon({ name, className = "w-6 h-6" }: { name: SocialIconName; className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

const LINKS: { name: SocialIconName; label: string; href: string }[] = [
  { name: "instagram", label: "Instagram", href: site.social.instagram },
  { name: "facebook", label: "Facebook", href: site.social.facebook },
  { name: "tiktok", label: "TikTok", href: site.social.tiktok },
];

export function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`flex gap-3 ${className}`}>
      {LINKS.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label}
          className="w-11 h-11 rounded-full border-2 border-ink bg-white text-ink flex items-center justify-center hover:bg-hk-yellow transition-colors"
        >
          <SocialIcon name={link.name} className="w-5 h-5" />
        </a>
      ))}
    </div>
  );
}
```

Check nothing was truncated: `grep -c '…' src/components/SocialIcons.tsx` must print `0`.

- [ ] **Step 6: Create `src/components/WhatsAppButton.tsx`**

```tsx
import { site } from "@/content/site";
import { whatsappUrl } from "@/lib/links";
import { SocialIcon } from "./SocialIcons";

export default function WhatsAppButton({
  label = "Pide por WhatsApp",
  className = "px-6 py-3",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <a
      href={whatsappUrl(site.whatsapp, site.whatsappMessage)}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn bg-whatsapp ${className}`}
    >
      <SocialIcon name="whatsapp" className="w-5 h-5" />
      {label}
    </a>
  );
}
```

- [ ] **Step 7: Create `src/components/SiteHeader.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import WhatsAppButton from "./WhatsAppButton";

const NAV = [
  { href: "/menu", label: "Menú" },
  { href: "/#nosotros", label: "Nosotros" },
  { href: "/#ubicacion", label: "Ubicación" },
  { href: "/#galeria", label: "Galería" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 h-16 bg-cream/95 backdrop-blur border-b-[3px] border-ink">
      <div className="max-w-6xl mx-auto h-full px-4 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/img/logo.webp" alt={site.name} width={40} height={50} priority className="h-12 w-auto" />
          <span className="font-display text-xl font-extrabold hidden sm:inline">{site.name}</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 font-display font-bold">
          {NAV.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-hk-orange-ink transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/menu" className="btn px-4 py-1.5 text-sm bg-hk-orange md:hidden">
            Menú
          </Link>
          <WhatsAppButton label="WhatsApp" className="px-4 py-1.5 text-sm" />
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 8: Create `src/components/SiteFooter.tsx`**

```tsx
import { fullAddress, site } from "@/content/site";
import { SocialLinks } from "./SocialIcons";

export default function SiteFooter() {
  return (
    <footer className="bg-ink text-cream">
      <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-extrabold text-hk-orange">{site.name}</p>
          <p className="mt-1 text-cream/80">{site.tagline}</p>
        </div>
        <div className="space-y-1">
          <p>📍 {fullAddress}</p>
          <p>
            📞{" "}
            <a href={`tel:+57${site.phone}`} className="hover:underline">
              {site.phone}
            </a>
          </p>
          {site.hours.map((hours) => (
            <p key={hours.days} className="text-sm text-cream/70">
              {hours.days}: {hours.time}
            </p>
          ))}
        </div>
        <SocialLinks className="md:justify-end" />
      </div>
      <p className="text-center text-xs text-cream/50 pb-6">
        © {new Date().getFullYear()} {site.name}
      </p>
    </footer>
  );
}
```

- [ ] **Step 9: Verify**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 10: Commit**

```bash
git add src/lib/links.ts src/lib/links.test.ts src/components
git commit -m "Add shared header, footer, social icons and WhatsApp button"
```

---

### Task 5: Landing page

**Files:**
- Create: `src/components/landing/Hero.tsx`
- Create: `src/components/landing/FeaturedDrinks.tsx`
- Create: `src/components/landing/About.tsx`
- Create: `src/components/landing/Location.tsx`
- Create: `src/components/landing/Gallery.tsx`
- Create: `src/components/landing/LocalBusinessJsonLd.tsx`
- Create: `public/img/gallery/.gitkeep`
- Modify: `src/app/page.tsx` (full replacement)

**Interfaces:**
- Consumes: `getFeaturedDrinks()` (Task 2), `site`/`fullAddress` (Task 3), `mapsEmbedUrl`/`mapsSearchUrl`, `SocialIcon`, `WhatsAppButton`, `SiteHeader`, `SiteFooter` (Task 4).
- Produces: section anchors `#nosotros`, `#ubicacion`, `#galeria` that `SiteHeader` links to.

- [ ] **Step 1: Create `src/components/landing/Hero.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import WhatsAppButton from "@/components/WhatsAppButton";

// Shapes echoing the logo's triangles, bolts and dots.
function Decorations() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <svg className="absolute top-10 left-[6%] w-10 text-hk-orange rotate-12" viewBox="0 0 40 40">
        <path d="M4 34 L20 6 L36 34 Z" fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
      </svg>
      <svg className="absolute bottom-12 right-[8%] w-8 text-hk-yellow stroke-ink" viewBox="0 0 24 40">
        <path d="M14 2 L2 22 H11 L8 38 L22 14 H13 Z" fill="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
      <div className="absolute top-1/3 right-[45%] w-6 h-6 rounded-full border-[5px] border-hk-cyan" />
      <div className="absolute bottom-20 left-[12%] w-5 h-5 rounded-full bg-hk-magenta border-2 border-ink" />
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <Decorations />
      <div className="relative max-w-6xl mx-auto px-4 py-12 md:py-20 grid md:grid-cols-2 gap-10 items-center">
        <div className="text-center md:text-left order-2 md:order-1">
          <p className="inline-block sticker bg-hk-yellow px-4 py-1 font-display font-bold text-sm -rotate-2">
            📍 {site.address.neighborhood} · {site.address.city}
          </p>
          <h1 className="mt-5 font-display text-5xl md:text-6xl font-extrabold leading-[1.05]">
            Cócteles <span className="text-hk-orange-ink">granizados</span> con y sin{" "}
            <span className="text-hk-purple">licor</span>
          </h1>
          <p className="mt-5 text-lg text-ink/80 max-w-md mx-auto md:mx-0">
            Frescos, coloridos y con toppings para todos los gustos. Ven a HK o pide el tuyo por WhatsApp.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center md:justify-start">
            <Link href="/menu" className="btn px-6 py-3 text-lg bg-hk-orange">
              Ver menú
            </Link>
            <WhatsAppButton className="px-6 py-3 text-lg" />
          </div>
        </div>
        <div className="order-1 md:order-2 flex justify-center">
          <Image
            src="/img/logo.webp"
            alt={`Logo de ${site.name}`}
            width={1469}
            height={1847}
            priority
            sizes="(min-width: 768px) 448px, 256px"
            className="w-64 md:w-full max-w-md h-auto"
          />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `src/components/landing/FeaturedDrinks.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";
import { getFeaturedDrinks } from "@/lib/menu";
import type { FeaturedDrink } from "@/lib/menu-data";

export default async function FeaturedDrinks() {
  let drinks: FeaturedDrink[];
  try {
    drinks = await getFeaturedDrinks();
  } catch (error) {
    // The rest of the landing page still works without the sheet.
    console.error("Failed to load featured drinks", error);
    return null;
  }
  if (drinks.length === 0) return null;

  return (
    <section className="bg-hk-mint/40 border-y-[3px] border-ink py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="font-display text-4xl font-extrabold text-center">Los favoritos de la casa</h2>
        <p className="mt-2 text-center text-ink/70">Sabores que vuelan cada día</p>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {drinks.map((drink) => (
            <div key={drink.id} className="sticker bg-white p-4 text-center">
              <div
                className={`${drink.bgColor} rounded-xl border-2 border-ink aspect-square flex items-center justify-center overflow-hidden`}
              >
                <Image src={drink.image} alt={drink.name} width={240} height={240} className="object-contain w-4/5 h-4/5" />
              </div>
              <h3 className="mt-3 font-display text-xl font-bold leading-tight">{drink.name}</h3>
              {drink.description && <p className="text-sm text-ink/70">{drink.description}</p>}
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/menu" className="btn px-6 py-3 text-lg bg-hk-orange">
            Ver menú completo
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create `src/components/landing/About.tsx`**

```tsx
import { site } from "@/content/site";

export default function About() {
  return (
    <section id="nosotros" className="scroll-mt-20 py-16">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="font-display text-4xl font-extrabold">
          Somos <span className="text-hk-purple">HK</span>
        </h2>
        <div className="mt-6 space-y-4 text-lg text-ink/80">
          {site.about.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create `src/components/landing/Location.tsx`**

```tsx
import { fullAddress, site } from "@/content/site";
import { mapsEmbedUrl, mapsSearchUrl } from "@/lib/links";

export default function Location() {
  return (
    <section id="ubicacion" className="scroll-mt-20 py-16 bg-hk-cyan/15 border-y-[3px] border-ink">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8">
        <div className="sticker bg-white p-6 md:p-8">
          <h2 className="font-display text-4xl font-extrabold">Visítanos</h2>
          <p className="mt-4 text-lg">📍 {fullAddress}</p>
          <h3 className="mt-6 font-display text-xl font-bold">Horario</h3>
          <dl className="mt-2 divide-y-2 divide-dashed divide-ink/15">
            {site.hours.map((hours) => (
              <div key={hours.days} className="flex justify-between gap-4 py-2">
                <dt>{hours.days}</dt>
                <dd className="font-bold text-right">{hours.time}</dd>
              </div>
            ))}
          </dl>
          <a
            href={mapsSearchUrl(site.mapsQuery)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn mt-6 px-6 py-3 bg-hk-yellow"
          >
            Cómo llegar
          </a>
        </div>
        <div className="sticker overflow-hidden bg-white min-h-80">
          <iframe
            title={`Mapa de ${site.name}`}
            src={mapsEmbedUrl(site.mapsQuery)}
            className="w-full h-full min-h-80"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Create `src/components/landing/Gallery.tsx` and the gallery folder**

```bash
mkdir -p public/img/gallery && touch public/img/gallery/.gitkeep
```

```tsx
import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import { site } from "@/content/site";
import { SocialIcon } from "@/components/SocialIcons";

// Drop photos into public/img/gallery/ and they show up here, sorted by filename.
const GALLERY_DIR = path.join(process.cwd(), "public", "img", "gallery");
const IMAGE_FILE = /\.(jpe?g|png|webp|avif)$/i;

const PLACEHOLDERS = [
  { color: "bg-hk-orange", emoji: "🍹" },
  { color: "bg-hk-magenta", emoji: "🧊" },
  { color: "bg-hk-mint", emoji: "🍸" },
  { color: "bg-hk-cyan", emoji: "🍭" },
  { color: "bg-hk-yellow", emoji: "✨" },
  { color: "bg-hk-purple", emoji: "🥤" },
];

function galleryPhotos(): string[] {
  if (!fs.existsSync(GALLERY_DIR)) return [];
  return fs
    .readdirSync(GALLERY_DIR)
    .filter((file) => IMAGE_FILE.test(file))
    .sort()
    .map((file) => `/img/gallery/${file}`);
}

export default function Gallery() {
  const photos = galleryPhotos();

  return (
    <section id="galeria" className="scroll-mt-20 py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="font-display text-4xl font-extrabold text-center">Galería</h2>
        <p className="mt-2 text-center text-ink/70">Así se vive HK</p>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {photos.length > 0
            ? photos.map((src, index) => (
                <div
                  key={src}
                  className={`sticker relative aspect-square overflow-hidden ${index % 2 ? "rotate-1" : "-rotate-1"}`}
                >
                  <Image
                    src={src}
                    alt={`Foto ${index + 1} de ${site.name}`}
                    fill
                    sizes="(min-width: 768px) 33vw, 50vw"
                    className="object-cover"
                  />
                </div>
              ))
            : PLACEHOLDERS.map((tile, index) => (
                <div
                  key={tile.color}
                  aria-hidden="true"
                  className={`sticker aspect-square ${tile.color} flex items-center justify-center text-5xl ${index % 2 ? "rotate-1" : "-rotate-1"}`}
                >
                  {tile.emoji}
                </div>
              ))}
        </div>
        <div className="mt-10 text-center">
          <a
            href={site.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="btn px-6 py-3 text-lg bg-hk-magenta"
          >
            <SocialIcon name="instagram" className="w-5 h-5" />
            Síguenos en Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Create `src/components/landing/LocalBusinessJsonLd.tsx`**

```tsx
import { site } from "@/content/site";

// Structured data so Google can show the address, hours and phone.
export default function LocalBusinessJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "BarOrPub",
    name: site.name,
    description: site.description,
    url: site.url,
    image: `${site.url}/img/logo.webp`,
    telephone: `+57${site.phone}`,
    servesCuisine: "Cócteles granizados",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    openingHours: site.hours.map((hours) => hours.schema),
    sameAs: Object.values(site.social),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
```

- [ ] **Step 7: Replace `src/app/page.tsx`**

```tsx
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Hero from "@/components/landing/Hero";
import FeaturedDrinks from "@/components/landing/FeaturedDrinks";
import About from "@/components/landing/About";
import Location from "@/components/landing/Location";
import Gallery from "@/components/landing/Gallery";
import LocalBusinessJsonLd from "@/components/landing/LocalBusinessJsonLd";

export const revalidate = 60;

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <LocalBusinessJsonLd />
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <FeaturedDrinks />
        <About />
        <Location />
        <Gallery />
      </main>
      <SiteFooter />
    </div>
  );
}
```

- [ ] **Step 8: Verify**

Run: `npm run lint && npm run build`
Expected: both pass; build output lists `/` as static with 1m revalidate.

- [ ] **Step 9: Commit**

```bash
git add src/components/landing src/app/page.tsx public/img/gallery/.gitkeep
git commit -m "Add promotional landing page"
```

---

### Task 6: Restyle `/menu`

**Files:**
- Modify: `src/app/menu/page.tsx` (full replacement)

**Interfaces:**
- Consumes: `getMenu()` and types `MenuItem`, `MenuSection` (Task 2); `SiteHeader`, `SiteFooter`, `WhatsAppButton` (Task 4); `sticker` utility and tokens (Task 3).

- [ ] **Step 1: Replace `src/app/menu/page.tsx`**

```tsx
import type { Metadata } from "next";
import Image from "next/image";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getMenu } from "@/lib/menu";
import type { MenuItem, MenuSection } from "@/lib/menu-data";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Menú",
  description: "Granizados con y sin licor, especiales, sodas, extras y toppings de HK Cocteles en Cali.",
};

const ITEM_GRID = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";

// Toppings use a smaller card without description.
const ItemCard = ({ item, compact }: { item: MenuItem; compact: boolean }) => (
  <div className="sticker bg-white p-3 flex items-center gap-4">
    <div
      className={`${compact ? "w-12 h-12" : "w-16 h-16"} ${item.bgColor} rounded-xl border-2 border-ink flex items-center justify-center flex-shrink-0 overflow-hidden`}
    >
      {item.image ? (
        <Image
          src={item.image}
          alt={item.name}
          width={compact ? 48 : 64}
          height={compact ? 48 : 64}
          className="object-contain w-full h-full"
        />
      ) : (
        <span className={compact ? "text-xl" : "text-2xl"}>{item.emoji}</span>
      )}
    </div>
    <div className="flex-1">
      <h4 className="font-display text-lg font-bold leading-tight">{item.name}</h4>
      {!compact && item.description && <p className="text-sm text-ink/70">{item.description}</p>}
      {item.price && <p className="font-display font-bold text-hk-orange-ink">{item.price}</p>}
    </div>
  </div>
);

const SectionTabs = ({ sections }: { sections: MenuSection[] }) => (
  <nav aria-label="Secciones del menú" className="sticky top-16 z-20 bg-cream/95 backdrop-blur border-b-2 border-ink/10">
    <div className="max-w-6xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto">
      {sections.map((section) => (
        <a
          key={section.key}
          href={`#${section.key}`}
          className="shrink-0 rounded-full border-2 border-ink bg-white px-4 py-1.5 font-display text-sm font-bold hover:bg-hk-yellow transition-colors"
        >
          {section.icon} {section.title}
        </a>
      ))}
    </div>
  </nav>
);

const MenuSectionBlock = ({ section }: { section: MenuSection }) => {
  const compact = section.key === "toppings";

  return (
    <section id={section.key} className="scroll-mt-32 sticker bg-white/60 p-5 md:p-8">
      <h2 className={`font-display text-3xl font-extrabold ${section.color} mb-6 flex items-center gap-3`}>
        <span>{section.icon}</span>
        {section.title}
      </h2>
      <div className="space-y-8">
        {section.sizes.length > 0 && (
          <div>
            <h3 className="font-display text-lg font-bold mb-3">Tamaños disponibles</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {section.sizes.map((size, index) => (
                <div key={index} className="text-center rounded-xl border-2 border-ink bg-hk-yellow/40 p-3">
                  <p className="font-bold">{size.size}</p>
                  <p className="font-display font-bold text-hk-orange-ink">{size.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {section.items.length > 0 && (
          <div className={ITEM_GRID}>
            {section.items.map((item) => (
              <ItemCard key={item.id} item={item} compact={compact} />
            ))}
          </div>
        )}
        {section.subsections.map((subsection) => (
          <div key={subsection.title}>
            <h3 className="font-display text-xl font-bold mb-4 border-b-2 border-dashed border-ink/30 pb-2">
              {subsection.title}
            </h3>
            <div className={ITEM_GRID}>
              {subsection.items.map((item) => (
                <ItemCard key={item.id} item={item} compact={compact} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default async function MenuPage() {
  let sections: MenuSection[] = [];
  try {
    sections = await getMenu();
  } catch (error) {
    console.error("Failed to load menu from Google Sheets", error);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      {sections.length > 0 && <SectionTabs sections={sections} />}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="font-display text-5xl font-extrabold">Menú</h1>
          <p className="mt-2 text-ink/70">Granizados con y sin licor para todos los gustos</p>
        </div>
        {sections.length > 0 ? (
          <div className="space-y-10">
            {sections.map((section) => (
              <MenuSectionBlock key={section.key} section={section} />
            ))}
          </div>
        ) : (
          <div className="sticker bg-white p-8 text-center max-w-md mx-auto">
            <p className="font-display text-2xl font-bold mb-2">Menú no disponible 😅</p>
            <p className="mb-6 text-ink/70">
              Estamos actualizando el menú. Escríbenos por WhatsApp y te contamos qué hay hoy.
            </p>
            <WhatsAppButton />
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm test && npm run lint && npm run build`
Expected: all pass; `/menu` listed with 1m revalidate.

- [ ] **Step 3: Commit**

```bash
git add src/app/menu/page.tsx
git commit -m "Restyle menu page with brand theme and section tabs"
```

---

### Task 7: Browser verification

**Files:** none expected (fix-ups only if checks fail, committed separately).

- [ ] **Step 1: Start the dev server** via the preview tooling (`.claude/launch.json` entry running `npm run dev` on port 3000).

- [ ] **Step 2: Check `/` at 375px and desktop width**
  - No horizontal scroll: `document.documentElement.scrollWidth <= window.innerWidth`.
  - Featured drinks show product images from the sheet (no duplicate flavor names).
  - Header links `Nosotros`, `Ubicación`, `Galería` scroll to their sections.
  - Map iframe loads; "Cómo llegar" and WhatsApp hrefs are correct (`https://wa.me/573180318210?text=...`).
  - Gallery shows 6 placeholder tiles.
  - Exactly one `script[type="application/ld+json"]` with valid JSON.

- [ ] **Step 3: Check `/menu` at 375px and desktop width**
  - All active sheet sections render in `orderIndex` order (sinLicor, conLicor, extras, toppings, especiales, sodas).
  - Section tabs scroll horizontally on mobile and jump to sections without the heading hiding under the sticky bars.
  - Sheet-driven colors (`bg-*-100` thumbnails, `text-*-600` headings) render.

- [ ] **Step 4: Check `/admin`** loads its login form and is readable on the new background.

- [ ] **Step 5: Final run**

Run: `npm test && npm run lint && npm run build`
Expected: all pass.
