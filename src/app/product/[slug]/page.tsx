'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Image from 'next/image';
import { Heart, ShoppingCart, Minus, Plus, Truck, Package, Bell, BarChart2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice, isNextDayDeliveryAvailable } from '@/lib/utils';
import { useCartStore, useWishlistStore, useCompareStore } from '@/lib/store';
import { toast } from '@/hooks/use-toast';

export default function ProductPage({ params }: { params: { slug: string } }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', params.slug],
    queryFn: async () => {
      const res = await fetch(`/api/products/${params.slug}`);
      if (!res.ok) throw new Error('Product not found');
      return res.json();
    },
  });

  const addToCart = useCartStore((state) => state.addItem);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const { addItem: addToCompare, isInCompare } = useCompareStore();

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
        <h1 className="text-2xl font-bold">Product not found</h1>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);
  const isOutOfStock = product.stock === 0;
  const nextDayAvailable = isNextDayDeliveryAvailable() && product.stock > 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart({
      productId: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image: product.images?.[0]?.url || '/placeholder.jpg',
      quantity,
    });
    toast({
      title: 'Added to basket',
      description: `${product.name} x ${quantity} has been added.`,
    });
  };

  const handleNotifyMe = async () => {
    toast({
      title: 'Notification set',
      description: "We'll notify you when this product is back in stock.",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={product.images?.[selectedImage]?.url || '/placeholder.jpg'}
              alt={product.name}
              fill
              className="object-cover"
              priority
              draggable={false}
            />
            {product.isOnSale && product.salePercentage && (
              <Badge variant="sale" className="absolute top-4 left-4 text-lg px-3 py-1">
                -{product.salePercentage}%
              </Badge>
            )}
          </div>
          
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === i ? 'border-boots-blue' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={`${product.name} ${i + 1}`}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                    draggable={false}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            {product.category && (
              <p className="text-sm text-gray-500 mb-2">{product.category.name}</p>
            )}
            <h1 className="text-2xl md:text-3xl font-bold mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl font-bold text-boots-blue">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && parseFloat(product.compareAtPrice) > parseFloat(product.price) && (
                <span className="text-xl text-gray-500 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            <p className="text-gray-600">{product.description}</p>
          </div>

          <div className="flex items-center gap-2">
            {isOutOfStock ? (
              <Badge variant="destructive">Out of Stock</Badge>
            ) : product.stock < 10 ? (
              <Badge variant="warning">Only {product.stock} left</Badge>
            ) : (
              <Badge variant="success">In Stock</Badge>
            )}
          </div>

          {!isOutOfStock && (
            <div className="flex items-center gap-4">
              <span className="font-medium">Quantity:</span>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2 hover:bg-gray-100"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {isOutOfStock ? (
              <Button onClick={handleNotifyMe} className="flex-1" size="lg">
                <Bell className="w-5 h-5 mr-2" />
                Notify When Available
              </Button>
            ) : (
              <Button onClick={handleAddToCart} className="flex-1" size="lg">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Basket
              </Button>
            )}
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                if (inWishlist) {
                  removeFromWishlist(product.id);
                  toast({ title: 'Removed from wishlist' });
                } else {
                  addToWishlist(product.id);
                  toast({ title: 'Added to wishlist' });
                }
              }}
              className={inWishlist ? 'text-boots-red' : ''}
            >
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                addToCompare(product.id);
                toast({ title: inCompare ? 'Already in compare' : 'Added to compare' });
              }}
              className={inCompare ? 'text-boots-blue' : ''}
            >
              <BarChart2 className="w-5 h-5" />
            </Button>
          </div>

          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Truck className="w-5 h-5 text-boots-blue mt-0.5" />
              <div>
                <p className="font-medium">Delivery</p>
                {nextDayAvailable ? (
                  <p className="text-sm text-green-600">Order before 2PM for next day delivery</p>
                ) : (
                  <p className="text-sm text-gray-600">Standard delivery 3-5 business days</p>
                )}
                <p className="text-sm text-gray-600">FREE delivery on orders over £25</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-boots-blue mt-0.5" />
              <div>
                <p className="font-medium">Click & Collect</p>
                <p className="text-sm text-gray-600">FREE on orders over £15</p>
              </div>
            </div>
          </div>

          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="border-t pt-6">
              <h3 className="font-bold mb-4">Product Details</h3>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-gray-500">{key}</dt>
                    <dd className="font-medium">{value as string}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
