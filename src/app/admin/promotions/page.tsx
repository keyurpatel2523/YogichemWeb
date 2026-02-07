'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Tag, Percent, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdminStore } from '@/lib/admin-store';
import { toast } from '@/hooks/use-toast';

export default function AdminPromotionsPage() {
  const { token } = useAdminStore();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    code: '',
    type: 'percentage',
    value: '',
    minOrderAmount: '',
    usageLimit: '',
    isActive: true,
  });

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: async () => {
      const res = await fetch('/api/admin/coupons', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch coupons');
      return res.json();
    },
  });

  const saveCoupon = useMutation({
    mutationFn: async (data: any) => {
      const method = editId ? 'PATCH' : 'POST';
      const body = editId ? { id: editId, ...data } : data;
      const res = await fetch('/api/admin/coupons', {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to save coupon');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      setShowForm(false);
      setEditId(null);
      setForm({ code: '', type: 'percentage', value: '', minOrderAmount: '', usageLimit: '', isActive: true });
      toast({ title: editId ? 'Coupon updated' : 'Coupon created' });
    },
  });

  const deleteCoupon = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/coupons?id=${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to delete coupon');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      toast({ title: 'Coupon deleted' });
    },
  });

  const handleEdit = (coupon: any) => {
    setEditId(coupon.id);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minOrderAmount: coupon.minOrderAmount || '',
      usageLimit: coupon.usageLimit?.toString() || '',
      isActive: coupon.isActive,
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.code || !form.value) {
      toast({ title: 'Please fill in required fields' });
      return;
    }
    saveCoupon.mutate({
      code: form.code,
      type: form.type,
      value: form.value,
      minOrderAmount: form.minOrderAmount || null,
      usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
      isActive: form.isActive,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Promotions & Coupons</h1>
          <p className="text-gray-600">Manage discounts and promotional campaigns</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditId(null); setForm({ code: '', type: 'percentage', value: '', minOrderAmount: '', usageLimit: '', isActive: true }); }}>
          <Plus className="w-4 h-4 mr-2" />
          Create Coupon
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{editId ? 'Edit Coupon' : 'New Coupon'}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Code</label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SAVE20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Value</label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  placeholder={form.type === 'percentage' ? 'e.g. 20' : 'e.g. 5.00'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Min Order Amount</label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.minOrderAmount}
                  onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Usage Limit</label>
                <Input
                  type="number"
                  value={form.usageLimit}
                  onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                  placeholder="Unlimited"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />
                  <span className="text-sm font-medium">Active</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSave} disabled={saveCoupon.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {saveCoupon.isPending ? 'Saving...' : 'Save Coupon'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            <Tag className="w-5 h-5 inline mr-2" />
            Coupon Codes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-gray-500">Loading coupons...</p>
          ) : (
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
                  {coupons.length > 0 ? (
                    coupons.map((coupon: any) => (
                      <tr key={coupon.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono font-medium">{coupon.code}</td>
                        <td className="py-3 px-4">
                          {coupon.type === 'percentage' ? (
                            <span>{Number(coupon.value)}% off</span>
                          ) : (
                            <span>£{Number(coupon.value).toFixed(2)} off</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {coupon.minOrderAmount ? `£${Number(coupon.minOrderAmount).toFixed(2)}` : '-'}
                        </td>
                        <td className="py-3 px-4">
                          {coupon.usedCount || 0}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={coupon.isActive ? 'default' : 'secondary'}>
                            {coupon.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(coupon)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500"
                              onClick={() => {
                                if (confirm('Delete this coupon?')) {
                                  deleteCoupon.mutate(coupon.id);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        No coupons found. Create one to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
