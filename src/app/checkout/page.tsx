'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CreditCard, Truck, MapPin, Clock, CheckCircle, AlertCircle, BookUser } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice, isNextDayDeliveryAvailable } from '@/lib/utils';
import { shippingForMethod } from '@/lib/order-pricing';
import { useCartStore, useUserStore } from '@/lib/store';
import { toast } from '@/hooks/use-toast';

function FieldError({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
      <AlertCircle className="w-3 h-3" /> {msg}
    </p>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const { user, isAuthenticated } = useUserStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [serverTotal, setServerTotal] = useState<number | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [profilePhone, setProfilePhone] = useState('');

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
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});

  const [deliveryMethod, setDeliveryMethod] = useState('standard');

  const subtotal = getTotal();
  const nextDayAvailable = isNextDayDeliveryAvailable();
  const shippingQuote = shippingForMethod(deliveryMethod, subtotal);
  const shippingCost = shippingQuote.ok ? shippingQuote.cost : 0;
  const total = Math.max(0, subtotal - discount + shippingCost);

  const applyAddress = (addr: any, phone?: string) => {
    setShippingAddress({
      firstName: addr.firstName || '',
      lastName: addr.lastName || '',
      email: user?.email || '',
      phone: addr.phone || phone || '',
      address1: addr.address1 || '',
      address2: addr.address2 || '',
      city: addr.city || '',
      postalCode: addr.postalCode || '',
      country: addr.country || 'United Kingdom',
    });
    setAddressErrors({});
    setSelectedAddressId(addr.id);
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login?redirect=/checkout');
      return;
    }
    if (items.length === 0 && !orderComplete) {
      router.push('/cart');
      return;
    }

    
    const savedCoupon = window.sessionStorage.getItem('yc-coupon') || '';
    if (savedCoupon) {
      setCouponCode(savedCoupon);
      fetch(`/api/coupons/validate?code=${encodeURIComponent(savedCoupon)}&amount=${getTotal()}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.valid) setDiscount(Number(data.discount) || 0);
          else window.sessionStorage.removeItem('yc-coupon');
        })
        .catch(() => undefined);
    }

    // Fetch profile phone and saved addresses in parallel
    Promise.all([
      fetch('/api/auth/profile')
        .then((r) => r.ok ? r.json() : null)
        .catch(() => null),
      fetch('/api/addresses')
        .then((r) => r.ok ? r.json() : [])
        .catch(() => []),
    ]).then(([profile, addrs]) => {
      const phone = profile?.phone || '';
      if (phone) setProfilePhone(phone);

      // Pre-fill phone from profile even if no saved address
      setShippingAddress((prev) => ({
        ...prev,
        firstName: prev.firstName || user?.firstName || '',
        lastName: prev.lastName || user?.lastName || '',
        email: prev.email || user?.email || '',
        phone: prev.phone || phone,
      }));

      if (Array.isArray(addrs) && addrs.length > 0) {
        setSavedAddresses(addrs);
        const def = addrs.find((a: any) => a.isDefault) || addrs[0];
        if (def) applyAddress(def, phone);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateAddress = (): boolean => {
    const errors: Record<string, string> = {};
    if (!shippingAddress.firstName.trim()) errors.firstName = 'First name is required';
    if (!shippingAddress.lastName.trim()) errors.lastName = 'Last name is required';
    if (!shippingAddress.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingAddress.email)) {
      errors.email = 'Enter a valid email address';
    }
    if (!shippingAddress.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[\d\s\+\-\(\)]{7,15}$/.test(shippingAddress.phone)) {
      errors.phone = 'Enter a valid phone number';
    }
    if (!shippingAddress.address1.trim()) errors.address1 = 'Address is required';
    if (!shippingAddress.city.trim()) errors.city = 'City is required';
    if (!shippingAddress.postalCode.trim()) {
      errors.postalCode = 'Postal code is required';
    } else if (shippingAddress.country === 'United Kingdom' && !/^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$/i.test(shippingAddress.postalCode)) {
      errors.postalCode = 'Enter a valid UK postcode (e.g. SW1A 1AA)';
    }
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinueToDelivery = () => {
    if (validateAddress()) setStep(2);
  };

  const handleSubmitOrder = async () => {
    if (!shippingQuote.ok) {
      toast({ title: 'Delivery unavailable', description: shippingQuote.error });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            variantId: item.variantId,
          })),
          shippingAddress,
          deliveryMethod,
          couponCode: couponCode || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create order');

      setOrderNumber(data.orderNumber);
      setEmailSent(Boolean(data.emailSent));
      setServerTotal(typeof data.total === 'number' ? data.total : null);
      setOrderComplete(true);
      clearCart();
      window.sessionStorage.removeItem('yc-coupon');
      toast({ title: 'Order saved', description: `Order ${data.orderNumber} is unpaid. No payment was taken.` });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to place order. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (error: string) =>
    `flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-background ${
      error ? 'border-red-500 focus-visible:ring-red-400' : 'border-input'
    }`;

  if (orderComplete) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Order saved</h1>
        <p className="text-gray-600 mb-4">Your order is recorded and waiting for payment. No payment has been taken.</p>
        <Card className="text-left mb-6">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Order number</p>
            <p className="text-xl font-bold text-boots-blue mb-4">{orderNumber}</p>
            {serverTotal != null && (
              <p className="text-sm text-gray-600 mb-2">Total due: {formatPrice(serverTotal)}</p>
            )}
            <p className="text-sm text-gray-600">
              {emailSent
                ? `A summary email was sent to ${shippingAddress.email}.`
                : 'A confirmation email was not sent. Email delivery is not configured, or the provider rejected it.'}
            </p>
          </CardContent>
        </Card>
        <div className="flex gap-4 justify-center">
          <Link href="/account/orders"><Button variant="outline">View Orders</Button></Link>
          <Link href="/"><Button>Continue Shopping</Button></Link>
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
              {s === 1 ? 'Shipping' : s === 2 ? 'Delivery' : 'Review'}
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
                {savedAddresses.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <BookUser className="w-4 h-4 text-boots-blue" />
                      <span className="text-sm font-medium text-boots-blue">Saved Addresses</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {savedAddresses.map((addr) => (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => applyAddress(addr, profilePhone)}
                          className={`text-left px-3 py-2 rounded-md border text-xs transition-colors ${
                            selectedAddressId === addr.id
                              ? 'border-boots-blue bg-white text-boots-blue font-semibold'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-boots-blue'
                          }`}
                        >
                          <span className="font-medium">{addr.firstName} {addr.lastName}</span>
                          {addr.isDefault && <span className="ml-1 text-boots-blue">(Default)</span>}
                          <br />
                          <span className="text-gray-500">{addr.address1}, {addr.city}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      className={inputClass(addressErrors.firstName)}
                      placeholder="First name *"
                      value={shippingAddress.firstName}
                      onChange={(e) => {
                        setShippingAddress({ ...shippingAddress, firstName: e.target.value });
                        if (addressErrors.firstName) setAddressErrors({ ...addressErrors, firstName: '' });
                      }}
                    />
                    <FieldError msg={addressErrors.firstName} />
                  </div>
                  <div>
                    <input
                      className={inputClass(addressErrors.lastName)}
                      placeholder="Last name *"
                      value={shippingAddress.lastName}
                      onChange={(e) => {
                        setShippingAddress({ ...shippingAddress, lastName: e.target.value });
                        if (addressErrors.lastName) setAddressErrors({ ...addressErrors, lastName: '' });
                      }}
                    />
                    <FieldError msg={addressErrors.lastName} />
                  </div>
                </div>

                <div>
                  <input
                    type="email"
                    className={inputClass(addressErrors.email)}
                    placeholder="Email address *"
                    value={shippingAddress.email}
                    onChange={(e) => {
                      setShippingAddress({ ...shippingAddress, email: e.target.value });
                      if (addressErrors.email) setAddressErrors({ ...addressErrors, email: '' });
                    }}
                  />
                  <FieldError msg={addressErrors.email} />
                </div>

                <div>
                  <input
                    type="tel"
                    className={inputClass(addressErrors.phone)}
                    placeholder="Phone number *"
                    value={shippingAddress.phone}
                    onChange={(e) => {
                      setShippingAddress({ ...shippingAddress, phone: e.target.value });
                      if (addressErrors.phone) setAddressErrors({ ...addressErrors, phone: '' });
                    }}
                  />
                  <FieldError msg={addressErrors.phone} />
                </div>

                <div>
                  <input
                    className={inputClass(addressErrors.address1)}
                    placeholder="Address line 1 *"
                    value={shippingAddress.address1}
                    onChange={(e) => {
                      setShippingAddress({ ...shippingAddress, address1: e.target.value });
                      if (addressErrors.address1) setAddressErrors({ ...addressErrors, address1: '' });
                    }}
                  />
                  <FieldError msg={addressErrors.address1} />
                </div>

                <input
                  className={inputClass('')}
                  placeholder="Address line 2 (optional)"
                  value={shippingAddress.address2}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, address2: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      className={inputClass(addressErrors.city)}
                      placeholder="City *"
                      value={shippingAddress.city}
                      onChange={(e) => {
                        setShippingAddress({ ...shippingAddress, city: e.target.value });
                        if (addressErrors.city) setAddressErrors({ ...addressErrors, city: '' });
                      }}
                    />
                    <FieldError msg={addressErrors.city} />
                  </div>
                  <div>
                    <input
                      className={inputClass(addressErrors.postalCode)}
                      placeholder="Postal code *"
                      value={shippingAddress.postalCode}
                      onChange={(e) => {
                        setShippingAddress({ ...shippingAddress, postalCode: e.target.value.toUpperCase() });
                        if (addressErrors.postalCode) setAddressErrors({ ...addressErrors, postalCode: '' });
                      }}
                    />
                    <FieldError msg={addressErrors.postalCode} />
                  </div>
                </div>

                <select
                  className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={shippingAddress.country}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                >
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Ireland">Ireland</option>
                  <option value="France">France</option>
                  <option value="Germany">Germany</option>
                  <option value="United States">United States</option>
                </select>

                <Button onClick={handleContinueToDelivery} className="w-full">
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
                <label className={`block p-4 border rounded-lg cursor-pointer ${deliveryMethod === 'standard' ? 'border-boots-blue bg-blue-50' : ''}`}>
                  <input type="radio" name="delivery" value="standard" checked={deliveryMethod === 'standard'} onChange={(e) => setDeliveryMethod(e.target.value)} className="sr-only" />
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Standard Delivery</p>
                      <p className="text-sm text-gray-600">3-5 business days</p>
                    </div>
                    <span className="font-bold">{subtotal >= 25 ? 'FREE' : '£3.50'}</span>
                  </div>
                </label>

                {nextDayAvailable && (
                  <label className={`block p-4 border rounded-lg cursor-pointer ${deliveryMethod === 'nextday' ? 'border-boots-blue bg-blue-50' : ''}`}>
                    <input type="radio" name="delivery" value="nextday" checked={deliveryMethod === 'nextday'} onChange={(e) => setDeliveryMethod(e.target.value)} className="sr-only" />
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

                <label className={`block p-4 border rounded-lg cursor-pointer ${deliveryMethod === 'collect' ? 'border-boots-blue bg-blue-50' : ''}`}>
                  <input type="radio" name="delivery" value="collect" checked={deliveryMethod === 'collect'} onChange={(e) => setDeliveryMethod(e.target.value)} className="sr-only" />
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Click & Collect</p>
                      <p className="text-sm text-gray-600">Collect from store</p>
                    </div>
                    <span className="font-bold">{subtotal >= 15 ? 'FREE' : '£1.50'}</span>
                  </div>
                </label>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button onClick={() => setStep(3)} className="flex-1">Review order</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Review order
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  Card and PayPal payments are not connected. Placing this order saves it as unpaid. The server calculates the product prices, delivery, and any coupon. No card details are collected.
                </div>
                {couponCode && (
                  <p className="text-sm text-gray-600">Coupon {couponCode} will be checked again when the order is saved.</p>
                )}
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button onClick={handleSubmitOrder} className="flex-1" disabled={loading || !shippingQuote.ok}>
                    {loading ? 'Saving...' : `Place unpaid order ${formatPrice(total)}`}
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
                    <div className="w-16 h-16 rounded bg-gray-100 overflow-hidden flex-shrink-0">
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
                {discount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Discount{couponCode ? ` (${couponCode})` : ''}</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}</span>
                </div>
                <p className="text-xs text-gray-500">The saved order total is calculated on the server.</p>
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
