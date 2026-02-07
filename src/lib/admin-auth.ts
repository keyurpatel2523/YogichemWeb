import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.SESSION_SECRET || '';

export interface AdminPayload {
  adminId: number;
  email: string;
  role: string;
}

export function verifyAdminToken(request: NextRequest): AdminPayload | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ') || !JWT_SECRET) {
    return null;
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded.adminId) return null;
    return { adminId: decoded.adminId, email: decoded.email, role: decoded.role };
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
