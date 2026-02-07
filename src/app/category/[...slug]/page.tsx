'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Link from 'next/link';
import { Filter, Grid, List, PackageSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function CategoryPage({ params }: { params: { slug: string[] } }) {
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categorySlug = params.slug[0];
  const subcategorySlug = params.slug.length > 1 ? params.slug.slice(1).join('/') : null;

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products', 'category', categorySlug, sortBy],
    queryFn: async () => {
      const res = await fetch(`/api/products?category=${categorySlug}&sort=${sortBy}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
  });

  const categoryName = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1).replace(/-/g, ' ');
  const subcategoryName = subcategorySlug
    ? subcategorySlug.split('/').map(s => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ')).join(' / ')
    : null;

  const displayName = subcategoryName ? `${categoryName} / ${subcategoryName}` : categoryName;

  if (!isLoading && (error || (products && products.length === 0))) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mb-6 flex justify-center">
            <PackageSearch className="w-20 h-20 text-gray-300" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            No Products Found
          </h1>
          <p className="text-gray-600 mb-2">
            We couldn&apos;t find any products in <span className="font-semibold">&quot;{displayName}&quot;</span>.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            This category may not exist yet, or products haven&apos;t been added. Try browsing our other categories.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#003DA5] text-white font-medium rounded-lg hover:bg-[#002d7a] transition-colors"
            >
              Back to Home
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center justify-center px-6 py-3 border border-[#003DA5] text-[#003DA5] font-medium rounded-lg hover:bg-blue-50 transition-colors"
            >
              Search Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <nav className="text-sm text-gray-500 mb-2">
          <Link href="/" className="hover:text-[#003DA5]">Home</Link>
          <span className="mx-2">/</span>
          {subcategorySlug ? (
            <>
              <Link href={`/category/${categorySlug}`} className="hover:text-[#003DA5]">{categoryName}</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900">{subcategoryName}</span>
            </>
          ) : (
            <span className="text-gray-900">{categoryName}</span>
          )}
        </nav>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{displayName}</h1>
        <p className="text-gray-600">
          {isLoading ? 'Loading...' : `${products?.length || 0} products`}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>

        <div className="flex items-center gap-2 md:ml-auto">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'} gap-4`}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'} gap-4`}>
          {products?.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
