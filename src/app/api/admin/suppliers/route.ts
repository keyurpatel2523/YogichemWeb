import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { db } from '../../../../../server/db';
import { suppliers, supplierProducts } from '@shared/schema';
import { desc, eq, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const allSuppliers = await db
      .select()
      .from(suppliers)
      .orderBy(desc(suppliers.createdAt));

    // Attach product count for each supplier
    const withCounts = await Promise.all(
      allSuppliers.map(async (supplier) => {
        const [{ count }] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(supplierProducts)
          .where(eq(supplierProducts.supplierId, supplier.id));
        return { ...supplier, productCount: count ?? 0 };
      })
    );

    return NextResponse.json(withCounts);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { name, email, phone, address, contactPerson, isActive } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Supplier name is required' }, { status: 400 });
    }

    const [newSupplier] = await db
      .insert(suppliers)
      .values({
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        contactPerson: contactPerson?.trim() || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      })
      .returning();

    return NextResponse.json({ ...newSupplier, productCount: 0 }, { status: 201 });
  } catch (error) {
    console.error('Error creating supplier:', error);
    return NextResponse.json({ error: 'Failed to create supplier' }, { status: 500 });
  }
}
