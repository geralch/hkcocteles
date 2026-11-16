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
  // next/image only allows local paths here (no remotePatterns configured).
  image: item.image?.startsWith("/") && !item.image.startsWith("//") ? item.image : undefined,
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
