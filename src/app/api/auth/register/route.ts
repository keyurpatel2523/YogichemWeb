import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../server/db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { validatePassword } from '@/lib/password';
import { CUSTOMER_COOKIE, CUSTOMER_MAX_AGE, sessionCookieOptions } from '@/lib/auth-cookie';
import { clientIp, rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const limit = rateLimit(`register:${clientIp(request)}`, 5, 60 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phone, birthday } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const normalisedEmail = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalisedEmail)) {
      return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 });
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, normalisedEmail),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(String(password), 12);

    const [newUser] = await db
      .insert(users)
      .values({
        email: normalisedEmail,
        password: hashedPassword,
        firstName: String(firstName).trim(),
        lastName: String(lastName).trim(),
        phone: phone ? String(phone).trim() : null,
        birthday: birthday ? new Date(birthday) : null,
      })
      .returning();

    const token = signToken({ userId: newUser.id, email: newUser.email });
    const response = NextResponse.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        isWholesaler: newUser.isWholesaler,
        walletBalance: newUser.walletBalance,
      },
    });
    response.cookies.set(CUSTOMER_COOKIE, token, sessionCookieOptions(CUSTOMER_MAX_AGE));
    return response;
  } catch (error) {
    console.error('Registration error:', error instanceof Error ? error.message : 'unknown');
    const message = error instanceof Error && error.message.startsWith('SESSION_SECRET')
      ? 'Server configuration error'
      : 'Failed to register user';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
