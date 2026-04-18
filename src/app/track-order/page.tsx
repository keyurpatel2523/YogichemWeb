'use client';

import { useState } from 'react';
import { Search, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [searched, setSearched] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#003DA5] text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <Truck className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Track Your Order</h1>
          <p className="text-blue-100 text-lg">Enter your order number to see the latest status</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-xl">
        <Card className="shadow-md">
          <CardContent className="p-8">
            <form onSubmit={handleTrack} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Number</label>
                <Input
                  placeholder="e.g. YC-AB12-3456"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <Input
                  type="email"
                  placeholder="The email used at checkout"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-[#003DA5] hover:bg-[#002d7a]">
                <Search className="w-4 h-4 mr-2" /> Track Order
              </Button>
            </form>

            {searched && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <Package className="w-8 h-8 text-[#003DA5] mx-auto mb-2" />
                <p className="font-semibold text-[#1A1A3E]">Order not found</p>
                <p className="text-sm text-gray-500 mt-1">Please check your order number and email, or sign in to view your orders.</p>
                <Link href="/account/orders">
                  <Button variant="outline" size="sm" className="mt-3">View My Orders</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status guide */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-[#1A1A3E] mb-4">Order Status Guide</h2>
          <div className="space-y-3">
            {[
              { icon: Clock, label: 'Processing', desc: 'We have received your order and are preparing it', color: 'text-yellow-600' },
              { icon: Package, label: 'Dispatched', desc: 'Your order is on its way to you', color: 'text-blue-600' },
              { icon: Truck, label: 'Out for Delivery', desc: 'Your order is with the delivery driver', color: 'text-orange-600' },
              { icon: CheckCircle, label: 'Delivered', desc: 'Your order has been successfully delivered', color: 'text-green-600' },
            ].map(({ icon: Icon, label, desc, color }) => (
              <div key={label} className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${color}`} />
                <div>
                  <p className="font-medium text-sm text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
