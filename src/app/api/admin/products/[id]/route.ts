import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { db } from '../../../../../../server/db';
import { products, productImages, categories, supplierProducts, suppliers } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const productId = parseInt(params.id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const images = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, productId));

    let category = null;
    if (product.categoryId) {
      const [cat] = await db
        .select()
        .from(categories)
        .where(eq(categories.id, product.categoryId))
        .limit(1);
      category = cat || null;
    }

    // Fetch linked supplier
    const [supplierLink] = await db
      .select({
        id: supplierProducts.id,
        supplierId: supplierProducts.supplierId,
        supplierSku: supplierProducts.supplierSku,
        cost: supplierProducts.cost,
        leadTimeDays: supplierProducts.leadTimeDays,
        minOrderQuantity: supplierProducts.minOrderQuantity,
        supplierName: suppliers.name,
        supplierEmail: suppliers.email,
        supplierPhone: suppliers.phone,
        supplierContactPerson: suppliers.contactPerson,
      })
      .from(supplierProducts)
      .leftJoin(suppliers, eq(supplierProducts.supplierId, suppliers.id))
      .where(eq(supplierProducts.productId, productId))
      .limit(1);

    return NextResponse.json({
      ...product,
      images,
      category,
      supplierLink: supplierLink || null,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
