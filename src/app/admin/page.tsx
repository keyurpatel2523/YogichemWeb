'use client';

import { useQuery } from '@tanstack/react-query';
import { Package, Users, ShoppingCart, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const mockStats = {
  totalSales: 125680,
  totalOrders: 1847,
  totalUsers: 3420,
  totalProducts: 156,
  lowStockProducts: 12,
  pendingOrders: 45,
};

const monthlySales = [
  { month: 'Jan', sales: 12500 },
  { month: 'Feb', sales: 18200 },
  { month: 'Mar', sales: 15800 },
  { month: 'Apr', sales: 22100 },
  { month: 'May', sales: 19500 },
  { month: 'Jun', sales: 24800 },
  { month: 'Jul', sales: 21300 },
];

const categorySales = [
  { name: 'Beauty', value: 35 },
  { name: 'Health', value: 25 },
  { name: 'Wellness', value: 20 },
  { name: 'Electrical', value: 12 },
  { name: 'Baby', value: 8 },
];

const COLORS = ['#003DA5', '#00A19A', '#E31837', '#FF6B00', '#00A550'];

const recentOrders = [
  { id: 'ORD-LK7X9-AB12', customer: 'John Smith', total: 89.99, status: 'Processing' },
  { id: 'ORD-MN8Y2-CD34', customer: 'Sarah Johnson', total: 156.50, status: 'Shipped' },
  { id: 'ORD-PQ3Z4-EF56', customer: 'Emma Wilson', total: 42.00, status: 'Delivered' },
  { id: 'ORD-RS5T6-GH78', customer: 'Michael Brown', total: 234.99, status: 'Processing' },
  { id: 'ORD-UV7W8-IJ90', customer: 'Lisa Davis', total: 78.25, status: 'Pending' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold">{formatPrice(mockStats.totalSales)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-green-600 mt-2">
              <TrendingUp className="w-4 h-4 inline mr-1" />
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{mockStats.totalOrders}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-orange-600 mt-2">
              {mockStats.pendingOrders} orders pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{mockStats.totalUsers}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-green-600 mt-2">
              +89 new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Products</p>
                <p className="text-2xl font-bold">{mockStats.totalProducts}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Package className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-sm text-red-600 mt-2">
              <AlertTriangle className="w-4 h-4 inline mr-1" />
              {mockStats.lowStockProducts} low stock
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatPrice(value as number)} />
                <Bar dataKey="sales" fill="#003DA5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categorySales}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categorySales.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Order ID</th>
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Total</th>
                  <th className="text-left py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">{order.id}</td>
                    <td className="py-3 px-4">{order.customer}</td>
                    <td className="py-3 px-4 font-medium">{formatPrice(order.total)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
