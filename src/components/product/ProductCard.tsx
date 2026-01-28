'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { useCartStore, useWishlistStore, useCompareStore } from '@/lib/store';
import { toast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    slug: string;
    price: string;
    compareAtPrice?: string | null;
    image: string;
    stock: number;
    isOnSale?: boolean;
    salePercentage?: number | null;
    isFeatured?: boolean;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addItem);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const { addItem: addToCompare, removeItem: removeFromCompare, isInCompare, items: compareItems } = useCompareStore();

  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;
    
    addToCart({
      productId: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image: product.image,
      quantity: 1,
    });
    toast({
      title: 'Added to basket',
      description: `${product.name} has been added to your basket.`,
    });
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inWishlist) {
      removeFromWishlist(product.id);
      toast({ title: 'Removed from wishlist' });
    } else {
      addToWishlist(product.id);
      toast({ title: 'Added to wishlist' });
    }
  };

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inCompare) {
      removeFromCompare(product.id);
      toast({ title: 'Removed from compare' });
    } else if (compareItems.length >= 4) {
      toast({ title: 'Compare limit reached', description: 'You can compare up to 4 products.' });
    } else {
      addToCompare(product.id);
      toast({ title: 'Added to compare' });
    }
  };

  return (
    <Link href={`/product/${product.slug}`}>
      <Card className="group h-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={product.image || '/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            draggable={false}
          />
          
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isOnSale && product.salePercentage && (
              <Badge variant="sale">-{product.salePercentage}%</Badge>
            )}
            {product.isFeatured && (
              <Badge variant="default">Featured</Badge>
            )}
            {isOutOfStock && (
              <Badge variant="secondary">Out of Stock</Badge>
            )}
          </div>

          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleWishlistToggle}
              className={`p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors ${
                inWishlist ? 'text-boots-red' : 'text-gray-600'
              }`}
            >
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleCompareToggle}
              className={`p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors ${
                inCompare ? 'text-boots-blue' : 'text-gray-600'
              }`}
            >
              <BarChart2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-boots-blue transition-colors">
            {product.name}
          </h3>
          
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-boots-blue">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && parseFloat(product.compareAtPrice) > parseFloat(product.price) && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-full"
            size="sm"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {isOutOfStock ? 'Out of Stock' : 'Add to Basket'}
          </Button>
        </div>
      </Card>
    </Link>
  );
}
