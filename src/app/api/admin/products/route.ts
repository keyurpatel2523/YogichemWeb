import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { db } from '../../../../../server/db';
import { products, productImages, supplierProducts, categories } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const allProducts = await db
      .select()
      .from(products)
      .orderBy(desc(products.createdAt));

    // Fetch all categories once for lookup
    const allCategories = await db.select().from(categories);
    const catMap = new Map(allCategories.map((c) => [c.id, c]));

    const productsWithImages = await Promise.all(
      allProducts.map(async (product) => {
        const images = await db
          .select({ url: productImages.url })
          .from(productImages)
          .where(eq(productImages.productId, product.id))
          .limit(1);

        // Build category breadcrumb
        let categoryName: string | null = null;
        let parentCategoryName: string | null = null;
        if (product.categoryId) {
          const cat = catMap.get(product.categoryId);
          if (cat) {
            categoryName = cat.name;
            if (cat.parentId) {
              const parent = catMap.get(cat.parentId);
              parentCategoryName = parent?.name ?? null;
            }
          }
        }

        return {
          ...product,
          image: images[0]?.url || null,
          categoryName,
          parentCategoryName,
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
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const {
      name, slug, description, shortDescription, price, compareAtPrice, costPrice,
      wholesalePrice, categoryId, stock, lowStockThreshold, sku, isFeatured, isOnSale,
      salePercentage, imageUrl, isActive, metaTitle, metaDescription, tags,
      // Supplier fields
      supplierId, supplierSku, supplierLeadTimeDays, supplierMinOrderQty, supplierCost,
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
        shortDescription: shortDescription || null,
        price,
        compareAtPrice: compareAtPrice || null,
        costPrice: costPrice || null,
        wholesalePrice: wholesalePrice || null,
        categoryId: categoryId || null,
        stock: stock || 0,
        lowStockThreshold: lowStockThreshold || 10,
        sku: sku || null,
        isFeatured: isFeatured || false,
        isOnSale: isOnSale || false,
        salePercentage: salePercentage || null,
        isActive: isActive !== undefined ? isActive : true,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        tags: tags || null,
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

    // Link supplier if provided
    if (supplierId) {
      await db.insert(supplierProducts).values({
        productId: newProduct.id,
        supplierId: parseInt(supplierId),
        supplierSku: supplierSku || null,
        cost: supplierCost || null,
        leadTimeDays: supplierLeadTimeDays ? parseInt(supplierLeadTimeDays) : null,
        minOrderQuantity: supplierMinOrderQty ? parseInt(supplierMinOrderQty) : 1,
      });
    }

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const {
      id, imageUrl,
      // Supplier fields (extracted separately)
      supplierId, supplierSku, supplierLeadTimeDays, supplierMinOrderQty, supplierCost,
      ...updateData
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    updateData.updatedAt = new Date();

    const [updatedProduct] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();

    if (imageUrl !== undefined) {
      const existingImages = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, id));

      if (existingImages.length > 0) {
        await db
          .update(productImages)
          .set({ url: imageUrl })
          .where(eq(productImages.productId, id));
      } else if (imageUrl) {
        await db.insert(productImages).values({
          productId: id,
          url: imageUrl,
          isPrimary: true,
          sortOrder: 0,
        });
      }
    }

    // Upsert supplier link
    const existingLink = await db
      .select()
      .from(supplierProducts)
      .where(eq(supplierProducts.productId, id))
      .limit(1);

    if (supplierId) {
      if (existingLink.length > 0) {
        await db
          .update(supplierProducts)
          .set({
            supplierId: parseInt(supplierId),
            supplierSku: supplierSku || null,
            cost: supplierCost || null,
            leadTimeDays: supplierLeadTimeDays ? parseInt(supplierLeadTimeDays) : null,
            minOrderQuantity: supplierMinOrderQty ? parseInt(supplierMinOrderQty) : 1,
          })
          .where(eq(supplierProducts.productId, id));
      } else {
        await db.insert(supplierProducts).values({
          productId: id,
          supplierId: parseInt(supplierId),
          supplierSku: supplierSku || null,
          cost: supplierCost || null,
          leadTimeDays: supplierLeadTimeDays ? parseInt(supplierLeadTimeDays) : null,
          minOrderQuantity: supplierMinOrderQty ? parseInt(supplierMinOrderQty) : 1,
        });
      }
    } else if (supplierId === '' || supplierId === null) {
      // Explicitly cleared — remove the link
      if (existingLink.length > 0) {
        await db.delete(supplierProducts).where(eq(supplierProducts.productId, id));
      }
    }

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    await db.delete(supplierProducts).where(eq(supplierProducts.productId, parseInt(id)));
    await db.delete(productImages).where(eq(productImages.productId, parseInt(id)));
    await db.delete(products).where(eq(products.id, parseInt(id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
