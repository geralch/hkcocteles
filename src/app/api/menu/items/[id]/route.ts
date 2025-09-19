import { NextRequest, NextResponse } from 'next/server';
import { dbOperations } from '@/lib/database';

// PUT /api/menu/items/[id] - Update item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, description, price, emoji, bgColor, image, active, orderIndex } = body;

    const result = dbOperations.updateItem(
      parseInt(id),
      name,
      description,
      price,
      emoji,
      bgColor,
      image,
      active,
      orderIndex || 0
    );

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    );
  }
}

// DELETE /api/menu/items/[id] - Delete item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = dbOperations.deleteItem(parseInt(id));

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}
