'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Package, Heart, Wallet, Settings, LogOut, Bell, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';

export default function AccountPage() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useUserStore();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const menuItems = [
    { icon: User, label: 'Profile', href: '/account/profile', description: 'Manage your personal information' },
    { icon: Package, label: 'Orders', href: '/account/orders', description: 'View and track your orders' },
    { icon: Heart, label: 'Wishlist', href: '/wishlist', description: 'Products you love' },
    { icon: Wallet, label: 'Wallet', href: '/account/wallet', description: `Balance: ${formatPrice(user.walletBalance || '0')}` },
    { icon: MapPin, label: 'Addresses', href: '/account/addresses', description: 'Manage delivery addresses' },
    { icon: Bell, label: 'Notifications', href: '/account/notifications', description: 'Email and WhatsApp preferences' },
    { icon: Settings, label: 'Settings', href: '/account/settings', description: 'Account settings' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">My Account</h1>
            <p className="text-gray-600">Welcome back, {user.firstName}!</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {menuItems.map((item) => (
            <Link key={item.label} href={item.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="p-3 rounded-full bg-boots-gray">
                    <item.icon className="w-6 h-6 text-boots-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.label}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {user.isWholesaler && (
          <Card className="mt-6 border-boots-blue">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-boots-blue">Wholesaler Account</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                As a verified wholesaler, you have access to special pricing on selected products.
              </p>
              <Link href="/wholesale">
                <Button>View Wholesale Prices</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
