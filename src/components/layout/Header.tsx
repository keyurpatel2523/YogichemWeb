'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, Heart, User, Menu, X, ChevronDown, Truck, Package, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCartStore, useUserStore } from '@/lib/store';

const categories = [
  { name: 'Beauty', href: '/category/beauty', subcategories: ['Skincare', 'Makeup', 'Fragrance', 'Haircare'] },
  { name: 'Health', href: '/category/health', subcategories: ['Vitamins', 'Pain Relief', 'Cold & Flu', 'First Aid'] },
  { name: 'Baby & Child', href: '/category/baby', subcategories: ['Baby Food', 'Nappies', 'Toys', 'Clothing'] },
  { name: 'Wellness', href: '/category/wellness', subcategories: ['Supplements', 'Sleep', 'Stress', 'Immunity'] },
  { name: 'Electrical', href: '/category/electrical', subcategories: ['Hair Styling', 'Oral Care', 'Skincare Devices'] },
  { name: 'Gifts', href: '/category/gifts', subcategories: ['For Her', 'For Him', 'Gift Sets'] },
];

export function Header() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const cartItemCount = useCartStore((state) => state.getItemCount());
  const user = useUserStore((state) => state.user);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="bg-boots-blue text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-xs md:text-sm">
            <div className="flex items-center gap-4 md:gap-8 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1 whitespace-nowrap">
                <Truck className="w-4 h-4" />
                <span>Next day delivery</span>
              </div>
              <div className="flex items-center gap-1 whitespace-nowrap">
                <Package className="w-4 h-4" />
                <span>FREE delivery over £25</span>
              </div>
              <div className="flex items-center gap-1 whitespace-nowrap">
                <MapPin className="w-4 h-4" />
                <span>Click & Collect FREE over £15</span>
              </div>
              <div className="flex items-center gap-1 whitespace-nowrap">
                <Clock className="w-4 h-4" />
                <span>Same day delivery available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <button
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link href="/" className="flex-shrink-0">
            <div className="text-2xl md:text-3xl font-bold text-boots-blue">
              Yogichem
            </div>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-4">
            <div className="relative w-full">
              <Input
                type="search"
                placeholder="Search products, brands, and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-boots-blue rounded-full"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </form>

          <div className="flex items-center gap-2 md:gap-4">
            <Link href={user ? '/account' : '/login'} className="flex flex-col items-center text-sm">
              <User className="w-6 h-6" />
              <span className="hidden md:block text-xs">{user ? 'Account' : 'Sign In'}</span>
            </Link>
            <Link href="/wishlist" className="flex flex-col items-center text-sm">
              <Heart className="w-6 h-6" />
              <span className="hidden md:block text-xs">Wishlist</span>
            </Link>
            <Link href="/cart" className="flex flex-col items-center text-sm relative">
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 text-xs bg-boots-red">
                  {cartItemCount}
                </Badge>
              )}
              <span className="hidden md:block text-xs">Basket</span>
            </Link>
          </div>
        </div>

        <form onSubmit={handleSearch} className="md:hidden mt-3">
          <div className="relative w-full">
            <Input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-boots-blue rounded-full"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </form>
      </div>

      <nav className="hidden lg:block bg-boots-gray border-y">
        <div className="container mx-auto px-4">
          <ul className="flex items-center gap-1">
            {categories.map((category) => (
              <li key={category.name} className="relative group">
                <Link
                  href={category.href}
                  className="flex items-center gap-1 px-4 py-3 text-sm font-medium hover:bg-boots-lightGray transition-colors"
                >
                  {category.name}
                  <ChevronDown className="w-4 h-4" />
                </Link>
                <div className="absolute left-0 top-full bg-white shadow-lg rounded-b-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[200px] z-50">
                  <ul className="py-2">
                    {category.subcategories.map((sub) => (
                      <li key={sub}>
                        <Link
                          href={`${category.href}/${sub.toLowerCase().replace(' ', '-')}`}
                          className="block px-4 py-2 text-sm hover:bg-boots-gray transition-colors"
                        >
                          {sub}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
            <li>
              <Link
                href="/sale"
                className="flex items-center px-4 py-3 text-sm font-medium text-boots-red hover:bg-boots-lightGray transition-colors"
              >
                SALE
              </Link>
            </li>
            <li>
              <Link
                href="/offers"
                className="flex items-center px-4 py-3 text-sm font-medium text-boots-blue hover:bg-boots-lightGray transition-colors"
              >
                Offers
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[120px] bg-white z-40 overflow-y-auto">
          <nav className="container mx-auto px-4 py-4">
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.name}>
                  <Link
                    href={category.href}
                    className="block py-3 text-lg font-medium border-b"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/sale"
                  className="block py-3 text-lg font-medium text-boots-red border-b"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  SALE
                </Link>
              </li>
              <li>
                <Link
                  href="/offers"
                  className="block py-3 text-lg font-medium text-boots-blue border-b"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Offers
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
