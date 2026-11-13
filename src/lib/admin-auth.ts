import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { ADMIN_COOKIE } from '@/lib/auth-cookie';
import { getSessionSecret } from '@/lib/auth';

export interface AdminPayload {
  adminId: number;
  email: string;
  role: string;
}

export function getAdminTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const bearer = authHeader.substring(7).trim();
    if (bearer) return bearer;
  }
  return request.cookies.get(ADMIN_COOKIE)?.value ?? null;
}

export function verifyAdminToken(request: NextRequest): AdminPayload | null {
  const token = getAdminTokenFromRequest(request);
  if (!token) return null;

  let secret: string;
  try {
    secret = getSessionSecret();
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'SESSION_SECRET not configured');
    return null;
  }

  try {
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
    if (!decoded.adminId || typeof decoded.adminId !== 'number') return null;
    return {
      adminId: decoded.adminId,
      email: String(decoded.email || ''),
      role: String(decoded.role || 'admin'),
    };
  } catch {
    return null;
  }
}

export function requireAdmin(request: NextRequest): NextResponse | null {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export function signAdminToken(payload: AdminPayload): string {
  return jwt.sign(payload, getSessionSecret(), { expiresIn: '8h' });
}
