import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../server/db';
import { orders, orderItems } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const orderId = parseInt(params.id, 10);
    if (isNaN(orderId)) return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });

    const [order] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, auth.userId)))
      .limit(1);

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    return NextResponse.json({ ...order, items });
  } catch (error) {
    console.error('Order fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
