'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Eye, Package, AlertTriangle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';

const mockSuppliers = [
  { id: 1, name: 'BeautyWholesale Ltd', email: 'orders@beautywholesale.com', phone: '+44 20 7123 4567', products: 45, pendingOrders: 2, isActive: true },
  { id: 2, name: 'HealthSupply Co', email: 'supply@healthsupply.co.uk', phone: '+44 20 7987 6543', products: 32, pendingOrders: 0, isActive: true },
  { id: 3, name: 'Wellness Direct', email: 'orders@wellnessdirect.com', phone: '+44 20 7456 7890', products: 28, pendingOrders: 1, isActive: true },
  { id: 4, name: 'Baby Essentials Inc', email: 'sales@babyessentials.co.uk', phone: '+44 20 7321 0987', products: 18, pendingOrders: 0, isActive: true },
  { id: 5, name: 'ElectricalBeauty PLC', email: 'orders@electricalbeauty.com', phone: '+44 20 7654 3210', products: 12, pendingOrders: 3, isActive: false },
];

const lowStockProducts = [
  { id: 1, name: 'No7 Lift & Luminate Serum', stock: 5, threshold: 10, supplier: 'BeautyWholesale Ltd', cost: 18.50 },
  { id: 2, name: 'Vitamin D 1000IU Tablets', stock: 8, threshold: 20, supplier: 'HealthSupply Co', cost: 4.25 },
  { id: 3, name: 'CeraVe Moisturising Cream', stock: 3, threshold: 15, supplier: 'BeautyWholesale Ltd', cost: 8.00 },
  { id: 4, name: 'Pampers Baby-Dry Size 4', stock: 12, threshold: 25, supplier: 'Baby Essentials Inc', cost: 6.50 },
];

export default function AdminSuppliersPage() {
  const [activeTab, setActiveTab] = useState<'suppliers' | 'inventory'>('suppliers');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Supplier Management</h1>
          <p className="text-gray-600">Manage suppliers and inventory</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Suppliers</p>
                <p className="text-2xl font-bold">{mockSuppliers.filter(s => s.isActive).length}</p>
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
                <p className="text-2xl font-bold">{lowStockProducts.length}</p>
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
                <p className="text-sm text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold">{mockSuppliers.reduce((sum, s) => sum + s.pendingOrders, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold">{mockSuppliers.reduce((sum, s) => sum + s.products, 0)}</p>
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Supplier</th>
                    <th className="text-left py-3 px-4">Contact</th>
                    <th className="text-left py-3 px-4">Products</th>
                    <th className="text-left py-3 px-4">Pending Orders</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockSuppliers.map((supplier) => (
                    <tr key={supplier.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{supplier.name}</td>
                      <td className="py-3 px-4">
                        <p className="text-sm">{supplier.email}</p>
                        <p className="text-sm text-gray-500">{supplier.phone}</p>
                      </td>
                      <td className="py-3 px-4">{supplier.products}</td>
                      <td className="py-3 px-4">
                        {supplier.pendingOrders > 0 ? (
                          <Badge variant="warning">{supplier.pendingOrders}</Badge>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={supplier.isActive ? 'success' : 'secondary'}>
                          {supplier.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Edit className="w-4 h-4" />
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

      {activeTab === 'inventory' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Products Below Stock Threshold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Product</th>
                    <th className="text-left py-3 px-4">Current Stock</th>
                    <th className="text-left py-3 px-4">Threshold</th>
                    <th className="text-left py-3 px-4">Supplier</th>
                    <th className="text-left py-3 px-4">Unit Cost</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{product.name}</td>
                      <td className="py-3 px-4">
                        <span className="text-red-600 font-bold">{product.stock}</span>
                      </td>
                      <td className="py-3 px-4">{product.threshold}</td>
                      <td className="py-3 px-4">{product.supplier}</td>
                      <td className="py-3 px-4">{formatPrice(product.cost)}</td>
                      <td className="py-3 px-4">
                        <Button size="sm">
                          Auto-Order
                        </Button>
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
