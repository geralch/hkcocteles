import { NextRequest, NextResponse } from 'next/server';
import { dbOperations } from '@/lib/database';

// POST /api/menu/items - Create item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sectionKey, subsectionId, name, description, price, emoji, bgColor, image, active, orderIndex } = body as {
      sectionKey?: string | null;
      subsectionId?: number | null;
      name: string;
      description?: string | null;
      price?: string | null;
      emoji?: string;
      bgColor?: string;
      image?: string | null;
      active?: boolean;
      orderIndex?: number;
    };

    if (!name) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      );
    }

    const result = dbOperations.insertItem(
      sectionKey ?? null,
      subsectionId ?? null,
      name,
      description ?? null,
      price ?? null,
      emoji ?? '✨',
      bgColor ?? 'bg-gray-200',
      image ?? null,
      active ?? true,
      orderIndex ?? 0,
    );

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Failed to create item' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: Number(result.lastInsertRowid),
      sectionKey: sectionKey ?? null,
      subsectionId: subsectionId ?? null,
      name,
      description: description ?? null,
      price: price ?? null,
      emoji: emoji ?? '✨',
      bgColor: bgColor ?? 'bg-gray-200',
      image: image ?? null,
      active: active ?? true,
      orderIndex: orderIndex ?? 0,
    });
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    );
  }
}


