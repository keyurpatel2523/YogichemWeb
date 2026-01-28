import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../server/db';
import { orders, users, products } from '@shared/schema';
import { eq, sql, count, lt } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const [salesResult] = await db
      .select({ total: sql<number>`COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0)` })
      .from(orders)
      .where(eq(orders.paymentStatus, 'paid'));

    const [ordersCount] = await db
      .select({ count: count() })
      .from(orders);

    const [usersCount] = await db
      .select({ count: count() })
      .from(users);

    const [productsCount] = await db
      .select({ count: count() })
      .from(products);

    const [lowStockCount] = await db
      .select({ count: count() })
      .from(products)
      .where(lt(products.stock, 10));

    const [pendingOrders] = await db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.status, 'pending'));

    const recentOrders = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        total: orders.total,
        status: orders.status,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .orderBy(sql`${orders.createdAt} DESC`)
      .limit(5);

    return NextResponse.json({
      totalSales: Number(salesResult.total) || 0,
      totalOrders: ordersCount.count,
      totalUsers: usersCount.count,
      totalProducts: productsCount.count,
      lowStockProducts: lowStockCount.count,
      pendingOrders: pendingOrders.count,
      recentOrders,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
