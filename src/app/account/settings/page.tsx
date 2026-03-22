'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Settings, Shield, Trash2, LogOut, ChevronRight,
  User, MapPin, Bell, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserStore } from '@/lib/store';
import { toast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useUserStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login?redirect=/account/settings');
    }
  }, [isAuthenticated, router]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push('/');
    toast({ title: 'Signed out', description: 'You have been signed out successfully.' });
  };

  const quickLinks = [
    { icon: User, label: 'Edit Profile', desc: 'Update your name, phone, and birthday', href: '/account/profile' },
    { icon: Lock, label: 'Change Password', desc: 'Update your account password', href: '/account/profile' },
    { icon: MapPin, label: 'Manage Addresses', desc: 'Add or edit delivery addresses', href: '/account/addresses' },
    { icon: Bell, label: 'Notification Preferences', desc: 'Email and WhatsApp settings', href: '/account/notifications' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/account">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Account</Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-gray-600 text-sm">Manage your account preferences</p>
          </div>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings className="w-4 h-4 text-boots-blue" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                <div className="px-6 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-boots-blue text-white flex items-center justify-center font-bold text-lg shrink-0">
                    {user.firstName?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  {user.isWholesaler && (
                    <span className="ml-auto text-xs bg-boots-blue text-white px-2 py-1 rounded-full">Wholesaler</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {quickLinks.map(({ icon: Icon, label, desc, href }) => (
                  <Link key={label} href={href}>
                    <div className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="p-2 bg-gray-100 rounded-lg shrink-0">
                        <Icon className="w-4 h-4 text-boots-blue" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-xs text-gray-500">{desc}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="w-4 h-4 text-boots-blue" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                <p>Your data is encrypted and stored securely. We never share your personal information with third parties without your consent.</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                <p>Passwords are hashed using bcrypt and are never stored in plain text.</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                <p>Sessions expire after 7 days of inactivity for your security.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Session</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Signing out will end your current session. You will need to sign in again to access your account.
              </p>
              <Button variant="outline" onClick={handleLogout} className="w-full">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-red-600">
                <Trash2 className="w-4 h-4" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!showDeleteConfirm ? (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Deleting your account is permanent. All your orders, addresses, and wallet balance will be removed and cannot be recovered.
                  </p>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50 w-full"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Delete My Account
                  </Button>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-red-600">
                    Type <strong>DELETE</strong> to confirm account deletion:
                  </p>
                  <input
                    className="flex h-10 w-full rounded-md border border-red-300 px-3 py-2 text-sm bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                    placeholder="Type DELETE to confirm"
                    value={deleteInput}
                    onChange={(e) => setDeleteInput(e.target.value)}
                  />
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      disabled={deleteInput !== 'DELETE'}
                      onClick={() => {
                        logout();
                        router.push('/');
                        toast({ title: 'Account deleted', description: 'Your account has been removed.' });
                      }}
                    >
                      Permanently Delete
                    </Button>
                    <Button variant="outline" onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
