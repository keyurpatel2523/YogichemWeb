import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { discountForCoupon, isNextDayAvailable, summariseOrder } from './order-pricing';

const morning = new Date('2026-06-15T10:00:00Z');
const evening = new Date('2026-06-15T18:00:00Z');

describe('summariseOrder', () => {
  it('ignores nothing about quantity and prices the lines it is given', () => {
    const result = summariseOrder({
      lines: [
        { unitPrice: 10, quantity: 2 },
        { unitPrice: 4.5, quantity: 1 },
      ],
      deliveryMethod: 'standard',
      now: morning,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.subtotal, 24.5);
    assert.equal(result.shipping, 3.5);
    assert.equal(result.total, 28);
  });

  it('applies free standard delivery at £25 and free collection at £15', () => {
    const standard = summariseOrder({
      lines: [{ unitPrice: 25, quantity: 1 }],
      deliveryMethod: 'standard',
      now: morning,
    });
    const collect = summariseOrder({
      lines: [{ unitPrice: 10, quantity: 1 }],
      deliveryMethod: 'collect',
      now: morning,
    });
    assert.equal(standard.ok && standard.shipping, 0);
    assert.equal(collect.ok && collect.shipping, 1.5);
  });

  it('refuses next-day delivery after 14:00 UK time and prices it before then', () => {
    assert.equal(isNextDayAvailable(morning), true);
    assert.equal(isNextDayAvailable(evening), false);
    const early = summariseOrder({
      lines: [{ unitPrice: 10, quantity: 1 }],
      deliveryMethod: 'nextday',
      now: morning,
    });
    const late = summariseOrder({
      lines: [{ unitPrice: 10, quantity: 1 }],
      deliveryMethod: 'nextday',
      now: evening,
    });
    assert.equal(early.ok && early.shipping, 4.95);
    assert.equal(late.ok, false);
  });

  it('caps percentage coupons and never discounts more than the subtotal', () => {
    const percent = discountForCoupon(
      { type: 'percentage', value: 20, minOrderAmount: 30, maxDiscount: 5, usageLimit: null, usedCount: 0 },
      40,
    );
    assert.equal(percent.ok && percent.discount, 5);

    const fixed = summariseOrder({
      lines: [{ unitPrice: 2, quantity: 1 }],
      deliveryMethod: 'collect',
      coupon: { type: 'fixed', value: 50, minOrderAmount: null, maxDiscount: null, usageLimit: 1, usedCount: 0 },
      now: morning,
    });
    assert.equal(fixed.ok && fixed.discount, 2);
    assert.equal(fixed.ok && fixed.total, 1.5);
  });

  it('rejects an exhausted coupon and an invalid quantity', () => {
    const exhausted = discountForCoupon(
      { type: 'percentage', value: 10, minOrderAmount: null, maxDiscount: null, usageLimit: 1, usedCount: 1 },
      20,
    );
    assert.equal(exhausted.ok, false);
    const quantity = summariseOrder({
      lines: [{ unitPrice: 10, quantity: 0 }],
      deliveryMethod: 'standard',
    });
    assert.equal(quantity.ok, false);
  });
});
