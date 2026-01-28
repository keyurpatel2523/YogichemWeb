import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../server/db';
import { products, productImages, productVariants, categories } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const product = await db.query.products.findFirst({
      where: eq(products.slug, params.slug),
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const images = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, product.id));

    const variants = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, product.id));

    let category = null;
    if (product.categoryId) {
      category = await db.query.categories.findFirst({
        where: eq(categories.id, product.categoryId),
      });
    }

    return NextResponse.json({
      ...product,
      images,
      variants,
      category,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
