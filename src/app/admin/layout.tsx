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
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Folder,
} from 'lucide-react';
import { useAdminStore } from '@/lib/admin-store';

interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
}

const topMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
];

const bottomMenuItems = [
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

function NavLink({ href, icon: Icon, label, isActive, onClick, indent = false }: {
  href: string; icon?: any; label: string; isActive: boolean; onClick?: () => void; indent?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${
        indent ? 'pl-8' : ''
      } ${
        isActive
          ? 'bg-[#003DA5] text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
    >
      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      <span className="truncate">{label}</span>
    </Link>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { admin, token, logout, isAuthenticated } = useAdminStore();
  const [checking, setChecking] = useState(true);

  // Category tree state
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);
  const [expandedParents, setExpandedParents] = useState<Set<number>>(new Set());
  const [productsExpanded, setProductsExpanded] = useState(true);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setChecking(false);
      return;
    }
    if (!token) {
      setChecking(false);
      router.push('/admin/login');
      return;
    }
    fetch('/api/admin/auth', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) { logout(); router.push('/admin/login'); }
        setChecking(false);
      })
      .catch(() => { logout(); router.push('/admin/login'); setChecking(false); });
  }, [pathname, token]);

  // Fetch categories for dynamic sidebar tree
  useEffect(() => {
    if (pathname === '/admin/login') return;
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data: Category[]) => {
        setCategories(data);
        // Auto-expand parent of currently active category
        if (pathname.startsWith('/admin/categories')) {
          setCategoriesExpanded(true);
        }
      })
      .catch(() => {});
  }, [pathname]);

  if (pathname === '/admin/login') return <>{children}</>;

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#003DA5] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) return null;

  const handleLogout = () => { logout(); router.push('/admin/login'); };

  const parentCategories = categories.filter((c) => !c.parentId);
  const getSubcategories = (parentId: number) => categories.filter((c) => c.parentId === parentId);

  const toggleParent = (id: number) => {
    setExpandedParents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const closeSidebar = () => setSidebarOpen(false);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <Link href="/admin" className="text-xl font-bold text-white">Admin Panel</Link>
        <button className="lg:hidden text-gray-300 hover:text-white" onClick={closeSidebar}>
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">

        {/* Dashboard */}
        {topMenuItems.map((item) => (
          <NavLink key={item.href} href={item.href} icon={item.icon} label={item.label}
            isActive={pathname === item.href} onClick={closeSidebar} />
        ))}

        {/* ── CATEGORIES (expandable tree) ── */}
        <div>
          <button
            onClick={() => setCategoriesExpanded((v) => !v)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm
              ${pathname.startsWith('/admin/categories') ? 'bg-[#003DA5] text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
          >
            <FolderTree className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-left truncate">Categories</span>
            {categoriesExpanded
              ? <ChevronDown className="w-4 h-4 flex-shrink-0 opacity-60" />
              : <ChevronRight className="w-4 h-4 flex-shrink-0 opacity-60" />}
          </button>

          {categoriesExpanded && (
            <div className="mt-0.5 ml-3 pl-3 border-l border-gray-700 space-y-0.5">
              {/* All categories link */}
              <Link href="/admin/categories" onClick={closeSidebar}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors
                  ${pathname === '/admin/categories' && !new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('parent')
                    ? 'bg-[#003DA5]/80 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}>
                <Folder className="w-3.5 h-3.5" />
                All Categories
              </Link>

              {/* Parent categories */}
              {parentCategories.map((parent) => {
                const subs = getSubcategories(parent.id);
                const isParentExpanded = expandedParents.has(parent.id);
                const isParentActive = pathname === `/admin/categories` && typeof window !== 'undefined'
                  && new URLSearchParams(window.location.search).get('parent') === String(parent.id);

                return (
                  <div key={parent.id}>
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/categories?parent=${parent.id}`}
                        onClick={closeSidebar}
                        className={`flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors
                          ${isParentActive ? 'text-white bg-[#003DA5]/80' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                      >
                        {isParentExpanded ? <FolderOpen className="w-3.5 h-3.5 flex-shrink-0" /> : <Folder className="w-3.5 h-3.5 flex-shrink-0" />}
                        <span className="truncate">{parent.name}</span>
                        {subs.length > 0 && (
                          <span className="ml-auto text-[10px] bg-gray-700 rounded-full px-1.5 py-0.5 text-gray-400 leading-none">
                            {subs.length}
                          </span>
                        )}
                      </Link>
                      {subs.length > 0 && (
                        <button
                          onClick={() => toggleParent(parent.id)}
                          className="p-1 text-gray-500 hover:text-gray-300 rounded transition-colors"
                        >
                          {isParentExpanded
                            ? <ChevronDown className="w-3 h-3" />
                            : <ChevronRight className="w-3 h-3" />}
                        </button>
                      )}
                    </div>

                    {/* Subcategories */}
                    {isParentExpanded && subs.length > 0 && (
                      <div className="ml-4 pl-2 border-l border-gray-700/50 mt-0.5 space-y-0.5">
                        {subs.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/admin/categories?parent=${parent.id}&sub=${sub.id}`}
                            onClick={closeSidebar}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-white hover:bg-gray-700 transition-colors"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-600 flex-shrink-0" />
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── PRODUCTS (expandable) ── */}
        <div>
          <button
            onClick={() => setProductsExpanded((v) => !v)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm
              ${pathname.startsWith('/admin/products') ? 'bg-[#003DA5] text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
          >
            <Package className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-left">Products</span>
            {productsExpanded
              ? <ChevronDown className="w-4 h-4 flex-shrink-0 opacity-60" />
              : <ChevronRight className="w-4 h-4 flex-shrink-0 opacity-60" />}
          </button>

          {productsExpanded && (
            <div className="mt-0.5 ml-3 pl-3 border-l border-gray-700 space-y-0.5">
              <Link href="/admin/products" onClick={closeSidebar}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors
                  ${pathname === '/admin/products' ? 'bg-[#003DA5]/80 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}>
                All Products
              </Link>
              <Link href="/admin/products/new" onClick={closeSidebar}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors
                  ${pathname === '/admin/products/new' ? 'bg-[#003DA5]/80 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}>
                + Add Product
              </Link>
            </div>
          )}
        </div>

        {/* Rest of nav */}
        {bottomMenuItems.map((item) => (
          <NavLink key={item.href} href={item.href} icon={item.icon} label={item.label}
            isActive={pathname.startsWith(item.href)} onClick={closeSidebar} />
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-700">
        <div className="px-4 py-2 text-xs text-gray-500 truncate">{admin?.name || 'Admin User'}</div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg w-full text-sm transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1A1A3E] text-white flex flex-col transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-200`}
      >
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-3">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="text-lg font-semibold text-gray-800">Yogichem Admin</div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden sm:block">{admin?.name || 'Admin'}</span>
              <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-800 font-medium">
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">{children}</main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={closeSidebar} />
      )}
    </div>
  );
}
