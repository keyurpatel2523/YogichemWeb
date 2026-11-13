import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../server/db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { CUSTOMER_COOKIE, CUSTOMER_MAX_AGE, sessionCookieOptions } from '@/lib/auth-cookie';
import { clientIp, rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const limit = rateLimit(`login:${clientIp(request)}`, 10, 15 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, String(email).toLowerCase()),
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 },
      );
    }

    const validPassword = await bcrypt.compare(String(password), user.password);
    if (!validPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 },
      );
    }

    const token = signToken({ userId: user.id, email: user.email });
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isWholesaler: user.isWholesaler,
        walletBalance: user.walletBalance,
      },
    });
    response.cookies.set(CUSTOMER_COOKIE, token, sessionCookieOptions(CUSTOMER_MAX_AGE));
    return response;
  } catch (error) {
    console.error('Login error:', error instanceof Error ? error.message : 'unknown');
    const message = error instanceof Error && error.message.startsWith('SESSION_SECRET')
      ? 'Server configuration error'
      : 'Failed to login';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
