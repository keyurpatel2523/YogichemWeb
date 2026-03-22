import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../server/db';
import { walletTransactions, users } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [user] = await db
      .select({ walletBalance: users.walletBalance })
      .from(users)
      .where(eq(users.id, auth.userId))
      .limit(1);

    const transactions = await db
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.userId, auth.userId))
      .orderBy(desc(walletTransactions.createdAt));

    return NextResponse.json({
      balance: user?.walletBalance || '0.00',
      transactions,
    });
  } catch (error) {
    console.error('Wallet fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch wallet' }, { status: 500 });
  }
}
