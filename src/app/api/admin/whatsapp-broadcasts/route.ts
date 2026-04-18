import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { db } from '../../../../../server/db';
import { whatsappBroadcasts, users } from '@shared/schema';
import { desc, eq } from 'drizzle-orm';

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
    return NextResponse.json({ error: 'Failed to fetch broadcasts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { name, message, sendNow, scheduledAt } = body;

    if (!name?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Name and message are required' }, { status: 400 });
    }

    // Count opted-in recipients
    const recipients = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.whatsappNotifications, true));

    const recipientCount = sendNow ? recipients.length : 0;
    const schedDate = !sendNow && scheduledAt ? new Date(scheduledAt) : null;

    const [broadcast] = await db
      .insert(whatsappBroadcasts)
      .values({
        name: name.trim(),
        message: message.trim(),
        status: sendNow ? 'sent' : schedDate ? 'scheduled' : 'draft',
        scheduledAt: schedDate,
        sentAt: sendNow ? new Date() : null,
        recipientCount,
      })
      .returning();

    return NextResponse.json(broadcast, { status: 201 });
  } catch (error) {
    console.error('Error creating broadcast:', error);
    return NextResponse.json({ error: 'Failed to create broadcast' }, { status: 500 });
  }
}
