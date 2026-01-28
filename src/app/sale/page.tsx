'use client';

import { useQuery } from '@tanstack/react-query';
import { Tag, Clock } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function SalePage() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', 'sale'],
    queryFn: async () => {
      const res = await fetch('/api/products?type=sale&limit=50');
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
  });

  return (
    <div>
      <div className="bg-gradient-to-r from-boots-red to-pink-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4">
            <Clock className="w-4 h-4 mr-1" />
            Limited Time
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Big Sale!</h1>
          <p className="text-xl opacity-90">Save up to 50% on beauty, healthcare, baby & more</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Tag className="w-5 h-5 text-boots-red" />
          <span className="font-medium">
            {isLoading ? 'Loading...' : `${products?.length || 0} items on sale`}
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : products?.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600">No sale items available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products?.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
