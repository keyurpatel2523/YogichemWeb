import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../server/db';
import { addresses } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { getUserFromRequest } from '@/lib/auth';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const id = parseInt(params.id, 10);
    const body = await request.json();
    const { firstName, lastName, address1, address2, city, state, postalCode, country, phone, type, isDefault } = body;

    const [existing] = await db.select().from(addresses).where(and(eq(addresses.id, id), eq(addresses.userId, auth.userId))).limit(1);
    if (!existing) return NextResponse.json({ error: 'Address not found' }, { status: 404 });

    if (isDefault) {
      await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, auth.userId));
    }

    const [updated] = await db
      .update(addresses)
      .set({
        firstName,
        lastName,
        address1,
        address2: address2 || null,
        city,
        state: state || null,
        postalCode,
        country,
        phone: phone || null,
        type: type || 'shipping',
        isDefault: isDefault ?? existing.isDefault,
      })
      .where(and(eq(addresses.id, id), eq(addresses.userId, auth.userId)))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update address error:', error);
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const id = parseInt(params.id, 10);
    const [existing] = await db.select().from(addresses).where(and(eq(addresses.id, id), eq(addresses.userId, auth.userId))).limit(1);
    if (!existing) return NextResponse.json({ error: 'Address not found' }, { status: 404 });

    await db.delete(addresses).where(and(eq(addresses.id, id), eq(addresses.userId, auth.userId)));

    if (existing.isDefault) {
      const [first] = await db.select({ id: addresses.id }).from(addresses).where(eq(addresses.userId, auth.userId)).limit(1);
      if (first) {
        await db.update(addresses).set({ isDefault: true }).where(eq(addresses.id, first.id));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete address error:', error);
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const id = parseInt(params.id, 10);
    await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, auth.userId));
    const [updated] = await db.update(addresses).set({ isDefault: true }).where(and(eq(addresses.id, id), eq(addresses.userId, auth.userId))).returning();
    if (!updated) return NextResponse.json({ error: 'Address not found' }, { status: 404 });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Set default address error:', error);
    return NextResponse.json({ error: 'Failed to set default' }, { status: 500 });
  }
}
