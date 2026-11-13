import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { CUSTOMER_COOKIE } from '@/lib/auth-cookie';

export interface JWTPayload {
  userId: number;
  email: string;
}

export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET || '';
  if (secret.length < 32) {
    throw new Error('SESSION_SECRET must be set to a random string of at least 32 characters.');
  }
  return secret;
}

export function verifyToken(token: string): JWTPayload | null {
  let secret: string;
  try {
    secret = getSessionSecret();
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'SESSION_SECRET not configured');
    return null;
  }
  try {
    const decoded = jwt.verify(token, secret);
    if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded && 'email' in decoded) {
      return decoded as JWTPayload;
    }
    return null;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const bearer = authHeader.substring(7).trim();
    if (bearer) return bearer;
  }
  return request.cookies.get(CUSTOMER_COOKIE)?.value ?? null;
}

export function getUserFromRequest(request: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return verifyToken(token);
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, getSessionSecret(), { expiresIn: '7d' });
}
