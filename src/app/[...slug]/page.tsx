'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Filter, Grid, List, PackageSearch, Heart, ShoppingCart, BarChart2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/components/product/ProductCard';
import { formatPrice, isNextDayDeliveryAvailable } from '@/lib/utils';
import { useCartStore, useWishlistStore, useCompareStore } from '@/lib/store';
import { toast } from '@/hooks/use-toast';

function toTitle(slug: string) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Product detail view ─────────────────────────────────────────────────────
function ProductView({ productSlug, breadcrumbs }: { productSlug: string; breadcrumbs: { label: string; href: string }[] }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const addToCart = useCartStore((s) => s.addItem);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const { addItem: addToCompare, isInCompare } = useCompareStore();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productSlug],
    queryFn: async () => {
      const res = await fetch(`/api/products/${productSlug}`);
      if (!res.ok) throw new Error('Product not found');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <PackageSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link href="/" className="mt-4 inline-block text-[#003DA5] hover:underline">Back to home</Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);
  const isOutOfStock = product.stock === 0;
  const nextDayAvailable = isNextDayDeliveryAvailable() && product.stock > 0;
  // images is an array of objects {url, alt, ...} from the API
  const images: string[] = product.images?.length > 0
    ? product.images.map((img: any) => (typeof img === 'string' ? img : img.url)).filter(Boolean)
    : product.image
    ? [product.image]
    : [];

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart({ productId: product.id, name: product.name, price: parseFloat(product.price), image: images[0], quantity });
    toast({ title: 'Added to basket', description: `${product.name} has been added to your basket.` });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex flex-wrap items-center gap-1">
        <Link href="/" className="hover:text-[#003DA5]">Home</Link>
        {breadcrumbs.map((bc) => (
          <span key={bc.href} className="flex items-center gap-1">
            <span>/</span>
            <Link href={bc.href} className="hover:text-[#003DA5] capitalize">{bc.label}</Link>
          </span>
        ))}
        <span>/</span>
        <span className="text-gray-900 line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
            <Image
              src={images[selectedImage] || 'https://via.placeholder.com/600'}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            {product.isOnSale && product.salePercentage && (
              <Badge variant="sale" className="absolute top-4 left-4">-{product.salePercentage}%</Badge>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((img: string, i: number) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 ${i === selectedImage ? 'border-[#003DA5]' : 'border-transparent'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>
            {product.brand && <p className="text-gray-500 mt-1">{product.brand}</p>}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-[#003DA5]">{formatPrice(product.price)}</span>
            {product.compareAtPrice && parseFloat(product.compareAtPrice) > parseFloat(product.price) && (
              <span className="text-xl text-gray-400 line-through">{formatPrice(product.compareAtPrice)}</span>
            )}
          </div>
          {product.shortDescription && (
            <p className="text-gray-600">{product.shortDescription}</p>
          )}

          {/* Stock */}
          <div>
            {isOutOfStock ? (
              <Badge variant="secondary" className="text-sm py-1 px-3">Out of Stock</Badge>
            ) : product.stock <= 10 ? (
              <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 text-sm py-1 px-3">Only {product.stock} left</Badge>
            ) : (
              <Badge className="bg-green-100 text-green-700 border-green-200 text-sm py-1 px-3">In Stock</Badge>
            )}
          </div>

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-3">
            <div className="flex items-center border rounded-lg">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-gray-100">−</button>
              <span className="px-4 py-2 font-medium">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-3 py-2 hover:bg-gray-100">+</button>
            </div>
            <Button onClick={handleAddToCart} disabled={isOutOfStock} className="flex-1 bg-[#003DA5] hover:bg-[#002d7a]">
              <ShoppingCart className="w-4 h-4 mr-2" />
              {isOutOfStock ? 'Out of Stock' : 'Add to Basket'}
            </Button>
          </div>

          {/* Wishlist / Compare */}
          <div className="flex gap-3">
            <button onClick={() => { inWishlist ? removeFromWishlist(product.id) : addToWishlist(product.id); toast({ title: inWishlist ? 'Removed from wishlist' : 'Added to wishlist' }); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${inWishlist ? 'bg-red-50 border-red-200 text-red-600' : 'hover:bg-gray-50'}`}>
              <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
              {inWishlist ? 'Saved' : 'Save'}
            </button>
            <button onClick={() => { addToCompare(product.id); toast({ title: 'Added to compare' }); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${inCompare ? 'bg-blue-50 border-blue-200 text-[#003DA5]' : 'hover:bg-gray-50'}`}>
              <BarChart2 className="w-4 h-4" />
              Compare
            </button>
          </div>

          {nextDayAvailable && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
              ✓ Order before 2PM for next day delivery
            </div>
          )}

          {product.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Category / Subcategory listing ──────────────────────────────────────────
function CategoryView({ categorySlug, breadcrumbs }: { categorySlug: string; breadcrumbs: { label: string; href: string }[] }) {
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', 'category', categorySlug, sortBy],
    queryFn: async () => {
      const res = await fetch(`/api/products?category=${categorySlug}&sort=${sortBy}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
  });

  const displayName = toTitle(categorySlug);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-2 flex flex-wrap items-center gap-1">
        <Link href="/" className="hover:text-[#003DA5]">Home</Link>
        {breadcrumbs.map((bc, i) => (
          <span key={bc.href} className="flex items-center gap-1">
            <span>/</span>
            {i < breadcrumbs.length - 1 ? (
              <Link href={bc.href} className="hover:text-[#003DA5] capitalize">{bc.label}</Link>
            ) : (
              <span className="text-gray-900 capitalize">{bc.label}</span>
            )}
          </span>
        ))}
      </nav>

      <h1 className="text-2xl md:text-3xl font-bold mb-1">{displayName}</h1>
      <p className="text-gray-600 mb-6">
        {isLoading ? 'Loading...' : `${products?.length || 0} products`}
      </p>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" />Filters</Button>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
        <div className="flex items-center gap-2 md:ml-auto">
          <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')}><Grid className="w-4 h-4" /></Button>
          <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')}><List className="w-4 h-4" /></Button>
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
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="text-center">
            <PackageSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">No products found</h2>
            <p className="text-gray-500 mb-6">No products in this category yet.</p>
            <Link href="/" className="inline-flex items-center px-5 py-2.5 bg-[#003DA5] text-white rounded-lg hover:bg-[#002d7a]">Back to Home</Link>
          </div>
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

// ─── Smart 2-segment router (subcategory OR product) ────────────────────────
function TwoSegmentView({ catSlug, secondSlug }: { catSlug: string; secondSlug: string }) {
  // Try to load as product first; if that fails show it as a subcategory listing
  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product-or-cat', catSlug, secondSlug],
    queryFn: async () => {
      const res = await fetch(`/api/products/${secondSlug}`);
      if (!res.ok) return null;
      return res.json();
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (product && product.id) {
    // It's a product
    const breadcrumbs = [{ label: toTitle(catSlug), href: `/${catSlug}` }];
    return <ProductView productSlug={secondSlug} breadcrumbs={breadcrumbs} />;
  }

  // It's a subcategory listing
  const breadcrumbs = [
    { label: toTitle(catSlug), href: `/${catSlug}` },
    { label: toTitle(secondSlug), href: `/${catSlug}/${secondSlug}` },
  ];
  return <CategoryView categorySlug={secondSlug} breadcrumbs={breadcrumbs} />;
}

// ─── Main catch-all router ───────────────────────────────────────────────────
export default function SlugCatchAll() {
  const params = useParams();
  const slugArr = Array.isArray(params.slug) ? params.slug : [params.slug];

  if (slugArr.length >= 3) {
    // /{cat}/{subcat}/{product-slug} → product page
    const productSlug = slugArr[slugArr.length - 1];
    const breadcrumbs = slugArr.slice(0, -1).map((s, i) => ({
      label: toTitle(s),
      href: '/' + slugArr.slice(0, i + 1).join('/'),
    }));
    return <ProductView productSlug={productSlug} breadcrumbs={breadcrumbs} />;
  }

  if (slugArr.length === 2) {
    // /{cat}/{slug} → could be subcategory listing OR product; detect via API
    return <TwoSegmentView catSlug={slugArr[0]} secondSlug={slugArr[1]} />;
  }

  // /{cat} → category listing
  const catSlug = slugArr[0];
  const breadcrumbs = [{ label: toTitle(catSlug), href: `/${catSlug}` }];
  return <CategoryView categorySlug={catSlug} breadcrumbs={breadcrumbs} />;
}
