import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../server/db';
import { addresses } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userAddresses = await db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, auth.userId));

    return NextResponse.json(userAddresses);
  } catch (error) {
    console.error('Fetch addresses error:', error);
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { firstName, lastName, address1, address2, city, state, postalCode, country, phone, type, isDefault } = body;

    if (!firstName || !lastName || !address1 || !city || !postalCode || !country) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (isDefault) {
      await db
        .update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.userId, auth.userId));
    }

    const existing = await db.select({ id: addresses.id }).from(addresses).where(eq(addresses.userId, auth.userId));
    const makeDefault = isDefault || existing.length === 0;

    const [newAddress] = await db
      .insert(addresses)
      .values({
        userId: auth.userId,
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
        isDefault: makeDefault,
      })
      .returning();

    return NextResponse.json(newAddress, { status: 201 });
  } catch (error) {
    console.error('Create address error:', error);
    return NextResponse.json({ error: 'Failed to create address' }, { status: 500 });
  }
}
