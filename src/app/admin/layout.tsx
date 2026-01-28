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
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Package, label: 'Products', href: '/admin/products' },
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

        <nav className="p-4">
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
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white">
            <LogOut className="w-5 h-5" />
            Back to Store
          </Link>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-3">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="text-lg font-semibold">BootsShop Admin</div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Admin User</span>
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
