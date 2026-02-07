'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CreditCard, Truck, MapPin, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice, isNextDayDeliveryAvailable, generateOrderNumber } from '@/lib/utils';
import { useCartStore, useUserStore } from '@/lib/store';
import { toast } from '@/hooks/use-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const { user, isAuthenticated } = useUserStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const [shippingAddress, setShippingAddress] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    postalCode: '',
    country: 'United Kingdom',
  });

  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('card');

  const subtotal = getTotal();
  const nextDayAvailable = isNextDayDeliveryAvailable();
  const shippingCost = deliveryMethod === 'nextday' ? 4.95 : subtotal >= 25 ? 0 : 3.50;
  const total = subtotal + shippingCost;

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login?redirect=/checkout');
      return;
    }
    if (items.length === 0 && !orderComplete) {
      router.push('/cart');
    }
  }, [items, router, orderComplete, isAuthenticated]);

  const handleSubmitOrder = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            variantId: item.variantId,
          })),
          shippingAddress,
          deliveryMethod,
          paymentMethod,
          subtotal,
          shippingCost,
          discount: 0,
          total,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create order');
      }
      
      setOrderNumber(data.orderNumber);
      setOrderComplete(true);
      clearCart();
      
      toast({ title: 'Order placed!', description: `Order ${data.orderNumber} confirmed.` });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to place order. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-gray-600 mb-4">Thank you for your order.</p>
        <Card className="text-left mb-6">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Order number</p>
            <p className="text-xl font-bold text-boots-blue mb-4">{orderNumber}</p>
            <p className="text-sm text-gray-600">
              We've sent a confirmation email to {shippingAddress.email}
            </p>
          </CardContent>
        </Card>
        <div className="flex gap-4 justify-center">
          <Link href="/account/orders">
            <Button variant="outline">View Orders</Button>
          </Link>
          <Link href="/">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">Checkout</h1>

      <div className="flex gap-8 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
              step >= s ? 'bg-boots-blue text-white' : 'bg-gray-200'
            }`}>
              {s}
            </div>
            <span className={step >= s ? 'font-medium' : 'text-gray-500'}>
              {s === 1 ? 'Shipping' : s === 2 ? 'Delivery' : 'Payment'}
            </span>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="First name"
                    value={shippingAddress.firstName}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, firstName: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Last name"
                    value={shippingAddress.lastName}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, lastName: e.target.value })}
                    required
                  />
                </div>
                <Input
                  type="email"
                  placeholder="Email address"
                  value={shippingAddress.email}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                  required
                />
                <Input
                  type="tel"
                  placeholder="Phone number"
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                />
                <Input
                  placeholder="Address line 1"
                  value={shippingAddress.address1}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, address1: e.target.value })}
                  required
                />
                <Input
                  placeholder="Address line 2 (optional)"
                  value={shippingAddress.address2}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, address2: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="City"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Postal code"
                    value={shippingAddress.postalCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                    required
                  />
                </div>
                <select
                  className="w-full p-2 border rounded-md"
                  value={shippingAddress.country}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                >
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Ireland">Ireland</option>
                  <option value="France">France</option>
                  <option value="Germany">Germany</option>
                  <option value="United States">United States</option>
                </select>
                <Button onClick={() => setStep(2)} className="w-full">
                  Continue to Delivery
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Delivery Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className={`block p-4 border rounded-lg cursor-pointer ${
                  deliveryMethod === 'standard' ? 'border-boots-blue bg-blue-50' : ''
                }`}>
                  <input
                    type="radio"
                    name="delivery"
                    value="standard"
                    checked={deliveryMethod === 'standard'}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Standard Delivery</p>
                      <p className="text-sm text-gray-600">3-5 business days</p>
                    </div>
                    <span className="font-bold">
                      {subtotal >= 25 ? 'FREE' : '£3.50'}
                    </span>
                  </div>
                </label>

                {nextDayAvailable && (
                  <label className={`block p-4 border rounded-lg cursor-pointer ${
                    deliveryMethod === 'nextday' ? 'border-boots-blue bg-blue-50' : ''
                  }`}>
                    <input
                      type="radio"
                      name="delivery"
                      value="nextday"
                      checked={deliveryMethod === 'nextday'}
                      onChange={(e) => setDeliveryMethod(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium">Next Day Delivery</p>
                          <p className="text-sm text-green-600">Order before 2PM</p>
                        </div>
                      </div>
                      <span className="font-bold">£4.95</span>
                    </div>
                  </label>
                )}

                <label className={`block p-4 border rounded-lg cursor-pointer ${
                  deliveryMethod === 'collect' ? 'border-boots-blue bg-blue-50' : ''
                }`}>
                  <input
                    type="radio"
                    name="delivery"
                    value="collect"
                    checked={deliveryMethod === 'collect'}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Click & Collect</p>
                      <p className="text-sm text-gray-600">Collect from store</p>
                    </div>
                    <span className="font-bold">
                      {subtotal >= 15 ? 'FREE' : '£1.50'}
                    </span>
                  </div>
                </label>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button onClick={() => setStep(3)} className="flex-1">
                    Continue to Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className={`block p-4 border rounded-lg cursor-pointer ${
                  paymentMethod === 'card' ? 'border-boots-blue bg-blue-50' : ''
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6" />
                    <span className="font-medium">Credit/Debit Card</span>
                  </div>
                </label>

                {paymentMethod === 'card' && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <Input placeholder="Card number" />
                    <div className="grid grid-cols-2 gap-4">
                      <Input placeholder="MM/YY" />
                      <Input placeholder="CVV" />
                    </div>
                    <Input placeholder="Name on card" />
                  </div>
                )}

                <label className={`block p-4 border rounded-lg cursor-pointer ${
                  paymentMethod === 'paypal' ? 'border-boots-blue bg-blue-50' : ''
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="sr-only"
                  />
                  <span className="font-medium">PayPal</span>
                </label>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button onClick={handleSubmitOrder} className="flex-1" disabled={loading}>
                    {loading ? 'Processing...' : `Pay ${formatPrice(total)}`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-4">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.variantId}`} className="flex gap-3">
                    <div className="w-16 h-16 rounded bg-gray-100 overflow-hidden">
                      <Image
                        src={item.image || '/placeholder.jpg'}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-boots-blue">{formatPrice(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
