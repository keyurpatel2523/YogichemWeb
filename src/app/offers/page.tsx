'use client';

import { useQuery } from '@tanstack/react-query';
import { Tag, Percent, Gift } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const COUPON_HIGHLIGHTS = [
  { code: 'SAVE20', label: '20% off your order', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { code: 'WELLNESS15', label: '15% off wellness products', color: 'bg-teal-100 text-teal-800 border-teal-200' },
  { code: 'BABY15', label: '15% off baby & child', color: 'bg-pink-100 text-pink-800 border-pink-200' },
  { code: 'FREESHIP', label: 'Free shipping on any order', color: 'bg-green-100 text-green-800 border-green-200' },
  { code: 'WELCOME10', label: '10% off for new customers', color: 'bg-blue-100 text-blue-800 border-blue-200' },
];

export default function OffersPage() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', 'offers'],
    queryFn: async () => {
      const res = await fetch('/api/products?type=featured&limit=50');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#003DA5] to-[#00A19A] text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4">
            <Percent className="w-4 h-4 mr-1" />
            Exclusive Deals
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Today's Offers</h1>
          <p className="text-xl opacity-90">Use a coupon code at checkout to unlock your savings</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Coupon codes */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-[#1A1A3E] mb-1 flex items-center gap-2">
            <Gift className="w-6 h-6 text-[#003DA5]" /> Coupon Codes
          </h2>
          <p className="text-gray-500 mb-5 text-sm">Copy a code and enter it at checkout</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {COUPON_HIGHLIGHTS.map((c) => (
              <Card key={c.code} className={`border ${c.color}`}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1">Coupon Code</p>
                    <p className="text-xl font-bold tracking-widest">{c.code}</p>
                    <p className="text-sm mt-1 opacity-80">{c.label}</p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(c.code)}
                    className="ml-4 px-3 py-1.5 text-xs font-semibold border rounded-md hover:bg-white/50 transition"
                  >
                    Copy
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Featured products */}
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A3E] mb-1 flex items-center gap-2">
            <Tag className="w-6 h-6 text-[#003DA5]" /> Featured Products
          </h2>
          <p className="text-gray-500 mb-5 text-sm">Apply a coupon at checkout for extra savings</p>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(products || []).map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
