import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../server/db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { getUserFromRequest, signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        birthday: users.birthday,
        isWholesaler: users.isWholesaler,
        walletBalance: users.walletBalance,
        emailNotifications: users.emailNotifications,
        whatsappNotifications: users.whatsappNotifications,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, auth.userId))
      .limit(1);

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { firstName, lastName, phone, birthday, currentPassword, newPassword } = body;

    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName.trim();
    if (lastName !== undefined) updateData.lastName = lastName.trim();
    if (phone !== undefined) updateData.phone = phone.trim() || null;
    if (birthday !== undefined) updateData.birthday = birthday ? new Date(birthday) : null;
    updateData.updatedAt = new Date();

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password required to set new password' }, { status: 400 });
      }
      const [user] = await db.select({ password: users.password }).from(users).where(eq(users.id, auth.userId)).limit(1);
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, auth.userId))
      .returning({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        isWholesaler: users.isWholesaler,
        walletBalance: users.walletBalance,
      });

    const newToken = signToken({ userId: updated.id, email: updated.email });

    return NextResponse.json({ user: updated, token: newToken });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
