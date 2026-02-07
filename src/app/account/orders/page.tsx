'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, ChevronRight, Clock, CheckCircle, Truck, XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  total: string;
  subtotal: string;
  shippingCost: string;
  discount: string;
  shippingMethod: string;
  paymentMethod: string;
  paymentStatus: string;
  isNextDayDelivery: boolean;
  createdAt: string;
  shippingAddress: any;
}

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  processing: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Processing' },
  confirmed: { icon: CheckCircle, color: 'bg-blue-100 text-blue-800', label: 'Confirmed' },
  shipped: { icon: Truck, color: 'bg-purple-100 text-purple-800', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Delivered' },
  cancelled: { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Cancelled' },
};

export default function OrdersPage() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useUserStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login?redirect=/account/orders');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, router, token]);

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/account">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Account
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">My Orders</h1>
            <p className="text-gray-600">Track and manage your orders</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex justify-between mb-4">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <Skeleton className="h-4 w-48 mb-2" />
                  <Skeleton className="h-4 w-36" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-bold mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">When you place an order, it will appear here.</p>
            <Link href="/">
              <Button>Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.processing;
              const StatusIcon = status.icon;
              const date = new Date(order.createdAt);

              return (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-bold text-boots-blue">{order.orderNumber}</span>
                          <Badge className={status.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                          {order.isNextDayDelivery && (
                            <Badge variant="outline" className="text-green-600 border-green-300">
                              Next Day
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          Placed on {date.toLocaleDateString('en-GB', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>Payment: {order.paymentMethod === 'card' ? 'Card' : 'PayPal'}</span>
                          <span>Delivery: {order.shippingMethod === 'standard' ? 'Standard' : order.shippingMethod === 'nextday' ? 'Next Day' : 'Click & Collect'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-boots-blue">{formatPrice(order.total)}</p>
                        {parseFloat(order.discount) > 0 && (
                          <p className="text-sm text-green-600">Saved {formatPrice(order.discount)}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
