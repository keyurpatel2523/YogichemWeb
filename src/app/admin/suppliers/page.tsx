'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Edit, Trash2, Package, AlertTriangle, TrendingUp,
  X, Truck, Mail, Phone, MapPin, User, Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { useAdminStore } from '@/lib/admin-store';

type Supplier = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  contactPerson: string | null;
  isActive: boolean;
  createdAt: string;
};

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  address: '',
  contactPerson: '',
  isActive: true,
};

export default function AdminSuppliersPage() {
  const [activeTab, setActiveTab] = useState<'suppliers' | 'inventory'>('suppliers');
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<Supplier | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const { token } = useAdminStore();
  const queryClient = useQueryClient();

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery({
    queryKey: ['admin', 'suppliers'],
    queryFn: async () => {
      const res = await fetch('/api/admin/suppliers', { headers: authHeaders });
      if (!res.ok) throw new Error('Failed to fetch suppliers');
      return res.json() as Promise<Supplier[]>;
    },
  });

  const { data: lowStockProducts = [], isLoading: stockLoading } = useQuery({
    queryKey: ['admin', 'low-stock'],
    queryFn: async () => {
      const res = await fetch('/api/admin/low-stock', { headers: authHeaders });
      if (!res.ok) throw new Error('Failed to fetch low stock products');
      return res.json();
    },
  });

  function openAdd() {
    setEditingSupplier(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(supplier: Supplier) {
    setEditingSupplier(supplier);
    setForm({
      name: supplier.name,
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      contactPerson: supplier.contactPerson || '',
      isActive: supplier.isActive,
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      showToast('Supplier name is required', 'error');
      return;
    }
    setSaving(true);
    try {
      const url = editingSupplier
        ? `/api/admin/suppliers/${editingSupplier.id}`
        : '/api/admin/suppliers';
      const method = editingSupplier ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      await queryClient.invalidateQueries({ queryKey: ['admin', 'suppliers'] });
      setShowModal(false);
      showToast(editingSupplier ? 'Supplier updated successfully' : 'Supplier added successfully');
    } catch (err: any) {
      showToast(err.message || 'Failed to save supplier', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/suppliers/${deleteConfirm.id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (!res.ok) throw new Error('Failed to delete');
      await queryClient.invalidateQueries({ queryKey: ['admin', 'suppliers'] });
      setDeleteConfirm(null);
      showToast('Supplier deleted successfully');
    } catch {
      showToast('Failed to delete supplier', 'error');
    } finally {
      setDeleting(false);
    }
  }

  const activeCount = suppliers.filter((s) => s.isActive).length;

  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Supplier Management</h1>
          <p className="text-gray-600">Add, edit and manage your suppliers</p>
        </div>
        <Button onClick={openAdd} className="bg-[#003DA5] hover:bg-[#002d7a] flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Supplier
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Suppliers</p>
                <p className="text-2xl font-bold">{suppliersLoading ? '...' : activeCount}</p>
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
                <p className="text-2xl font-bold">{stockLoading ? '...' : lowStockProducts.length}</p>
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

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        {(['suppliers', 'inventory'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors capitalize ${
              activeTab === tab ? 'border-[#003DA5] text-[#003DA5]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'inventory' ? 'Low Stock Alerts' : 'Suppliers'}
          </button>
        ))}
      </div>

      {/* Suppliers Tab */}
      {activeTab === 'suppliers' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#003DA5]" />
              Supplier List
            </CardTitle>
          </CardHeader>
          <CardContent>
            {suppliersLoading ? (
              <p className="text-center py-10 text-gray-500">Loading suppliers...</p>
            ) : suppliers.length === 0 ? (
              <div className="text-center py-14">
                <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No suppliers yet</p>
                <p className="text-gray-400 text-sm mb-4">Add your first supplier to get started</p>
                <Button onClick={openAdd} className="bg-[#003DA5] hover:bg-[#002d7a]">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Supplier
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Supplier Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Contact Info</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Contact Person</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Address</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.map((supplier) => (
                      <tr key={supplier.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-gray-900">{supplier.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Added {new Date(supplier.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          {supplier.email && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Mail className="w-3.5 h-3.5 text-gray-400" />
                              {supplier.email}
                            </div>
                          )}
                          {supplier.phone && (
                            <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              {supplier.phone}
                            </div>
                          )}
                          {!supplier.email && !supplier.phone && <span className="text-gray-400 text-sm">—</span>}
                        </td>
                        <td className="py-3 px-4">
                          {supplier.contactPerson ? (
                            <div className="flex items-center gap-1 text-sm text-gray-700">
                              <User className="w-3.5 h-3.5 text-gray-400" />
                              {supplier.contactPerson}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 max-w-[180px]">
                          {supplier.address ? (
                            <div className="flex items-start gap-1 text-sm text-gray-600">
                              <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                              <span className="truncate">{supplier.address}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={supplier.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}>
                            {supplier.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEdit(supplier)}
                              className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit supplier"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(supplier)}
                              className="p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                              title="Delete supplier"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Low Stock Tab */}
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
              <p className="text-center py-10 text-gray-500">Loading...</p>
            ) : lowStockProducts.length === 0 ? (
              <div className="text-center py-14">
                <Check className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">All products are well-stocked</p>
                <p className="text-gray-400 text-sm">No items are below their restock threshold</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Product</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Current Stock</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Threshold</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Price</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Urgency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockProducts.map((product: any) => {
                      const ratio = product.stock / product.lowStockThreshold;
                      const urgency = product.stock === 0 ? 'Out of Stock' : ratio < 0.5 ? 'Critical' : 'Low';
                      const urgencyColor = product.stock === 0 ? 'bg-red-100 text-red-700' : ratio < 0.5 ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700';
                      return (
                        <tr key={product.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{product.name}</td>
                          <td className="py-3 px-4">
                            <span className={`font-bold text-lg ${product.stock === 0 ? 'text-red-600' : 'text-orange-500'}`}>
                              {product.stock}
                            </span>
                            <span className="text-gray-400 text-sm"> units</span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{product.lowStockThreshold} units</td>
                          <td className="py-3 px-4 text-gray-700 font-medium">{formatPrice(Number(product.price))}</td>
                          <td className="py-3 px-4">
                            <Badge className={urgencyColor}>{urgency}</Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Truck className="w-5 h-5 text-[#003DA5]" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4">

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Supplier Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. ABC Healthcare Ltd"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003DA5] focus:border-transparent"
                />
              </div>

              {/* Contact Person */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Contact Person
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.contactPerson}
                    onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                    placeholder="e.g. John Smith"
                    className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003DA5] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="supplier@example.com"
                      className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003DA5] focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+44 1234 567890"
                      className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003DA5] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <textarea
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    rows={3}
                    placeholder="123 Business Park, London, UK"
                    className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003DA5] focus:border-transparent resize-none"
                  />
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Active Status</p>
                  <p className="text-xs text-gray-500 mt-0.5">Active suppliers appear in reports and reorder suggestions</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    form.isActive ? 'bg-[#003DA5]' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-xl">
              <Button variant="outline" onClick={() => setShowModal(false)} disabled={saving}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#003DA5] hover:bg-[#002d7a] min-w-[120px]"
              >
                {saving ? 'Saving...' : editingSupplier ? 'Save Changes' : 'Add Supplier'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Supplier?</h3>
              <p className="text-gray-500 text-sm">
                Are you sure you want to delete <span className="font-semibold text-gray-700">"{deleteConfirm.name}"</span>?
                This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)} disabled={deleting}>
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
