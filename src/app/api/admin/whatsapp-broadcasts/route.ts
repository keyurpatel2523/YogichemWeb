import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { db } from '../../../../../server/db';
import { whatsappBroadcasts } from '@shared/schema';
import { desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const broadcasts = await db
      .select()
      .from(whatsappBroadcasts)
      .orderBy(desc(whatsappBroadcasts.createdAt));

    return NextResponse.json(broadcasts);
  } catch (error) {
    console.error('Error fetching WhatsApp broadcasts:', error);
    return NextResponse.json({ error: 'Failed to fetch broadcasts' }, { status: 500 });
  }
}
