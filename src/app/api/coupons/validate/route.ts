import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../server/db';
import { coupons } from '@shared/schema';
import { eq, and, gte, lte, or, isNull } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const amount = parseFloat(searchParams.get('amount') || '0');

    if (!code) {
      return NextResponse.json({ valid: false, error: 'Coupon code required' });
    }

    const now = new Date();
    
    const coupon = await db.query.coupons.findFirst({
      where: and(
        eq(coupons.code, code.toUpperCase()),
        eq(coupons.isActive, true),
        or(isNull(coupons.startDate), lte(coupons.startDate, now)),
        or(isNull(coupons.endDate), gte(coupons.endDate, now))
      ),
    });

    if (!coupon) {
      return NextResponse.json({ valid: false, error: 'Invalid or expired coupon' });
    }

    if (coupon.minOrderAmount && amount < parseFloat(coupon.minOrderAmount)) {
      return NextResponse.json({ 
        valid: false, 
        error: `Minimum order amount is ${coupon.minOrderAmount}` 
      });
    }

    if (coupon.usageLimit && coupon.usedCount && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ valid: false, error: 'Coupon usage limit reached' });
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (amount * parseFloat(coupon.value)) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, parseFloat(coupon.maxDiscount));
      }
    } else {
      discount = parseFloat(coupon.value);
    }

    return NextResponse.json({
      valid: true,
      discount: Math.round(discount * 100) / 100,
      type: coupon.type,
      code: coupon.code,
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json({ valid: false, error: 'Validation failed' }, { status: 500 });
  }
}
