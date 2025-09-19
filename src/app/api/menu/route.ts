import { NextResponse } from 'next/server';
import { dbOperations } from '@/lib/database';

// Type definitions for database records
interface DBSection {
  id: number;
  key: string;
  title: string;
  icon: string;
  color: string;
  active: number;
  created_at: string;
  updated_at: string;
}

interface DBSize {
  id: number;
  section_key: string;
  size: string;
  price: string;
  created_at: string;
  updated_at: string;
}

interface DBSubsection {
  id: number;
  section_key: string;
  title: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface DBItem {
  id: number;
  section_key: string | null;
  subsection_id: number | null;
  name: string;
  description: string | null;
  price: string | null;
  emoji: string;
  bg_color: string;
  image: string | null;
  active: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

// Type definitions for API response
interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: string | null;
  emoji: string;
  bgColor: string;
  image: string | null;
  active: boolean;
}

interface Size {
  id: number;
  size: string;
  price: string;
}

interface Subsection {
  id: number;
  title: string;
  items: MenuItem[];
}

interface MenuSection {
  id: number;
  title: string;
  icon: string;
  color: string;
  sizes?: Size[];
  items?: MenuItem[];
  subsections?: Subsection[];
  active: boolean;
}

interface MenuData {
  [key: string]: MenuSection;
}

// GET /api/menu - Get all menu data
export async function GET() {
  try {
    const sections = dbOperations.getAllSections() as DBSection[];
    const menuData: MenuData = {};

    for (const section of sections) {
      const sectionData: MenuSection = {
        id: section.id,
        title: section.title,
        icon: section.icon,
        color: section.color,
        active: Boolean(section.active),
      };

      // Get sizes for this section
      const sizes = dbOperations.getSizes(section.key) as DBSize[];
      if (sizes.length > 0) {
        sectionData.sizes = sizes.map(size => ({
          id: size.id,
          size: size.size,
          price: size.price,
        }));
      }

      // Get subsections for this section
      const subsections = dbOperations.getSubsections(section.key) as DBSubsection[];
      if (subsections.length > 0) {
        sectionData.subsections = subsections.map(subsection => {
          const items = dbOperations.getItemsBySubsection(subsection.id) as DBItem[];
          return {
            id: subsection.id,
            title: subsection.title,
            items: items.map(item => ({
              id: item.id,
              name: item.name,
              description: item.description,
              price: item.price,
              emoji: item.emoji,
              bgColor: item.bg_color,
              image: item.image,
              active: Boolean(item.active),
            })),
          };
        });
      }

      // Get direct items for this section (not in subsections)
      const items = dbOperations.getItems(section.key) as DBItem[];
      if (items.length > 0) {
        sectionData.items = items.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          emoji: item.emoji,
          bgColor: item.bg_color,
          image: item.image,
          active: Boolean(item.active),
        }));
      }

      menuData[section.key] = sectionData;
    }

    return NextResponse.json(menuData);
  } catch (error) {
    console.error('Error fetching menu data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu data' },
      { status: 500 }
    );
  }
}
