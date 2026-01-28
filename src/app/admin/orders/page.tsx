'use client';

import { useState } from 'react';
import { Search, Eye, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatDate } from '@/lib/utils';

const mockOrders = [
  { id: 1, orderNumber: 'ORD-LK7X9-AB12', customer: 'John Smith', email: 'john@example.com', total: 89.99, status: 'processing', paymentStatus: 'paid', items: 3, createdAt: '2024-01-15T10:30:00' },
  { id: 2, orderNumber: 'ORD-MN8Y2-CD34', customer: 'Sarah Johnson', email: 'sarah@example.com', total: 156.50, status: 'shipped', paymentStatus: 'paid', items: 5, createdAt: '2024-01-14T14:20:00' },
  { id: 3, orderNumber: 'ORD-PQ3Z4-EF56', customer: 'Emma Wilson', email: 'emma@example.com', total: 42.00, status: 'delivered', paymentStatus: 'paid', items: 1, createdAt: '2024-01-13T09:15:00' },
  { id: 4, orderNumber: 'ORD-RS5T6-GH78', customer: 'Michael Brown', email: 'michael@example.com', total: 234.99, status: 'processing', paymentStatus: 'paid', items: 8, createdAt: '2024-01-15T16:45:00' },
  { id: 5, orderNumber: 'ORD-UV7W8-IJ90', customer: 'Lisa Davis', email: 'lisa@example.com', total: 78.25, status: 'pending', paymentStatus: 'pending', items: 2, createdAt: '2024-01-15T18:00:00' },
  { id: 6, orderNumber: 'ORD-WX1Y2-KL34', customer: 'David Lee', email: 'david@example.com', total: 312.00, status: 'cancelled', paymentStatus: 'refunded', items: 4, createdAt: '2024-01-12T11:30:00' },
];

const statusIcons = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

const statusColors = {
  pending: 'bg-gray-100 text-gray-700',
  processing: 'bg-yellow-100 text-yellow-700',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminOrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-gray-600">Manage customer orders</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {['all', 'pending', 'processing', 'shipped', 'delivered'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`p-4 rounded-lg text-center transition-colors ${
              statusFilter === status ? 'bg-boots-blue text-white' : 'bg-white hover:bg-gray-50'
            }`}
          >
            <p className="text-2xl font-bold">
              {status === 'all' ? mockOrders.length : mockOrders.filter(o => o.status === status).length}
            </p>
            <p className="text-sm capitalize">{status}</p>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Order</th>
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Items</th>
                  <th className="text-left py-3 px-4">Total</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Payment</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const StatusIcon = statusIcons[order.status as keyof typeof statusIcons];
                  return (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{order.orderNumber}</td>
                      <td className="py-3 px-4">
                        <p className="font-medium">{order.customer}</p>
                        <p className="text-sm text-gray-500">{order.email}</p>
                      </td>
                      <td className="py-3 px-4">{order.items}</td>
                      <td className="py-3 px-4 font-medium">{formatPrice(order.total)}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          statusColors[order.status as keyof typeof statusColors]
                        }`}>
                          <StatusIcon className="w-3 h-3" />
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={order.paymentStatus === 'paid' ? 'success' : order.paymentStatus === 'refunded' ? 'destructive' : 'secondary'}>
                          {order.paymentStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
