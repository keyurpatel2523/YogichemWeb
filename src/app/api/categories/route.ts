import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../server/db';
import { categories } from '@shared/schema';
import { eq, isNull } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const allCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true));

    return NextResponse.json(allCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
