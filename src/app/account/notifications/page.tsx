'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Bell, Mail, MessageSquare, ShoppingBag, Tag, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserStore } from '@/lib/store';
import { toast } from '@/hooks/use-toast';

interface Prefs {
  emailNotifications: boolean;
  whatsappNotifications: boolean;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-boots-blue focus:ring-offset-2 ${
        checked ? 'bg-boots-blue' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useUserStore();
  const [prefs, setPrefs] = useState<Prefs>({ emailNotifications: true, whatsappNotifications: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login?redirect=/account/notifications');
      return;
    }
    fetch('/api/notifications', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setPrefs({ emailNotifications: d.emailNotifications ?? true, whatsappNotifications: d.whatsappNotifications ?? false }))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated, router, token]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(prefs),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast({ title: 'Preferences saved', description: 'Your notification settings have been updated.' });
    } catch {
      toast({ title: 'Error', description: 'Could not save preferences', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const emailOptions = [
    { icon: ShoppingBag, label: 'Order updates', desc: 'Confirmation, dispatch, and delivery notifications' },
    { icon: Tag, label: 'Offers & promotions', desc: 'Exclusive deals, sale alerts, and discount codes' },
    { icon: Package, label: 'Back-in-stock alerts', desc: 'When a wishlist item becomes available again' },
  ];

  const whatsappOptions = [
    { icon: ShoppingBag, label: 'Order updates', desc: 'Delivery status sent directly to WhatsApp' },
    { icon: Tag, label: 'Flash sale alerts', desc: 'Time-sensitive offers via WhatsApp message' },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-4">
          {[1, 2].map((i) => <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/account">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Account</Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-gray-600 text-sm">Choose how you hear from us</p>
          </div>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="w-4 h-4 text-boots-blue" />
                Email Notifications
                <div className="ml-auto">
                  <Toggle checked={prefs.emailNotifications} onChange={(v) => setPrefs({ ...prefs, emailNotifications: v })} />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {emailOptions.map(({ icon: Icon, label, desc }) => (
                <div key={label} className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${prefs.emailNotifications ? '' : 'opacity-40'}`}>
                  <div className="p-2 bg-gray-100 rounded-lg shrink-0">
                    <Icon className="w-4 h-4 text-boots-blue" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                </div>
              ))}
              {!prefs.emailNotifications && (
                <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                  You will still receive essential transactional emails (receipts, password resets).
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="w-4 h-4 text-green-600" />
                WhatsApp Notifications
                <div className="ml-auto">
                  <Toggle checked={prefs.whatsappNotifications} onChange={(v) => setPrefs({ ...prefs, whatsappNotifications: v })} />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {whatsappOptions.map(({ icon: Icon, label, desc }) => (
                <div key={label} className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${prefs.whatsappNotifications ? '' : 'opacity-40'}`}>
                  <div className="p-2 bg-gray-100 rounded-lg shrink-0">
                    <Icon className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                </div>
              ))}
              {prefs.whatsappNotifications && (
                <p className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                  Messages will be sent to the phone number registered on your account.
                </p>
              )}
            </CardContent>
          </Card>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>
    </div>
  );
}
