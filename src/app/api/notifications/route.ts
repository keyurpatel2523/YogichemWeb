import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../server/db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [user] = await db
      .select({ emailNotifications: users.emailNotifications, whatsappNotifications: users.whatsappNotifications })
      .from(users)
      .where(eq(users.id, auth.userId))
      .limit(1);

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { emailNotifications, whatsappNotifications } = await request.json();

    const [updated] = await db
      .update(users)
      .set({ emailNotifications, whatsappNotifications, updatedAt: new Date() })
      .where(eq(users.id, auth.userId))
      .returning({ emailNotifications: users.emailNotifications, whatsappNotifications: users.whatsappNotifications });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}
