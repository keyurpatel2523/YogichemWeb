import { NextResponse } from 'next/server';
import { CUSTOMER_COOKIE, sessionCookieOptions } from '@/lib/auth-cookie';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(CUSTOMER_COOKIE, '', { ...sessionCookieOptions(0), maxAge: 0 });
  return response;
}
