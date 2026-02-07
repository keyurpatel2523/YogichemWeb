import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { db } from '../../../../../server/db';
import { emailCampaigns } from '@shared/schema';
import { desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const campaigns = await db
      .select()
      .from(emailCampaigns)
      .orderBy(desc(emailCampaigns.createdAt));

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Error fetching email campaigns:', error);
    return NextResponse.json({ error: 'Failed to fetch email campaigns' }, { status: 500 });
  }
}
