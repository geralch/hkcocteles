import { NextRequest, NextResponse } from 'next/server';
import { dbOperations } from '@/lib/database';

// POST /api/menu/sections - Create section
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, title, icon, color, active } = body as {
      key: string;
      title: string;
      icon: string;
      color: string;
      active?: boolean;
    };

    if (!key || !title || !icon || !color) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = dbOperations.insertSection(key, title, icon, color, active ?? true);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Failed to create section' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: Number(result.lastInsertRowid),
      key,
      title,
      icon,
      color,
      active: active ?? true,
    });
  } catch (error) {
    console.error('Error creating section:', error);
    return NextResponse.json(
      { error: 'Failed to create section' },
      { status: 500 }
    );
  }
}


