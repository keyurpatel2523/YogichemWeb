'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Minus, Plus, ShoppingBag, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { formatPrice, isNextDayDeliveryAvailable } from '@/lib/utils';
import { useCartStore } from '@/lib/store';
import { toast } from '@/hooks/use-toast';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');

  const subtotal = getTotal();
  const freeShippingThreshold = 25;
  const shipping = subtotal >= freeShippingThreshold ? 0 : 3.50;
  const total = subtotal - discount + shipping;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const nextDayAvailable = isNextDayDeliveryAvailable();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    try {
      const res = await fetch(`/api/coupons/validate?code=${couponCode}&amount=${subtotal}`);
      const data = await res.json();
      
      if (data.valid) {
        setDiscount(data.discount);
        setAppliedCoupon(couponCode.toUpperCase());
        toast({ title: 'Coupon applied!', description: `You saved ${formatPrice(data.discount)}` });
      } else {
        toast({ title: 'Invalid coupon', description: data.error });
      }
    } catch {
      toast({ title: 'Error', description: 'Could not validate coupon' });
    }
    setCouponCode('');
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Your basket is empty</h1>
        <p className="text-gray-600 mb-6">Looks like you haven't added anything yet.</p>
        <Link href="/">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">Shopping Basket</h1>

      {amountToFreeShipping > 0 && (
        <div className="bg-boots-gray rounded-lg p-4 mb-6">
          <p className="text-center">
            Spend <strong>{formatPrice(amountToFreeShipping)}</strong> more for{' '}
            <strong className="text-boots-green">FREE delivery</strong>
          </p>
          <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
            <div
              className="bg-boots-green h-2 rounded-full transition-all"
              style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={`${item.productId}-${item.variantId}`} className="p-4">
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={item.image || '/placeholder.jpg'}
                    alt={item.name}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                    draggable={false}
                  />
                </div>
                
                <div className="flex-1">
                  <Link href={`/product/${item.productId}`} className="font-medium hover:text-boots-blue">
                    {item.name}
                  </Link>
                  {item.variantName && (
                    <p className="text-sm text-gray-500">{item.variantName}</p>
                  )}
                  <p className="text-lg font-bold text-boots-blue mt-1">
                    {formatPrice(item.price)}
                  </p>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1), item.variantId)}
                      className="p-2 hover:bg-gray-100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                      className="p-2 hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          
          <button
            onClick={clearCart}
            className="text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            Clear basket
          </button>
        </div>

        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Subtotal ({items.reduce((sum, i) => sum + i.quantity, 0)} items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-boots-green">
                  <span>Discount ({appliedCoupon})</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className={shipping === 0 ? 'text-boots-green' : ''}>
                  {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                </span>
              </div>
              
              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-boots-blue">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="flex gap-2 mb-6">
              <Input
                placeholder="Coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <Button variant="outline" onClick={handleApplyCoupon}>
                <Tag className="w-4 h-4" />
              </Button>
            </div>

            {nextDayAvailable && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-green-800">
                  <strong>Next day delivery available!</strong> Order within the next few hours.
                </p>
              </div>
            )}

            <Link href="/checkout" className="block">
              <Button className="w-full" size="lg">
                Proceed to Checkout
              </Button>
            </Link>

            <Link href="/" className="block mt-4 text-center text-sm text-boots-blue hover:underline">
              Continue Shopping
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
