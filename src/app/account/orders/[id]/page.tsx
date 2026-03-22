'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Package, MapPin, Truck, CreditCard,
  Clock, CheckCircle, XCircle, ReceiptText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';

interface OrderItem {
  id: number;
  name: string;
  price: string;
  quantity: number;
  total: string;
  productId: number;
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingMethod: string;
  isNextDayDelivery: boolean;
  subtotal: string;
  shippingCost: string;
  discount: string;
  total: string;
  couponCode: string | null;
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address1: string;
    address2?: string;
    city: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
  items: OrderItem[];
}

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  processing: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Processing' },
  confirmed: { icon: CheckCircle, color: 'bg-blue-100 text-blue-800', label: 'Confirmed' },
  shipped: { icon: Truck, color: 'bg-purple-100 text-purple-800', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Delivered' },
  cancelled: { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Cancelled' },
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { token, isAuthenticated } = useUserStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login?redirect=/account/orders');
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setError('Order not found');
          return;
        }
        const data = await res.json();
        setOrder(data);
      } catch (e) {
        setError('Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [isAuthenticated, router, token, params.id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-bold mb-2">Order not found</h2>
        <p className="text-gray-600 mb-6">We couldn't find this order in your account.</p>
        <Link href="/account/orders"><Button>Back to Orders</Button></Link>
      </div>
    );
  }

  const status = statusConfig[order.status] || statusConfig.processing;
  const StatusIcon = status.icon;
  const addr = order.shippingAddress;
  const date = new Date(order.createdAt);

  const deliveryLabel =
    order.shippingMethod === 'nextday' ? 'Next Day Delivery' :
    order.shippingMethod === 'collect' ? 'Click & Collect' : 'Standard Delivery';

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/account/orders">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            My Orders
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
          <p className="text-gray-600 text-sm">
            Placed on {date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ReceiptText className="w-4 h-4 text-boots-blue" />
              Order Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-3">
              <Badge className={status.color}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {status.label}
              </Badge>
              {order.isNextDayDelivery && (
                <Badge variant="outline" className="text-green-600 border-green-300">Next Day</Badge>
              )}
              <Badge variant="outline" className={order.paymentStatus === 'paid' ? 'text-green-600 border-green-300' : 'text-gray-600'}>
                Payment: {order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="w-4 h-4 text-boots-blue" />
              Items Ordered ({order.items.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatPrice(item.price)} × {item.quantity}
                  </p>
                </div>
                <p className="font-semibold text-boots-blue">{formatPrice(item.total)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="w-4 h-4 text-boots-blue" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1 text-gray-700">
              <p className="font-medium">{addr.firstName} {addr.lastName}</p>
              <p>{addr.address1}</p>
              {addr.address2 && <p>{addr.address2}</p>}
              <p>{addr.city}, {addr.postalCode}</p>
              <p>{addr.country}</p>
              {addr.phone && <p className="text-gray-500 pt-1">{addr.phone}</p>}
              {addr.email && <p className="text-gray-500">{addr.email}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Truck className="w-4 h-4 text-boots-blue" />
                Delivery & Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="font-medium">{deliveryLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment</span>
                <span className="font-medium capitalize">
                  {order.paymentMethod === 'card' ? 'Credit / Debit Card' : 'PayPal'}
                </span>
              </div>
              {order.couponCode && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Coupon</span>
                  <span className="font-medium text-green-600">{order.couponCode}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="w-4 h-4 text-boots-blue" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span>{parseFloat(order.shippingCost) === 0 ? 'FREE' : formatPrice(order.shippingCost)}</span>
            </div>
            {parseFloat(order.discount) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>− {formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold border-t pt-3 mt-1">
              <span>Total</span>
              <span className="text-boots-blue">{formatPrice(order.total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
