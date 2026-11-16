import { GOOGLE_SHEETS_URL } from "@/app/constants/environment";
import { ITEMS, SECTIONS, SIZES, SUBSECTIONS } from "@/app/constants/database";
import { site } from "@/content/site";
import { buildMenu, parseSheetCsv, pickFeatured } from "./menu-data";
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

async function fetchTab<T>(tab: string, keyColumn: string): Promise<T[]> {
  const res = await fetch(`${GOOGLE_SHEETS_URL}${tab}`, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) {
    throw new Error(`Google Sheets tab "${tab}" responded ${res.status}`);
  }
  return parseSheetCsv<T>(await res.text(), tab, keyColumn);
}

export async function getMenu(): Promise<MenuSection[]> {
  const [sections, sizes, subsections, items] = await Promise.all([
    fetchTab<SheetSection>(SECTIONS, "key"),
    fetchTab<SheetSize>(SIZES, "sectionKey"),
    fetchTab<SheetSubsection>(SUBSECTIONS, "id"),
    fetchTab<SheetItem>(ITEMS, "id"),
  ]);
  return buildMenu({ sections, sizes, subsections, items });
}

export async function getFeaturedDrinks(limit = 6): Promise<FeaturedDrink[]> {
  return pickFeatured(await getMenu(), site.featuredSections, limit);
}
