export const SHIPPING = {
  standardFreeOver: 25,
  standardCost: 3.5,
  nextDayCost: 4.95,
  nextDayCutoffHour: 14,
  collectFreeOver: 15,
  collectCost: 1.5,
} as const;

export type DeliveryMethod = 'standard' | 'nextday' | 'collect';

export interface CouponRule {
  type: string;
  value: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number | null;
}

export interface PricedLine {
  unitPrice: number;
  quantity: number;
}

export function money(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function londonHour(now = new Date()): number {
  const hour = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    hour: 'numeric',
    hourCycle: 'h23',
  })
    .formatToParts(now)
    .find((part) => part.type === 'hour')?.value;
  return Number(hour ?? '0');
}

export function isNextDayAvailable(now = new Date()): boolean {
  return londonHour(now) < SHIPPING.nextDayCutoffHour;
}

export function shippingForMethod(
  method: string,
  subtotal: number,
  now = new Date(),
): { ok: true; method: DeliveryMethod; cost: number } | { ok: false; error: string } {
  if (method === 'nextday') {
    if (!isNextDayAvailable(now)) {
      return { ok: false, error: 'Next-day delivery is only available before 2PM UK time' };
    }
    return { ok: true, method, cost: SHIPPING.nextDayCost };
  }
  if (method === 'collect') {
    const cost = subtotal >= SHIPPING.collectFreeOver ? 0 : SHIPPING.collectCost;
    return { ok: true, method, cost };
  }
  if (method === 'standard') {
    const cost = subtotal >= SHIPPING.standardFreeOver ? 0 : SHIPPING.standardCost;
    return { ok: true, method, cost };
  }
  return { ok: false, error: 'Choose a delivery method' };
}

export function discountForCoupon(
  coupon: CouponRule,
  subtotal: number,
): { ok: true; discount: number } | { ok: false; error: string } {
  if (coupon.minOrderAmount != null && subtotal < coupon.minOrderAmount) {
    return { ok: false, error: `Minimum order amount is ${coupon.minOrderAmount.toFixed(2)}` };
  }
  if (coupon.usageLimit != null && (coupon.usedCount ?? 0) >= coupon.usageLimit) {
    return { ok: false, error: 'Coupon usage limit reached' };
  }

  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = (subtotal * coupon.value) / 100;
    if (coupon.maxDiscount != null) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else if (coupon.type === 'fixed') {
    discount = coupon.value;
  } else {
    return { ok: false, error: 'This coupon cannot be applied' };
  }

  discount = money(Math.min(Math.max(discount, 0), subtotal));
  return { ok: true, discount };
}

export function summariseOrder(input: {
  lines: PricedLine[];
  deliveryMethod: string;
  coupon?: CouponRule | null;
  now?: Date;
}):
  | {
      ok: true;
      subtotal: number;
      discount: number;
      shipping: number;
      total: number;
      deliveryMethod: DeliveryMethod;
    }
  | { ok: false; error: string } {
  if (input.lines.length === 0) {
    return { ok: false, error: 'No items in order' };
  }

  let subtotal = 0;
  for (const line of input.lines) {
    if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 99) {
      return { ok: false, error: 'Each item quantity must be between 1 and 99' };
    }
    if (!Number.isFinite(line.unitPrice) || line.unitPrice < 0) {
      return { ok: false, error: 'A product price is invalid' };
    }
    subtotal += line.unitPrice * line.quantity;
  }
  subtotal = money(subtotal);

  const shipping = shippingForMethod(input.deliveryMethod, subtotal, input.now);
  if (!shipping.ok) return shipping;

  let discount = 0;
  if (input.coupon) {
    const applied = discountForCoupon(input.coupon, subtotal);
    if (!applied.ok) return applied;
    discount = applied.discount;
  }

  const total = money(Math.max(0, subtotal - discount + shipping.cost));
  return {
    ok: true,
    subtotal,
    discount,
    shipping: shipping.cost,
    total,
    deliveryMethod: shipping.method,
  };
}
