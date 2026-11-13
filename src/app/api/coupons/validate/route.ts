import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../server/db';
import { coupons } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { discountForCoupon } from '@/lib/order-pricing';
import { clientIp, rateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  const limit = rateLimit(`coupon:${clientIp(request)}`, 30, 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { valid: false, error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const amount = parseFloat(searchParams.get('amount') || '0');

    if (!code) {
      return NextResponse.json({ valid: false, error: 'Coupon code required' });
    }
    if (!Number.isFinite(amount) || amount < 0) {
      return NextResponse.json({ valid: false, error: 'Order amount is invalid' });
    }

    const now = new Date();
    const coupon = await db.query.coupons.findFirst({
      where: eq(coupons.code, code.toUpperCase()),
    });

    if (!coupon || !coupon.isActive || (coupon.startDate && coupon.startDate > now) || (coupon.endDate && coupon.endDate < now)) {
      return NextResponse.json({ valid: false, error: 'Invalid or expired coupon' });
    }

    const priced = discountForCoupon({
      type: coupon.type,
      value: Number(coupon.value),
      minOrderAmount: coupon.minOrderAmount != null ? Number(coupon.minOrderAmount) : null,
      maxDiscount: coupon.maxDiscount != null ? Number(coupon.maxDiscount) : null,
      usageLimit: coupon.usageLimit,
      usedCount: coupon.usedCount,
    }, amount);

    if (!priced.ok) {
      return NextResponse.json({ valid: false, error: priced.error });
    }

    return NextResponse.json({
      valid: true,
      discount: priced.discount,
      type: coupon.type,
      code: coupon.code,
    });
  } catch (error) {
    console.error('Coupon validation error:', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ valid: false, error: 'Validation failed' }, { status: 500 });
  }
}
