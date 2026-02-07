'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Suspense } from 'react';
import Link from 'next/link';
import { Search as SearchIcon, SlidersHorizontal } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', 'search', query],
    queryFn: async () => {
      if (!query.trim()) return [];
      const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=50`);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
    enabled: !!query.trim(),
  });

  if (!query.trim()) {
    return (
      <div className="text-center py-16">
        <SearchIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-bold mb-2">Search for products</h2>
        <p className="text-gray-600">Use the search bar above to find products, brands, and more.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Search results for &ldquo;{query}&rdquo;
          </h1>
          <p className="text-gray-600 mt-1">
            {isLoading ? 'Searching...' : `${products?.length || 0} products found`}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : products?.length === 0 ? (
        <div className="text-center py-16">
          <SearchIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-bold mb-2">No results found</h2>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t find any products matching &ldquo;{query}&rdquo;.
            Try a different search term.
          </p>
          <Link href="/">
            <Button>Browse All Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products?.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      }>
        <SearchResults />
      </Suspense>
    </div>
  );
}
