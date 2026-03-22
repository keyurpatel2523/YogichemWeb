'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Plus, Pencil, Trash2, Star, StarOff, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserStore } from '@/lib/store';
import { toast } from '@/hooks/use-toast';

interface Address {
  id: number;
  type: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string | null;
  city: string;
  state?: string | null;
  postalCode: string;
  country: string;
  phone?: string | null;
  isDefault: boolean;
}

const emptyForm = {
  firstName: '',
  lastName: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'United Kingdom',
  phone: '',
  type: 'shipping',
  isDefault: false,
};

function FieldError({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
      <AlertCircle className="w-3 h-3" /> {msg}
    </p>
  );
}

export default function AddressesPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useUserStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login?redirect=/account/addresses');
      return;
    }
    fetchAddresses();
  }, [isAuthenticated, router]);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/addresses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setAddresses(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.address1.trim()) e.address1 = 'Address is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.postalCode.trim()) e.postalCode = 'Postal code is required';
    if (!form.country.trim()) e.country = 'Country is required';
    if (form.phone && !/^[\d\s\+\-\(\)]{7,15}$/.test(form.phone)) e.phone = 'Enter a valid phone number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const url = editingId ? `/api/addresses/${editingId}` : '/api/addresses';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save address');
      await fetchAddresses();
      setShowForm(false);
      setEditingId(null);
      setForm({ ...emptyForm });
      toast({ title: editingId ? 'Address updated' : 'Address added', description: 'Your address has been saved.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (addr: Address) => {
    setForm({
      firstName: addr.firstName,
      lastName: addr.lastName,
      address1: addr.address1,
      address2: addr.address2 || '',
      city: addr.city,
      state: addr.state || '',
      postalCode: addr.postalCode,
      country: addr.country,
      phone: addr.phone || '',
      type: addr.type || 'shipping',
      isDefault: addr.isDefault,
    });
    setEditingId(addr.id);
    setErrors({});
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete');
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast({ title: 'Address removed' });
    } catch {
      toast({ title: 'Error', description: 'Could not delete address', variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to set default');
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === id }))
      );
      toast({ title: 'Default address updated' });
    } catch {
      toast({ title: 'Error', description: 'Could not update default', variant: 'destructive' });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setErrors({});
  };

  const inputClass = (err: string) =>
    `flex h-10 w-full rounded-md border px-3 py-2 text-sm bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
      err ? 'border-red-500 focus-visible:ring-red-400' : 'border-input'
    }`;

  const setField = (key: string, val: string | boolean) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/account">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Account
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">My Addresses</h1>
              <p className="text-gray-600 text-sm">Manage your delivery addresses</p>
            </div>
          </div>
          {!showForm && (
            <Button onClick={() => { setShowForm(true); setEditingId(null); setForm({ ...emptyForm }); setErrors({}); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Address
            </Button>
          )}
        </div>

        {showForm && (
          <Card className="mb-6 border-boots-blue">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">{editingId ? 'Edit Address' : 'New Address'}</h2>
                <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">First name *</label>
                  <input className={inputClass(errors.firstName)} value={form.firstName} onChange={(e) => setField('firstName', e.target.value)} placeholder="First name" />
                  <FieldError msg={errors.firstName} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Last name *</label>
                  <input className={inputClass(errors.lastName)} value={form.lastName} onChange={(e) => setField('lastName', e.target.value)} placeholder="Last name" />
                  <FieldError msg={errors.lastName} />
                </div>
              </div>

              <div className="mb-3">
                <label className="text-sm font-medium mb-1 block">Address line 1 *</label>
                <input className={inputClass(errors.address1)} value={form.address1} onChange={(e) => setField('address1', e.target.value)} placeholder="Street address" />
                <FieldError msg={errors.address1} />
              </div>

              <div className="mb-3">
                <label className="text-sm font-medium mb-1 block">Address line 2 <span className="text-gray-400 font-normal">(optional)</span></label>
                <input className={inputClass('')} value={form.address2} onChange={(e) => setField('address2', e.target.value)} placeholder="Apartment, suite, etc." />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">City *</label>
                  <input className={inputClass(errors.city)} value={form.city} onChange={(e) => setField('city', e.target.value)} placeholder="City" />
                  <FieldError msg={errors.city} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Postal code *</label>
                  <input className={inputClass(errors.postalCode)} value={form.postalCode} onChange={(e) => setField('postalCode', e.target.value.toUpperCase())} placeholder="e.g. SW1A 1AA" />
                  <FieldError msg={errors.postalCode} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Country *</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={form.country}
                    onChange={(e) => setField('country', e.target.value)}
                  >
                    <option>United Kingdom</option>
                    <option>Ireland</option>
                    <option>France</option>
                    <option>Germany</option>
                    <option>United States</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Phone <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input className={inputClass(errors.phone)} type="tel" value={form.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="+44 7700 900000" />
                  <FieldError msg={errors.phone} />
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium mb-1 block">Address type</label>
                <div className="flex gap-3">
                  {['shipping', 'billing'].map((t) => (
                    <label key={t} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer capitalize text-sm ${form.type === t ? 'border-boots-blue bg-blue-50' : 'border-input'}`}>
                      <input type="radio" className="sr-only" checked={form.type === t} onChange={() => setField('type', t)} />
                      {t}
                    </label>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 mb-5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => setField('isDefault', e.target.checked)}
                  className="w-4 h-4 rounded border-input"
                />
                <span className="text-sm">Set as default delivery address</span>
              </label>

              <div className="flex gap-3">
                <Button onClick={handleSave} disabled={saving} className="flex-1">
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Address'}
                </Button>
                <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-36 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-16">
            <MapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-bold mb-2">No addresses saved</h2>
            <p className="text-gray-600 mb-6">Add a delivery address to speed up checkout.</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Address
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <Card key={addr.id} className={addr.isDefault ? 'border-boots-blue' : ''}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{addr.firstName} {addr.lastName}</p>
                        {addr.isDefault && (
                          <Badge className="bg-boots-blue text-white text-xs">Default</Badge>
                        )}
                        <Badge variant="outline" className="text-xs capitalize">{addr.type}</Badge>
                      </div>
                      <p className="text-sm text-gray-700">{addr.address1}</p>
                      {addr.address2 && <p className="text-sm text-gray-700">{addr.address2}</p>}
                      <p className="text-sm text-gray-700">{addr.city}, {addr.postalCode}</p>
                      <p className="text-sm text-gray-700">{addr.country}</p>
                      {addr.phone && <p className="text-sm text-gray-500 mt-1">{addr.phone}</p>}
                    </div>

                    <div className="flex flex-col gap-2 items-end shrink-0">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(addr)}>
                        <Pencil className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      {!addr.isDefault && (
                        <Button variant="outline" size="sm" onClick={() => handleSetDefault(addr.id)}>
                          <Star className="w-3 h-3 mr-1" />
                          Set Default
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleDelete(addr.id)}
                        disabled={deletingId === addr.id}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        {deletingId === addr.id ? 'Removing...' : 'Remove'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
