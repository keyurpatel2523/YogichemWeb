'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Calendar, Tag, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const mockCoupons = [
  { id: 1, code: 'SAVE20', type: 'percentage', value: 20, minOrder: 30, used: 245, limit: 1000, isActive: true },
  { id: 2, code: 'WELLNESS15', type: 'percentage', value: 15, minOrder: 20, used: 156, limit: 500, isActive: true },
  { id: 3, code: 'FREESHIP', type: 'fixed', value: 3.50, minOrder: 15, used: 890, limit: null, isActive: true },
  { id: 4, code: 'WELCOME10', type: 'percentage', value: 10, minOrder: 0, used: 1234, limit: null, isActive: true },
  { id: 5, code: 'SUMMER25', type: 'percentage', value: 25, minOrder: 50, used: 450, limit: 500, isActive: false },
];

const mockPromotions = [
  { id: 1, name: 'Big Boots Sale', type: 'banner', startDate: '2024-01-01', endDate: '2024-02-28', isActive: true },
  { id: 2, name: "Valentine's Day", type: 'event', startDate: '2024-02-01', endDate: '2024-02-14', isActive: true },
  { id: 3, name: 'Wellness Week', type: 'weekly', startDate: '2024-01-15', endDate: '2024-01-21', isActive: true },
  { id: 4, name: 'Birthday Discount', type: 'birthday', startDate: null, endDate: null, isActive: true },
];

export default function AdminPromotionsPage() {
  const [activeTab, setActiveTab] = useState<'coupons' | 'promotions'>('coupons');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Promotions & Coupons</h1>
          <p className="text-gray-600">Manage discounts and promotional campaigns</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create New
        </Button>
      </div>

      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'coupons' ? 'border-boots-blue text-boots-blue' : 'border-transparent text-gray-500'
          }`}
        >
          <Tag className="w-4 h-4 inline mr-2" />
          Coupons
        </button>
        <button
          onClick={() => setActiveTab('promotions')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'promotions' ? 'border-boots-blue text-boots-blue' : 'border-transparent text-gray-500'
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          Promotions
        </button>
      </div>

      {activeTab === 'coupons' && (
        <Card>
          <CardHeader>
            <CardTitle>Active Coupon Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Code</th>
                    <th className="text-left py-3 px-4">Discount</th>
                    <th className="text-left py-3 px-4">Min Order</th>
                    <th className="text-left py-3 px-4">Usage</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockCoupons.map((coupon) => (
                    <tr key={coupon.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono font-medium">{coupon.code}</td>
                      <td className="py-3 px-4">
                        {coupon.type === 'percentage' ? (
                          <span>{coupon.value}% off</span>
                        ) : (
                          <span>£{coupon.value} off</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {coupon.minOrder > 0 ? `£${coupon.minOrder}` : '-'}
                      </td>
                      <td className="py-3 px-4">
                        {coupon.used}{coupon.limit ? ` / ${coupon.limit}` : ''}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={coupon.isActive ? 'success' : 'secondary'}>
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'promotions' && (
        <Card>
          <CardHeader>
            <CardTitle>Promotional Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Type</th>
                    <th className="text-left py-3 px-4">Start Date</th>
                    <th className="text-left py-3 px-4">End Date</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockPromotions.map((promo) => (
                    <tr key={promo.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{promo.name}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="capitalize">{promo.type}</Badge>
                      </td>
                      <td className="py-3 px-4">{promo.startDate || 'Always'}</td>
                      <td className="py-3 px-4">{promo.endDate || 'Ongoing'}</td>
                      <td className="py-3 px-4">
                        <Badge variant={promo.isActive ? 'success' : 'secondary'}>
                          {promo.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
