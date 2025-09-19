import { NextRequest, NextResponse } from 'next/server';
import { dbOperations } from '@/lib/database';

// GET /api/menu - Get all menu data
export async function GET() {
  try {
    const sections = dbOperations.getAllSections();
    const menuData: any = {};

    for (const section of sections) {
      const sectionData: any = {
        id: section.id,
        title: section.title,
        icon: section.icon,
        color: section.color,
        active: Boolean(section.active),
      };

      // Get sizes for this section
      const sizes = dbOperations.getSizes(section.key);
      if (sizes.length > 0) {
        sectionData.sizes = sizes.map(size => ({
          id: size.id,
          size: size.size,
          price: size.price,
        }));
      }

      // Get subsections for this section
      const subsections = dbOperations.getSubsections(section.key);
      if (subsections.length > 0) {
        sectionData.subsections = subsections.map(subsection => {
          const items = dbOperations.getItemsBySubsection(subsection.id);
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
      const items = dbOperations.getItems(section.key);
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
