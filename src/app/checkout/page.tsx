'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CreditCard, Truck, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice, isNextDayDeliveryAvailable, generateOrderNumber } from '@/lib/utils';
import { useCartStore, useUserStore } from '@/lib/store';
import { toast } from '@/hooks/use-toast';

function luhnCheck(num: string): boolean {
  const digits = num.replace(/\D/g, '');
  if (digits.length < 13) return false;
  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

function detectCardType(num: string): { type: string; logo: string; cvvLen: number } {
  const n = num.replace(/\D/g, '');
  if (/^4/.test(n)) return { type: 'Visa', logo: '💳 Visa', cvvLen: 3 };
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return { type: 'Mastercard', logo: '💳 Mastercard', cvvLen: 3 };
  if (/^3[47]/.test(n)) return { type: 'Amex', logo: '💳 Amex', cvvLen: 4 };
  if (/^6(?:011|5)/.test(n)) return { type: 'Discover', logo: '💳 Discover', cvvLen: 3 };
  return { type: '', logo: '', cvvLen: 3 };
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits;
}

function validateExpiry(value: string): string {
  const parts = value.split('/');
  if (parts.length !== 2) return 'Enter expiry as MM/YY';
  const month = parseInt(parts[0], 10);
  const year = parseInt('20' + parts[1], 10);
  if (isNaN(month) || month < 1 || month > 12) return 'Invalid month';
  const now = new Date();
  const expDate = new Date(year, month - 1, 1);
  const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  if (expDate < firstOfThisMonth) return 'Card has expired';
  return '';
}

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
  const { user, token, isAuthenticated } = useUserStore();
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
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});

  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('card');

  const [card, setCard] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  });
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const [cardInfo, setCardInfo] = useState({ type: '', logo: '', cvvLen: 3 });

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

  const validateCard = (): boolean => {
    const errors: Record<string, string> = {};
    const digits = card.number.replace(/\D/g, '');
    if (!digits) {
      errors.number = 'Card number is required';
    } else if (digits.length < 13 || digits.length > 19) {
      errors.number = 'Enter a valid card number';
    } else if (!luhnCheck(digits)) {
      errors.number = 'Invalid card number';
    }
    if (!card.expiry) {
      errors.expiry = 'Expiry date is required';
    } else {
      const expiryErr = validateExpiry(card.expiry);
      if (expiryErr) errors.expiry = expiryErr;
    }
    const cvvDigits = card.cvv.replace(/\D/g, '');
    if (!cvvDigits) {
      errors.cvv = 'CVV is required';
    } else if (cvvDigits.length !== cardInfo.cvvLen) {
      errors.cvv = `CVV must be ${cardInfo.cvvLen} digits`;
    }
    if (!card.name.trim()) {
      errors.name = 'Name on card is required';
    } else if (card.name.trim().split(' ').length < 2) {
      errors.name = 'Enter your full name as shown on card';
    }
    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinueToDelivery = () => {
    if (validateAddress()) setStep(2);
  };

  const handleSubmitOrder = async () => {
    if (paymentMethod === 'card' && !validateCard()) return;

    setLoading(true);
    try {
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
      if (!res.ok) throw new Error(data.error || 'Failed to create order');

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
                  <Button onClick={() => setStep(3)} className="flex-1">Continue to Payment</Button>
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
                <label className={`block p-4 border rounded-lg cursor-pointer ${paymentMethod === 'card' ? 'border-boots-blue bg-blue-50' : ''}`}>
                  <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.value)} className="sr-only" />
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6" />
                    <span className="font-medium">Credit / Debit Card</span>
                    <div className="ml-auto flex gap-2 text-xs text-gray-500">
                      <span className="border px-1 rounded">VISA</span>
                      <span className="border px-1 rounded">MC</span>
                      <span className="border px-1 rounded">AMEX</span>
                    </div>
                  </div>
                </label>

                {paymentMethod === 'card' && (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
                    <div>
                      <div className="relative">
                        <input
                          className={inputClass(cardErrors.number)}
                          placeholder="Card number"
                          inputMode="numeric"
                          maxLength={19}
                          value={card.number}
                          onChange={(e) => {
                            const formatted = formatCardNumber(e.target.value);
                            setCard({ ...card, number: formatted });
                            const info = detectCardType(formatted);
                            setCardInfo(info);
                            if (cardErrors.number) setCardErrors({ ...cardErrors, number: '' });
                          }}
                        />
                        {cardInfo.type && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-600">
                            {cardInfo.type}
                          </span>
                        )}
                      </div>
                      <FieldError msg={cardErrors.number} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          className={inputClass(cardErrors.expiry)}
                          placeholder="MM/YY"
                          inputMode="numeric"
                          maxLength={5}
                          value={card.expiry}
                          onChange={(e) => {
                            const formatted = formatExpiry(e.target.value);
                            setCard({ ...card, expiry: formatted });
                            if (cardErrors.expiry) setCardErrors({ ...cardErrors, expiry: '' });
                          }}
                        />
                        <FieldError msg={cardErrors.expiry} />
                      </div>
                      <div>
                        <input
                          className={inputClass(cardErrors.cvv)}
                          placeholder={`CVV (${cardInfo.cvvLen} digits)`}
                          inputMode="numeric"
                          maxLength={cardInfo.cvvLen}
                          type="password"
                          value={card.cvv}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, '').slice(0, cardInfo.cvvLen);
                            setCard({ ...card, cvv: v });
                            if (cardErrors.cvv) setCardErrors({ ...cardErrors, cvv: '' });
                          }}
                        />
                        <FieldError msg={cardErrors.cvv} />
                      </div>
                    </div>

                    <div>
                      <input
                        className={inputClass(cardErrors.name)}
                        placeholder="Name on card"
                        value={card.name}
                        onChange={(e) => {
                          setCard({ ...card, name: e.target.value });
                          if (cardErrors.name) setCardErrors({ ...cardErrors, name: '' });
                        }}
                      />
                      <FieldError msg={cardErrors.name} />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <div className="w-4 h-4 text-green-600">🔒</div>
                      <p className="text-xs text-gray-500">Your card details are encrypted and secure</p>
                    </div>
                  </div>
                )}

                <label className={`block p-4 border rounded-lg cursor-pointer ${paymentMethod === 'paypal' ? 'border-boots-blue bg-blue-50' : ''}`}>
                  <input type="radio" name="payment" value="paypal" checked={paymentMethod === 'paypal'} onChange={(e) => setPaymentMethod(e.target.value)} className="sr-only" />
                  <div className="flex items-center gap-3">
                    <span className="text-blue-700 font-bold text-lg">Pay</span>
                    <span className="text-blue-400 font-bold text-lg">Pal</span>
                    <span className="font-medium text-sm text-gray-700">Pay with PayPal</span>
                  </div>
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
