import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { db } from '../../../../../../server/db';
import { whatsappBroadcasts } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const [deleted] = await db.delete(whatsappBroadcasts).where(eq(whatsappBroadcasts.id, id)).returning();
    if (!deleted) return NextResponse.json({ error: 'Broadcast not found' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete broadcast' }, { status: 500 });
  }
}
