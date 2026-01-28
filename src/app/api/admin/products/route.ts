import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../server/db';
import { products, productImages } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const allProducts = await db
      .select()
      .from(products)
      .orderBy(desc(products.createdAt));

    const productsWithImages = await Promise.all(
      allProducts.map(async (product) => {
        const images = await db
          .select({ url: productImages.url })
          .from(productImages)
          .where(eq(productImages.productId, product.id))
          .limit(1);
        
        return {
          ...product,
          image: images[0]?.url || null,
        };
      })
    );

    return NextResponse.json(productsWithImages);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      slug,
      description,
      price,
      compareAtPrice,
      categoryId,
      stock,
      sku,
      isFeatured,
      isOnSale,
      salePercentage,
      imageUrl,
    } = body;

    if (!name || !slug || !price) {
      return NextResponse.json(
        { error: 'Name, slug, and price are required' },
        { status: 400 }
      );
    }

    const [newProduct] = await db
      .insert(products)
      .values({
        name,
        slug,
        description: description || null,
        price,
        compareAtPrice: compareAtPrice || null,
        categoryId: categoryId || null,
        stock: stock || 0,
        sku: sku || null,
        isFeatured: isFeatured || false,
        isOnSale: isOnSale || false,
        salePercentage: salePercentage || null,
      })
      .returning();

    if (imageUrl) {
      await db.insert(productImages).values({
        productId: newProduct.id,
        url: imageUrl,
        isPrimary: true,
        sortOrder: 0,
      });
    }

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    updateData.updatedAt = new Date();

    const [updatedProduct] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    await db.delete(productImages).where(eq(productImages.productId, parseInt(id)));
    await db.delete(products).where(eq(products.id, parseInt(id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
