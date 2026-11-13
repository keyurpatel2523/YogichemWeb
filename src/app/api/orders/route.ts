import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../server/db';
import { coupons, orders, orderItems, products } from '@shared/schema';
import { and, desc, eq, gte, inArray, sql } from 'drizzle-orm';
import { getUserFromRequest } from '@/lib/auth';
import { summariseOrder, type CouponRule } from '@/lib/order-pricing';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { sendOrderConfirmationEmail } from '@/utils/orderEmail';

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

class OrderRejected extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

export async function POST(request: NextRequest) {
  const limit = rateLimit(`order:${clientIp(request)}`, 20, 60 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to place an order' }, { status: 401 });
    }

    const body = await request.json();
    const items = Array.isArray(body.items) ? body.items : [];
    const shippingAddress = body.shippingAddress;
    const deliveryMethod = String(body.deliveryMethod || 'standard');

    if (!shippingAddress || typeof shippingAddress !== 'object') {
      throw new OrderRejected('Shipping address required');
    }
    for (const field of ['firstName', 'lastName', 'email', 'address1', 'city', 'postalCode', 'country'] as const) {
      if (!String(shippingAddress[field] || '').trim()) {
        throw new OrderRejected('Shipping address is incomplete');
      }
    }

    const quantities = new Map<number, { quantity: number; variantId: number | null }>();
    for (const item of items) {
      const productId = Number(item?.productId);
      const quantity = Number(item?.quantity);
      if (!Number.isInteger(productId) || productId < 1 || !Number.isInteger(quantity)) {
        throw new OrderRejected('Each item needs a valid product and quantity');
      }
      const existing = quantities.get(productId);
      quantities.set(productId, {
        quantity: (existing?.quantity || 0) + quantity,
        variantId: item?.variantId ? Number(item.variantId) : existing?.variantId || null,
      });
    }
    if (quantities.size === 0) {
      throw new OrderRejected('No items in order');
    }

    const productIds = Array.from(quantities.keys());
    const rows = await db.select().from(products).where(inArray(products.id, productIds));

    if (rows.length !== productIds.length) {
      throw new OrderRejected('One or more products are no longer available');
    }

    const lines = rows.map((product) => {
      const requested = quantities.get(product.id)!;
      if (product.isActive === false) {
        throw new OrderRejected(`${product.name} is not available`);
      }
      if ((product.stock ?? 0) < requested.quantity) {
        throw new OrderRejected(`${product.name} does not have enough stock`);
      }
      return {
        product,
        quantity: requested.quantity,
        variantId: requested.variantId,
        unitPrice: Number(product.price),
      };
    });

    let couponRule: CouponRule | null = null;
    let couponRecord: { id: number; code: string; usageLimit: number | null } | null = null;
    const requestedCode = String(body.couponCode || '').trim().toUpperCase();
    if (requestedCode) {
      const coupon = await db.query.coupons.findFirst({
        where: eq(coupons.code, requestedCode),
      });
      const now = new Date();
      if (!coupon || !coupon.isActive) {
        throw new OrderRejected('Invalid or expired coupon');
      }
      if (coupon.startDate && coupon.startDate > now) throw new OrderRejected('Invalid or expired coupon');
      if (coupon.endDate && coupon.endDate < now) throw new OrderRejected('Invalid or expired coupon');
      couponRule = {
        type: coupon.type,
        value: Number(coupon.value),
        minOrderAmount: coupon.minOrderAmount != null ? Number(coupon.minOrderAmount) : null,
        maxDiscount: coupon.maxDiscount != null ? Number(coupon.maxDiscount) : null,
        usageLimit: coupon.usageLimit,
        usedCount: coupon.usedCount,
      };
      couponRecord = { id: coupon.id, code: coupon.code, usageLimit: coupon.usageLimit };
    }

    const summary = summariseOrder({
      lines: lines.map((line) => ({ unitPrice: line.unitPrice, quantity: line.quantity })),
      deliveryMethod,
      coupon: couponRule,
    });
    if (!summary.ok) throw new OrderRejected(summary.error);

    const orderNumber = generateOrderNumber();
    const created = await db.transaction(async (tx) => {
      const [newOrder] = await tx
        .insert(orders)
        .values({
          orderNumber,
          userId: user.userId,
          shippingAddress,
          shippingMethod: summary.deliveryMethod,
          paymentMethod: 'none',
          paymentStatus: 'unpaid',
          status: 'pending',
          subtotal: summary.subtotal.toFixed(2),
          shippingCost: summary.shipping.toFixed(2),
          discount: summary.discount.toFixed(2),
          total: summary.total.toFixed(2),
          couponCode: couponRecord?.code || null,
          isNextDayDelivery: summary.deliveryMethod === 'nextday',
        })
        .returning();

      const savedItems: { name: string; quantity: number; price: string; total: string }[] = [];

      for (const line of lines) {
        const itemTotal = (line.unitPrice * line.quantity).toFixed(2);
        const [stocked] = await tx
          .update(products)
          .set({
            stock: sql`${products.stock} - ${line.quantity}`,
            updatedAt: new Date(),
          })
          .where(and(eq(products.id, line.product.id), gte(products.stock, line.quantity)))
          .returning({ id: products.id });

        if (!stocked) {
          throw new OrderRejected(`${line.product.name} does not have enough stock`);
        }

        await tx.insert(orderItems).values({
          orderId: newOrder.id,
          productId: line.product.id,
          name: line.product.name,
          sku: line.product.sku,
          price: line.unitPrice.toFixed(2),
          quantity: line.quantity,
          total: itemTotal,
          variantId: line.variantId,
        });

        savedItems.push({
          name: line.product.name,
          quantity: line.quantity,
          price: line.unitPrice.toFixed(2),
          total: itemTotal,
        });
      }

      if (couponRecord) {
        const usageGuard = couponRecord.usageLimit == null
          ? eq(coupons.id, couponRecord.id)
          : and(eq(coupons.id, couponRecord.id), sql`coalesce(${coupons.usedCount}, 0) < ${couponRecord.usageLimit}`);
        const [used] = await tx
          .update(coupons)
          .set({ usedCount: sql`coalesce(${coupons.usedCount}, 0) + 1` })
          .where(usageGuard)
          .returning({ id: coupons.id });
        if (!used) throw new OrderRejected('Coupon usage limit reached');
      }

      return { newOrder, savedItems };
    });

    let emailSent = false;
    try {
      await sendOrderConfirmationEmail({
        orderNumber: created.newOrder.orderNumber,
        customerName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        customerEmail: String(shippingAddress.email),
        items: created.savedItems,
        shippingAddress,
        subtotal: summary.subtotal.toFixed(2),
        shippingCost: summary.shipping.toFixed(2),
        discount: summary.discount.toFixed(2),
        total: summary.total.toFixed(2),
        deliveryMethod: summary.deliveryMethod,
        paymentMethod: 'none',
        paymentStatus: 'unpaid',
      });
      emailSent = true;
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'Unknown error';
      console.error('Order confirmation email failed (non-fatal):', detail);
    }

    return NextResponse.json({
      success: true,
      orderNumber: created.newOrder.orderNumber,
      orderId: created.newOrder.id,
      paymentStatus: 'unpaid',
      total: summary.total,
      emailSent,
    });
  } catch (error) {
    if (error instanceof OrderRejected) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Order creation error:', error instanceof Error ? error.message : 'unknown');
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
    console.error('Error fetching orders:', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
