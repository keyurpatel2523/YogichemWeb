'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Globe, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';

const mockShippingRules = [
  { id: 1, country: 'United Kingdom', countryCode: 'GB', standardCost: 3.50, standardDays: 3, freeThreshold: 25, nextDayAvailable: true, nextDayCost: 4.95, clickCollect: true, isActive: true },
  { id: 2, country: 'Ireland', countryCode: 'IE', standardCost: 5.99, standardDays: 5, freeThreshold: 50, nextDayAvailable: false, nextDayCost: null, clickCollect: false, isActive: true },
  { id: 3, country: 'France', countryCode: 'FR', standardCost: 7.99, standardDays: 7, freeThreshold: 75, nextDayAvailable: false, nextDayCost: null, clickCollect: false, isActive: true },
  { id: 4, country: 'Germany', countryCode: 'DE', standardCost: 7.99, standardDays: 7, freeThreshold: 75, nextDayAvailable: false, nextDayCost: null, clickCollect: false, isActive: true },
  { id: 5, country: 'United States', countryCode: 'US', standardCost: 12.99, standardDays: 14, freeThreshold: 100, nextDayAvailable: false, nextDayCost: null, clickCollect: false, isActive: true },
];

export default function AdminShippingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Shipping Rules</h1>
          <p className="text-gray-600">Configure country-specific shipping options</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Country
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Countries</p>
                <p className="text-2xl font-bold">{mockShippingRules.filter(r => r.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-full">
                <Truck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Next Day Countries</p>
                <p className="text-2xl font-bold">{mockShippingRules.filter(r => r.nextDayAvailable).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Click & Collect</p>
                <p className="text-2xl font-bold">{mockShippingRules.filter(r => r.clickCollect).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shipping Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Country</th>
                  <th className="text-left py-3 px-4">Standard</th>
                  <th className="text-left py-3 px-4">Delivery Time</th>
                  <th className="text-left py-3 px-4">Free Threshold</th>
                  <th className="text-left py-3 px-4">Next Day</th>
                  <th className="text-left py-3 px-4">Click & Collect</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockShippingRules.map((rule) => (
                  <tr key={rule.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{rule.countryCode === 'GB' ? '🇬🇧' : rule.countryCode === 'IE' ? '🇮🇪' : rule.countryCode === 'FR' ? '🇫🇷' : rule.countryCode === 'DE' ? '🇩🇪' : '🇺🇸'}</span>
                        <span className="font-medium">{rule.country}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{formatPrice(rule.standardCost)}</td>
                    <td className="py-3 px-4">{rule.standardDays} days</td>
                    <td className="py-3 px-4">{formatPrice(rule.freeThreshold)}</td>
                    <td className="py-3 px-4">
                      {rule.nextDayAvailable ? (
                        <span className="text-green-600">{formatPrice(rule.nextDayCost!)}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={rule.clickCollect ? 'success' : 'secondary'}>
                        {rule.clickCollect ? 'Yes' : 'No'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={rule.isActive ? 'success' : 'secondary'}>
                        {rule.isActive ? 'Active' : 'Inactive'}
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
    </div>
  );
}
