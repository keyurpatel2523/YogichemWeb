import { NextRequest, NextResponse } from 'next/server';
import { db, autoSeed } from '../../../../server/db';
import { products, productImages, categories } from '@shared/schema';
import { eq, desc, and, or, ilike, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    await autoSeed();
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let conditions = [eq(products.isActive, true)];

    if (type === 'featured') {
      conditions.push(eq(products.isFeatured, true));
    } else if (type === 'sale') {
      conditions.push(eq(products.isOnSale, true));
    }

    if (category) {
      const cat = await db.query.categories.findFirst({
        where: eq(categories.slug, category),
      });
      if (cat) {
        conditions.push(eq(products.categoryId, cat.id));
      } else {
        // Category not found — return no results
        return NextResponse.json([]);
      }
    }

    if (search) {
      conditions.push(
        or(
          ilike(products.name, `%${search}%`),
          ilike(products.description, `%${search}%`)
        )!
      );
    }

    const productList = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        compareAtPrice: products.compareAtPrice,
        stock: products.stock,
        isOnSale: products.isOnSale,
        salePercentage: products.salePercentage,
        isFeatured: products.isFeatured,
        categoryId: products.categoryId,
      })
      .from(products)
      .where(and(...conditions))
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);

    // Fetch all categories once for slug lookup
    const allCategories = await db.select().from(categories);
    const catMap = new Map(allCategories.map((c) => [c.id, c]));

    const productsWithImages = await Promise.all(
      productList.map(async (product) => {
        const images = await db
          .select({ url: productImages.url })
          .from(productImages)
          .where(eq(productImages.productId, product.id))
          .limit(1);

        let categorySlug: string | null = null;
        let parentCategorySlug: string | null = null;
        if (product.categoryId) {
          const cat = catMap.get(product.categoryId);
          if (cat) {
            if (cat.parentId) {
              categorySlug = cat.slug;
              const parent = catMap.get(cat.parentId);
              parentCategorySlug = parent?.slug ?? null;
            } else {
              categorySlug = cat.slug;
            }
          }
        }

        return {
          ...product,
          image: images[0]?.url || 'https://via.placeholder.com/400',
          categorySlug,
          parentCategorySlug,
        };
      })
    );

    return NextResponse.json(productsWithImages);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
