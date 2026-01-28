import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../server/db';
import { orders, orderItems, products } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { getUserFromRequest } from '@/lib/auth';

function generateOrderNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let part1 = '';
  let part2 = '';
  for (let i = 0; i < 5; i++) {
    part1 += chars.charAt(Math.floor(Math.random() * chars.length));
    part2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ORD-${part1}-${part2}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      items,
      shippingAddress,
      deliveryMethod,
      paymentMethod,
      subtotal,
      shippingCost,
      discount,
      total,
      couponCode,
    } = body;

    const user = getUserFromRequest(request);

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 });
    }

    if (!shippingAddress) {
      return NextResponse.json({ error: 'Shipping address required' }, { status: 400 });
    }

    const orderNumber = generateOrderNumber();
    const isNextDay = deliveryMethod === 'nextday';

    const [newOrder] = await db
      .insert(orders)
      .values({
        orderNumber,
        userId: user?.userId || null,
        shippingAddress: shippingAddress,
        shippingMethod: deliveryMethod || 'standard',
        paymentMethod: paymentMethod || 'card',
        paymentStatus: 'paid',
        status: 'processing',
        subtotal: subtotal.toString(),
        shippingCost: shippingCost?.toString() || '0.00',
        discount: discount?.toString() || '0.00',
        total: total.toString(),
        couponCode: couponCode || null,
        isNextDayDelivery: isNextDay,
      })
      .returning();

    for (const item of items) {
      const [product] = await db
        .select({ price: products.price, name: products.name })
        .from(products)
        .where(eq(products.id, item.productId))
        .limit(1);

      await db.insert(orderItems).values({
        orderId: newOrder.id,
        productId: item.productId,
        name: item.name || product?.name || 'Unknown',
        price: item.price.toString(),
        quantity: item.quantity,
        total: (item.price * item.quantity).toString(),
        variantId: item.variantId || null,
      });

      const [currentProduct] = await db
        .select({ stock: products.stock })
        .from(products)
        .where(eq(products.id, item.productId));
      
      if (currentProduct) {
        await db
          .update(products)
          .set({ stock: Math.max(0, (currentProduct.stock || 0) - item.quantity) })
          .where(eq(products.id, item.productId));
      }
    }

    return NextResponse.json({
      success: true,
      orderNumber: newOrder.orderNumber,
      orderId: newOrder.id,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, user.userId))
      .orderBy(desc(orders.createdAt));

    return NextResponse.json(userOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
