import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { db } from '../../../../../server/db';
import { shippingRules } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const rules = await db
      .select()
      .from(shippingRules)
      .orderBy(shippingRules.country);

    return NextResponse.json(rules);
  } catch (error) {
    console.error('Error fetching shipping rules:', error);
    return NextResponse.json({ error: 'Failed to fetch shipping rules' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const {
      country,
      countryCode,
      standardShippingCost,
      standardDeliveryDays,
      freeShippingThreshold,
      nextDayAvailable,
      nextDayCost,
      nextDayCutoffHour,
      clickCollectAvailable,
    } = body;

    if (!country || !countryCode || !standardShippingCost) {
      return NextResponse.json(
        { error: 'Country, country code, and shipping cost are required' },
        { status: 400 }
      );
    }

    const [newRule] = await db
      .insert(shippingRules)
      .values({
        country,
        countryCode,
        standardShippingCost,
        standardDeliveryDays: standardDeliveryDays || 3,
        freeShippingThreshold,
        nextDayAvailable: nextDayAvailable || false,
        nextDayCost,
        nextDayCutoffHour: nextDayCutoffHour || 14,
        clickCollectAvailable: clickCollectAvailable || false,
      })
      .returning();

    return NextResponse.json(newRule, { status: 201 });
  } catch (error) {
    console.error('Error creating shipping rule:', error);
    return NextResponse.json({ error: 'Failed to create shipping rule' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Rule ID required' }, { status: 400 });
    }

    updateData.updatedAt = new Date();

    const [updatedRule] = await db
      .update(shippingRules)
      .set(updateData)
      .where(eq(shippingRules.id, id))
      .returning();

    return NextResponse.json(updatedRule);
  } catch (error) {
    console.error('Error updating shipping rule:', error);
    return NextResponse.json({ error: 'Failed to update shipping rule' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Rule ID required' }, { status: 400 });
    }

    await db.delete(shippingRules).where(eq(shippingRules.id, parseInt(id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting shipping rule:', error);
    return NextResponse.json({ error: 'Failed to delete shipping rule' }, { status: 500 });
  }
}
