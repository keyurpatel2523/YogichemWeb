'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Eye, Loader2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { useAdminStore } from '@/lib/admin-store';
import { useToast } from '@/hooks/use-toast';

export default function AdminProductsPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { token } = useAdminStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: async () => {
      const res = await fetch('/api/admin/products', { headers: authHeaders });
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Failed to delete'); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast({ title: 'Product deleted successfully' });
      setDeleteId(null);
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      setDeleteId(null);
    },
  });

  // Only parent categories for filter dropdown
  const parentCategories = categories.filter((c: any) => !c.parentId);

  const filteredProducts = products?.filter((p: any) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(search.toLowerCase());
    if (!categoryFilter) return matchSearch;
    // Match by parent or sub category id
    if (!p.categoryId) return false;
    const cat = categories.find((c: any) => c.id === p.categoryId);
    if (!cat) return false;
    const parentId = cat.parentId ?? cat.id;
    return matchSearch && String(parentId) === categoryFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-gray-600">Manage your product catalog ({products?.length || 0} products)</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="bg-[#003DA5] hover:bg-[#002d7a]">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#003DA5] min-w-[180px]"
            >
              <option value="">All Categories</option>
              {parentCategories.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Loading products...</span>
            </div>
          ) : filteredProducts?.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {search || categoryFilter ? 'No products match your filters.' : 'No products found. Add your first product!'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Product</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Category</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Price</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Stock</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts?.map((product: any) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                      {/* Product cell */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="object-cover w-full h-full" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium line-clamp-1 text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-400">{product.sku || product.slug}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category breadcrumb */}
                      <td className="py-3 px-4">
                        {product.categoryName ? (
                          <div className="flex items-center gap-1 text-sm">
                            {product.parentCategoryName ? (
                              <>
                                <span className="text-gray-400 text-xs">{product.parentCategoryName}</span>
                                <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                <span className="text-[#003DA5] font-medium text-xs px-2 py-0.5 bg-blue-50 rounded-full">
                                  {product.categoryName}
                                </span>
                              </>
                            ) : (
                              <span className="text-gray-600 text-xs px-2 py-0.5 bg-gray-100 rounded-full font-medium">
                                {product.categoryName}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900">{formatPrice(product.price)}</span>
                        {product.compareAtPrice && (
                          <span className="text-xs text-gray-400 line-through ml-2">
                            {formatPrice(product.compareAtPrice)}
                          </span>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4">
                        <span className={`font-medium text-sm ${product.stock === 0 ? 'text-red-600' : product.stock < 10 ? 'text-orange-500' : 'text-gray-700'}`}>
                          {product.stock}
                        </span>
                      </td>

                      {/* Status badges */}
                      <td className="py-3 px-4">
                        <div className="flex gap-1 flex-wrap">
                          {product.isActive === false && <Badge variant="secondary">Inactive</Badge>}
                          {product.isOnSale && <Badge variant="destructive">Sale</Badge>}
                          {product.isFeatured && <Badge className="bg-[#003DA5]">Featured</Badge>}
                          {product.stock === 0 && <Badge variant="outline">Out of Stock</Badge>}
                          {product.isActive !== false && !product.isOnSale && !product.isFeatured && product.stock > 0 && (
                            <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/product/${product.slug}`} target="_blank">
                            <Button variant="ghost" size="icon" title="View on store">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/products/${product.id}`}>
                            <Button variant="ghost" size="icon" title="Edit product">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          {deleteId === product.id ? (
                            <div className="flex items-center gap-1">
                              <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(product.id)} disabled={deleteMutation.isPending}>
                                {deleteMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Yes'}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setDeleteId(null)}>No</Button>
                            </div>
                          ) : (
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => setDeleteId(product.id)} title="Delete product">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirm dialog */}
      {deleteId && !filteredProducts?.find((p: any) => p.id === deleteId && deleteMutation.isPending) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Product?</h3>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
