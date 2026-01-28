'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

const monthlySales = [
  { month: 'Jan', sales: 12500, orders: 156 },
  { month: 'Feb', sales: 18200, orders: 203 },
  { month: 'Mar', sales: 15800, orders: 178 },
  { month: 'Apr', sales: 22100, orders: 245 },
  { month: 'May', sales: 19500, orders: 220 },
  { month: 'Jun', sales: 24800, orders: 289 },
  { month: 'Jul', sales: 21300, orders: 256 },
  { month: 'Aug', sales: 26500, orders: 312 },
  { month: 'Sep', sales: 23100, orders: 278 },
  { month: 'Oct', sales: 28900, orders: 345 },
  { month: 'Nov', sales: 32500, orders: 398 },
  { month: 'Dec', sales: 41200, orders: 489 },
];

const categorySales = [
  { name: 'Beauty', value: 45200 },
  { name: 'Health', value: 32100 },
  { name: 'Wellness', value: 25800 },
  { name: 'Electrical', value: 18500 },
  { name: 'Baby', value: 12400 },
  { name: 'Gifts', value: 8900 },
];

const countrySales = [
  { country: 'United Kingdom', sales: 89500, percentage: 65 },
  { country: 'Ireland', sales: 18200, percentage: 13 },
  { country: 'France', sales: 12400, percentage: 9 },
  { country: 'Germany', sales: 10800, percentage: 8 },
  { country: 'Others', sales: 6900, percentage: 5 },
];

const topProducts = [
  { name: 'No7 Lift & Luminate Serum', sales: 1245, revenue: 43524 },
  { name: 'Dyson Supersonic Hair Dryer', sales: 89, revenue: 29361 },
  { name: 'CeraVe Moisturising Cream', sales: 1456, revenue: 23296 },
  { name: 'Sol de Janeiro Bum Bum Cream', sales: 456, revenue: 21888 },
  { name: 'The Ordinary Niacinamide', sales: 2890, revenue: 17051 },
];

const COLORS = ['#003DA5', '#00A19A', '#E31837', '#FF6B00', '#00A550', '#1A1A3E'];

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-gray-600">Sales and performance insights</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Total Revenue (YTD)</p>
            <p className="text-3xl font-bold text-boots-blue">{formatPrice(286400)}</p>
            <p className="text-sm text-green-600">+18.5% vs last year</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Average Order Value</p>
            <p className="text-3xl font-bold text-boots-blue">{formatPrice(68.50)}</p>
            <p className="text-sm text-green-600">+5.2% vs last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Conversion Rate</p>
            <p className="text-3xl font-bold text-boots-blue">3.8%</p>
            <p className="text-sm text-red-600">-0.3% vs last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Active Customers</p>
            <p className="text-3xl font-bold text-boots-blue">2,847</p>
            <p className="text-sm text-green-600">+124 new this month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatPrice(value as number)} />
                <Area type="monotone" dataKey="sales" stroke="#003DA5" fill="#003DA5" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={categorySales}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categorySales.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatPrice(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales by Country</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {countrySales.map((country, index) => (
                <div key={country.country}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{country.country}</span>
                    <span className="font-medium">{formatPrice(country.sales)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${country.percentage}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Product</th>
                    <th className="text-right py-2">Units</th>
                    <th className="text-right py-2">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, index) => (
                    <tr key={product.name} className="border-b">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-sm">#{index + 1}</span>
                          <span className="font-medium line-clamp-1">{product.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right">{product.sales.toLocaleString()}</td>
                      <td className="py-3 text-right font-medium text-boots-blue">
                        {formatPrice(product.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
