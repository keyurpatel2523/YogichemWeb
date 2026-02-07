'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Tag,
  Truck,
  BarChart2,
  Settings,
  Mail,
  MessageSquare,
  Menu,
  X,
  LogOut,
  Boxes,
  FolderTree,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminStore } from '@/lib/admin-store';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Package, label: 'Products', href: '/admin/products' },
  { icon: FolderTree, label: 'Categories', href: '/admin/categories' },
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: ShoppingCart, label: 'Orders', href: '/admin/orders' },
  { icon: Tag, label: 'Promotions', href: '/admin/promotions' },
  { icon: Truck, label: 'Shipping', href: '/admin/shipping' },
  { icon: Boxes, label: 'Suppliers', href: '/admin/suppliers' },
  { icon: Mail, label: 'Email Campaigns', href: '/admin/email' },
  { icon: MessageSquare, label: 'WhatsApp', href: '/admin/whatsapp' },
  { icon: BarChart2, label: 'Analytics', href: '/admin/analytics' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { admin, token, logout, isAuthenticated } = useAdminStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setChecking(false);
      return;
    }

    if (!token) {
      router.push('/admin/login');
      return;
    }

    fetch('/api/admin/auth', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          logout();
          router.push('/admin/login');
        }
        setChecking(false);
      })
      .catch(() => {
        logout();
        router.push('/admin/login');
      });
  }, [pathname, token]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-boots-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-boots-navy text-white transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-200`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <Link href="/admin" className="text-xl font-bold">
            Admin Panel
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-boots-blue text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white w-full"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-3">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="text-lg font-semibold">Yogichem Admin</div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{admin?.name || 'Admin'}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">{children}</main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
