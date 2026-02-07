'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Globe, Truck, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { useAdminStore } from '@/lib/admin-store';
import { toast } from '@/hooks/use-toast';

const FLAG_MAP: Record<string, string> = {
  GB: '\u{1F1EC}\u{1F1E7}',
  IE: '\u{1F1EE}\u{1F1EA}',
  FR: '\u{1F1EB}\u{1F1F7}',
  DE: '\u{1F1E9}\u{1F1EA}',
  US: '\u{1F1FA}\u{1F1F8}',
};

export default function AdminShippingPage() {
  const { token } = useAdminStore();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    country: '',
    countryCode: '',
    standardShippingCost: '',
    standardDeliveryDays: '3',
    freeShippingThreshold: '',
    nextDayAvailable: false,
    nextDayCost: '',
    clickCollectAvailable: false,
  });

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['admin', 'shipping'],
    queryFn: async () => {
      const res = await fetch('/api/admin/shipping', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch shipping rules');
      return res.json();
    },
  });

  const saveRule = useMutation({
    mutationFn: async (data: any) => {
      const method = editId ? 'PATCH' : 'POST';
      const body = editId ? { id: editId, ...data } : data;
      const res = await fetch('/api/admin/shipping', {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to save rule');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'shipping'] });
      setShowForm(false);
      setEditId(null);
      toast({ title: editId ? 'Rule updated' : 'Rule created' });
    },
  });

  const deleteRule = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/shipping?id=${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to delete rule');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'shipping'] });
      toast({ title: 'Shipping rule deleted' });
    },
  });

  const handleEdit = (rule: any) => {
    setEditId(rule.id);
    setForm({
      country: rule.country,
      countryCode: rule.countryCode,
      standardShippingCost: rule.standardShippingCost,
      standardDeliveryDays: rule.standardDeliveryDays?.toString() || '3',
      freeShippingThreshold: rule.freeShippingThreshold || '',
      nextDayAvailable: rule.nextDayAvailable || false,
      nextDayCost: rule.nextDayCost || '',
      clickCollectAvailable: rule.clickCollectAvailable || false,
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.country || !form.countryCode || !form.standardShippingCost) {
      toast({ title: 'Please fill in required fields' });
      return;
    }
    saveRule.mutate({
      country: form.country,
      countryCode: form.countryCode.toUpperCase(),
      standardShippingCost: form.standardShippingCost,
      standardDeliveryDays: parseInt(form.standardDeliveryDays),
      freeShippingThreshold: form.freeShippingThreshold || null,
      nextDayAvailable: form.nextDayAvailable,
      nextDayCost: form.nextDayCost || null,
      clickCollectAvailable: form.clickCollectAvailable,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Shipping Rules</h1>
          <p className="text-gray-600">Configure country-specific shipping options</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditId(null); setForm({ country: '', countryCode: '', standardShippingCost: '', standardDeliveryDays: '3', freeShippingThreshold: '', nextDayAvailable: false, nextDayCost: '', clickCollectAvailable: false }); }}>
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
                <p className="text-2xl font-bold">{isLoading ? '...' : rules.filter((r: any) => r.isActive).length}</p>
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
                <p className="text-2xl font-bold">{isLoading ? '...' : rules.filter((r: any) => r.nextDayAvailable).length}</p>
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
                <p className="text-2xl font-bold">{isLoading ? '...' : rules.filter((r: any) => r.clickCollectAvailable).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{editId ? 'Edit Rule' : 'New Shipping Rule'}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Country</label>
                <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="e.g. United Kingdom" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Country Code</label>
                <Input value={form.countryCode} onChange={(e) => setForm({ ...form, countryCode: e.target.value })} placeholder="e.g. GB" maxLength={3} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Standard Cost</label>
                <Input type="number" step="0.01" value={form.standardShippingCost} onChange={(e) => setForm({ ...form, standardShippingCost: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Delivery Days</label>
                <Input type="number" value={form.standardDeliveryDays} onChange={(e) => setForm({ ...form, standardDeliveryDays: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Free Threshold</label>
                <Input type="number" step="0.01" value={form.freeShippingThreshold} onChange={(e) => setForm({ ...form, freeShippingThreshold: e.target.value })} placeholder="Optional" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Next Day Cost</label>
                <Input type="number" step="0.01" value={form.nextDayCost} onChange={(e) => setForm({ ...form, nextDayCost: e.target.value })} placeholder="Optional" disabled={!form.nextDayAvailable} />
              </div>
              <div className="flex items-end gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.nextDayAvailable} onChange={(e) => setForm({ ...form, nextDayAvailable: e.target.checked })} />
                  <span className="text-sm">Next Day</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.clickCollectAvailable} onChange={(e) => setForm({ ...form, clickCollectAvailable: e.target.checked })} />
                  <span className="text-sm">Click & Collect</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSave} disabled={saveRule.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {saveRule.isPending ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Shipping Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-gray-500">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Country</th>
                    <th className="text-left py-3 px-4">Standard</th>
                    <th className="text-left py-3 px-4">Delivery</th>
                    <th className="text-left py-3 px-4">Free Threshold</th>
                    <th className="text-left py-3 px-4">Next Day</th>
                    <th className="text-left py-3 px-4">Click & Collect</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.length > 0 ? (
                    rules.map((rule: any) => (
                      <tr key={rule.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{FLAG_MAP[rule.countryCode] || ''}</span>
                            <span className="font-medium">{rule.country}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{formatPrice(Number(rule.standardShippingCost))}</td>
                        <td className="py-3 px-4">{rule.standardDeliveryDays} days</td>
                        <td className="py-3 px-4">{rule.freeShippingThreshold ? formatPrice(Number(rule.freeShippingThreshold)) : '-'}</td>
                        <td className="py-3 px-4">
                          {rule.nextDayAvailable ? (
                            <span className="text-green-600">{formatPrice(Number(rule.nextDayCost))}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={rule.clickCollectAvailable ? 'default' : 'secondary'}>
                            {rule.clickCollectAvailable ? 'Yes' : 'No'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(rule)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-500" onClick={() => { if (confirm('Delete this rule?')) deleteRule.mutate(rule.id); }}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-500">No shipping rules configured</td>
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
