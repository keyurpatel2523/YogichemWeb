'use client';

import { useState } from 'react';
import { Save, Globe, CreditCard, Bell, Shield, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    storeName: 'Yogichem',
    storeEmail: 'help@yogichem.com',
    storePhone: '0800 123 4567',
    currency: 'GBP',
    timezone: 'Europe/London',
    minOrderAmount: '10.00',
    freeShippingThreshold: '25.00',
    nextDayCutoffHour: '14',
    enableNotifications: true,
    enableWhatsApp: true,
    maintenanceMode: false,
  });

  const handleSave = () => {
    console.log('Saving settings:', settings);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-gray-600">Configure your store settings</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5" />
              Store Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Store Name</label>
                <Input
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Email</label>
                <Input
                  type="email"
                  value={settings.storeEmail}
                  onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <Input
                  value={settings.storePhone}
                  onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Timezone</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                >
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="Europe/Paris">Europe/Paris (CET)</option>
                  <option value="America/New_York">America/New York (EST)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Order Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Minimum Order Amount (£)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={settings.minOrderAmount}
                  onChange={(e) => setSettings({ ...settings, minOrderAmount: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Free Shipping Threshold (£)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => setSettings({ ...settings, freeShippingThreshold: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Next Day Cutoff Hour (24h)</label>
                <Input
                  type="number"
                  min="0"
                  max="23"
                  value={settings.nextDayCutoffHour}
                  onChange={(e) => setSettings({ ...settings, nextDayCutoffHour: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-600">Send order confirmations and updates via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableNotifications}
                  onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-boots-blue"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">WhatsApp Notifications</p>
                <p className="text-sm text-gray-600">Send order updates via WhatsApp</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableWhatsApp}
                  onChange={(e) => setSettings({ ...settings, enableWhatsApp: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-boots-blue"></div>
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security & Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Maintenance Mode</p>
                <p className="text-sm text-gray-600">Temporarily disable the storefront</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
