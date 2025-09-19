import { NextRequest, NextResponse } from 'next/server';
import { dbOperations } from '@/lib/database';

// PUT /api/menu/sections/[key] - Update section
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const body = await request.json();
    const { title, icon, color, active } = body;

    const result = dbOperations.updateSection(key, title, icon, color, active);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating section:', error);
    return NextResponse.json(
      { error: 'Failed to update section' },
      { status: 500 }
    );
  }
}
