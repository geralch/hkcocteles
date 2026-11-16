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
