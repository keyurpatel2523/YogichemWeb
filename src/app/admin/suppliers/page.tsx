'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Edit, Eye, Package, AlertTriangle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { useAdminStore } from '@/lib/admin-store';

export default function AdminSuppliersPage() {
  const [activeTab, setActiveTab] = useState<'suppliers' | 'inventory'>('suppliers');
  const { token } = useAdminStore();

  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery({
    queryKey: ['admin', 'suppliers'],
    queryFn: async () => {
      const res = await fetch('/api/admin/suppliers', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch suppliers');
      return res.json();
    },
  });

  const { data: lowStockProducts = [], isLoading: stockLoading } = useQuery({
    queryKey: ['admin', 'low-stock'],
    queryFn: async () => {
      const res = await fetch('/api/admin/low-stock', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch low stock products');
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Supplier Management</h1>
          <p className="text-gray-600">Manage suppliers and inventory</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Suppliers</p>
                <p className="text-2xl font-bold">
                  {suppliersLoading ? '...' : suppliers.filter((s: any) => s.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold">
                  {stockLoading ? '...' : lowStockProducts.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Suppliers</p>
                <p className="text-2xl font-bold">{suppliersLoading ? '...' : suppliers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'suppliers' ? 'border-boots-blue text-boots-blue' : 'border-transparent text-gray-500'
          }`}
        >
          Suppliers
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'inventory' ? 'border-boots-blue text-boots-blue' : 'border-transparent text-gray-500'
          }`}
        >
          Low Stock Alerts
        </button>
      </div>

      {activeTab === 'suppliers' && (
        <Card>
          <CardHeader>
            <CardTitle>Supplier List</CardTitle>
          </CardHeader>
          <CardContent>
            {suppliersLoading ? (
              <p className="text-center py-8 text-gray-500">Loading...</p>
            ) : suppliers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Supplier</th>
                      <th className="text-left py-3 px-4">Contact</th>
                      <th className="text-left py-3 px-4">Contact Person</th>
                      <th className="text-left py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.map((supplier: any) => (
                      <tr key={supplier.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{supplier.name}</td>
                        <td className="py-3 px-4">
                          <p className="text-sm">{supplier.email || '-'}</p>
                          <p className="text-sm text-gray-500">{supplier.phone || '-'}</p>
                        </td>
                        <td className="py-3 px-4">{supplier.contactPerson || '-'}</td>
                        <td className="py-3 px-4">
                          <Badge variant={supplier.isActive ? 'default' : 'secondary'}>
                            {supplier.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-8 text-gray-500">No suppliers found</p>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'inventory' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Products Below Stock Threshold
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stockLoading ? (
              <p className="text-center py-8 text-gray-500">Loading...</p>
            ) : lowStockProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Product</th>
                      <th className="text-left py-3 px-4">Current Stock</th>
                      <th className="text-left py-3 px-4">Threshold</th>
                      <th className="text-left py-3 px-4">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockProducts.map((product: any) => (
                      <tr key={product.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{product.name}</td>
                        <td className="py-3 px-4">
                          <span className="text-red-600 font-bold">{product.stock}</span>
                        </td>
                        <td className="py-3 px-4">{product.lowStockThreshold}</td>
                        <td className="py-3 px-4">{formatPrice(Number(product.price))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-8 text-gray-500">All products are well-stocked</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
