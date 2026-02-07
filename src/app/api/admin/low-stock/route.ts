import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { db } from '../../../../../server/db';
import { products } from '@shared/schema';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const lowStockProducts = await db
      .select({
        id: products.id,
        name: products.name,
        stock: products.stock,
        lowStockThreshold: products.lowStockThreshold,
        price: products.price,
        sku: products.sku,
      })
      .from(products)
      .where(sql`${products.stock} < ${products.lowStockThreshold}`)
      .orderBy(products.stock);

    return NextResponse.json(lowStockProducts);
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    return NextResponse.json({ error: 'Failed to fetch low stock products' }, { status: 500 });
  }
}
