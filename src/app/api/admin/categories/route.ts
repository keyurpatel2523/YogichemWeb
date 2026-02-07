import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { db } from '../../../../../server/db';
import { categories, products } from '@shared/schema';
import { eq, desc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const allCategories = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        image: categories.image,
        parentId: categories.parentId,
        sortOrder: categories.sortOrder,
        isActive: categories.isActive,
        createdAt: categories.createdAt,
        productCount: sql<number>`(SELECT COUNT(*) FROM products WHERE products.category_id = ${categories.id})`.mapWith(Number),
      })
      .from(categories)
      .orderBy(categories.sortOrder, categories.name);

    return NextResponse.json(allCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { name, slug, description, image, parentId, sortOrder, isActive } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const [newCategory] = await db
      .insert(categories)
      .values({
        name,
        slug,
        description: description || null,
        image: image || null,
        parentId: parentId || null,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      })
      .returning();

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Category ID required' }, { status: 400 });
    }

    const [updatedCategory] = await db
      .update(categories)
      .set(updateData)
      .where(eq(categories.id, id))
      .returning();

    if (!updatedCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Category ID required' }, { status: 400 });
    }

    const categoryId = parseInt(id);

    const productCount = await db
      .select({ count: sql<number>`COUNT(*)`.mapWith(Number) })
      .from(products)
      .where(eq(products.categoryId, categoryId));

    if (productCount[0]?.count > 0) {
      return NextResponse.json(
        { error: `Cannot delete category: it has ${productCount[0].count} product(s) assigned` },
        { status: 400 }
      );
    }

    const childCategories = await db
      .select({ count: sql<number>`COUNT(*)`.mapWith(Number) })
      .from(categories)
      .where(eq(categories.parentId, categoryId));

    if (childCategories[0]?.count > 0) {
      return NextResponse.json(
        { error: `Cannot delete category: it has ${childCategories[0].count} subcategory(ies)` },
        { status: 400 }
      );
    }

    await db.delete(categories).where(eq(categories.id, categoryId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
