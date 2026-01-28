'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Filter, Grid, List, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', 'category', params.slug, sortBy],
    queryFn: async () => {
      const res = await fetch(`/api/products?category=${params.slug}&sort=${sortBy}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
  });

  const categoryName = params.slug.charAt(0).toUpperCase() + params.slug.slice(1);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{categoryName}</h1>
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
      ) : products?.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600">No products found in this category.</p>
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
