'use client';

import { useQuery } from '@tanstack/react-query';
import { ProductCard } from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';

interface FeaturedProductsProps {
  title: string;
  type: 'featured' | 'sale' | 'new';
}

export function FeaturedProducts({ title, type }: FeaturedProductsProps) {
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', type],
    queryFn: async () => {
      const res = await fetch(`/api/products?type=${type}&limit=8`);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
  });

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
          <a href={`/products?type=${type}`} className="text-boots-blue hover:underline text-sm font-medium">
            View All
          </a>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : (
            products?.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
