import { NextRequest, NextResponse } from 'next/server';
import { dbOperations } from '@/lib/database';

// PUT /api/menu/sizes/[id] - Update size
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { size, price } = body;

    const result = dbOperations.updateSize(parseInt(id), size, price);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Size not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating size:', error);
    return NextResponse.json(
      { error: 'Failed to update size' },
      { status: 500 }
    );
  }
}

// DELETE /api/menu/sizes/[id] - Delete size
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = dbOperations.deleteSize(parseInt(id));

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Size not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting size:', error);
    return NextResponse.json(
      { error: 'Failed to delete size' },
      { status: 500 }
    );
  }
}
