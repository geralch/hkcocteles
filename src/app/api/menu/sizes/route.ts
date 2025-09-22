import { NextRequest, NextResponse } from 'next/server';
import { dbOperations } from '@/lib/database';

// POST /api/menu/sizes - Create size
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sectionKey, size, price } = body as {
      sectionKey?: string;
      size: string;
      price: string;
    };

    if (!sectionKey || !size || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = dbOperations.insertSize(sectionKey, size, price);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Failed to create size' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: Number(result.lastInsertRowid),
      sectionKey,
      size,
      price,
    });
  } catch (error) {
    console.error('Error creating size:', error);
    return NextResponse.json(
      { error: 'Failed to create size' },
      { status: 500 }
    );
  }
}


