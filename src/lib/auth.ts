import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.SESSION_SECRET || '';

export interface JWTPayload {
  userId: number;
  email: string;
}

export function verifyToken(token: string): JWTPayload | null {
  if (!JWT_SECRET) {
    console.error('SESSION_SECRET not configured');
    return null;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
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
    return authHeader.substring(7);
  }
  return null;
}

export function getUserFromRequest(request: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return verifyToken(token);
}

export function signToken(payload: JWTPayload): string {
  if (!JWT_SECRET) {
    throw new Error('SESSION_SECRET not configured');
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
