'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Trash2, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdminStore } from '@/lib/admin-store';
import { toast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { CategoryCascadeSelect } from '@/components/admin/CategoryCascadeSelect';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

export default function AdminProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { token } = useAdminStore();
  const productId = params.id as string;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [suppliersList, setSuppliersList] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    sku: '',
    price: '',
    compareAtPrice: '',
    costPrice: '',
    wholesalePrice: '',
    categoryId: '',
    stock: '0',
    lowStockThreshold: '10',
    isActive: true,
    isFeatured: false,
    isOnSale: false,
    salePercentage: '',
    metaTitle: '',
    metaDescription: '',
    imageUrl: '',
    tags: '',
    // Supplier
    supplierId: '',
    supplierSku: '',
    supplierCost: '',
    supplierLeadTimeDays: '',
    supplierMinOrderQty: '1',
  });

  const { data: product, isLoading } = useQuery({
    queryKey: ['admin', 'product', productId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch product');
      return res.json();
    },
    enabled: !!token && !!productId,
  });

  // Fetch active suppliers
  useEffect(() => {
    if (!token) return;
    fetch('/api/admin/suppliers', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setSuppliersList(Array.isArray(data) ? data.filter((s: any) => s.isActive) : []))
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (product) {
      const sl = product.supplierLink;
      setForm({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        sku: product.sku || '',
        price: product.price || '',
        compareAtPrice: product.compareAtPrice || '',
        costPrice: product.costPrice || '',
        wholesalePrice: product.wholesalePrice || '',
        categoryId: product.categoryId ? String(product.categoryId) : '',
        stock: String(product.stock ?? 0),
        lowStockThreshold: String(product.lowStockThreshold ?? 10),
        isActive: product.isActive ?? true,
        isFeatured: product.isFeatured ?? false,
        isOnSale: product.isOnSale ?? false,
        salePercentage: product.salePercentage ? String(product.salePercentage) : '',
        metaTitle: product.metaTitle || '',
        metaDescription: product.metaDescription || '',
        imageUrl: product.images?.[0]?.url || '',
        tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
        // Pre-fill supplier
        supplierId: sl?.supplierId ? String(sl.supplierId) : '',
        supplierSku: sl?.supplierSku || '',
        supplierCost: sl?.cost || '',
        supplierLeadTimeDays: sl?.leadTimeDays ? String(sl.leadTimeDays) : '',
        supplierMinOrderQty: sl?.minOrderQuantity ? String(sl.minOrderQuantity) : '1',
      });
    }
  }, [product]);

  const updateMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: parseInt(productId), ...data }),
      });
      if (!res.ok) throw new Error('Failed to update product');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Product updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['admin', 'product', productId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/products?id=${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete product');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Product deleted successfully' });
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      router.push('/admin/products');
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Record<string, any> = {
      name: form.name,
      slug: form.slug,
      description: form.description || null,
      shortDescription: form.shortDescription || null,
      sku: form.sku || null,
      price: form.price,
      compareAtPrice: form.compareAtPrice || null,
      costPrice: form.costPrice || null,
      wholesalePrice: form.wholesalePrice || null,
      categoryId: form.categoryId ? parseInt(form.categoryId) : null,
      stock: parseInt(form.stock) || 0,
      lowStockThreshold: parseInt(form.lowStockThreshold) || 10,
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      isOnSale: form.isOnSale,
      salePercentage: form.salePercentage ? parseInt(form.salePercentage) : null,
      metaTitle: form.metaTitle || null,
      metaDescription: form.metaDescription || null,
      tags: form.tags ? form.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : null,
      imageUrl: form.imageUrl || null,
      // Supplier
      supplierId: form.supplierId || null,
      supplierSku: form.supplierSku || null,
      supplierCost: form.supplierCost || null,
      supplierLeadTimeDays: form.supplierLeadTimeDays || null,
      supplierMinOrderQty: form.supplierMinOrderQty || '1',
    };
    updateMutation.mutate(data);
  };

  const handleNameChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: generateSlug(value),
    }));
  };

  const selectClass = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';
  const textareaClass = 'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!product && !isLoading) {
    return (
      <div className="space-y-6">
        <Link href="/admin/products" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Products
        </Link>
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-500">Product not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Products
          </Link>
          <h1 className="text-2xl font-bold">Edit Product</h1>
          {product?.isActive ? <Badge>Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
          {form.supplierId && (
            <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50 flex items-center gap-1">
              <Truck className="w-3 h-3" />
              {suppliersList.find((s: any) => String(s.id) === form.supplierId)?.name || 'Supplier linked'}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)} disabled={deleteMutation.isPending}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <Button onClick={handleSubmit} disabled={updateMutation.isPending} className="bg-[#003DA5] hover:bg-[#002d7a]">
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>

      {showDeleteConfirm && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center justify-between">
            <p className="text-red-800 font-medium">
              Are you sure you want to delete &quot;{product?.name}&quot;? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Confirm Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic Information */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <Input value={form.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Product name" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <Input value={form.slug} onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))} placeholder="product-slug" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
              <Input value={form.shortDescription} onChange={(e) => setForm((prev) => ({ ...prev, shortDescription: e.target.value }))} placeholder="Brief product description" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
              <textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Detailed product description" rows={4} className={textareaClass} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <Input value={form.sku} onChange={(e) => setForm((prev) => ({ ...prev, sku: e.target.value }))} placeholder="SKU-001" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <CategoryCascadeSelect
                  value={form.categoryId}
                  onChange={(id) => setForm((prev) => ({ ...prev, categoryId: id }))}
                  selectClass={selectClass}
                />
              </div>
            </div>
            <ImageUpload value={form.imageUrl} onChange={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))} />
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Pricing</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price</label>
                <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} placeholder="0.00" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Compare at Price</label>
                <Input type="number" step="0.01" value={form.compareAtPrice} onChange={(e) => setForm((prev) => ({ ...prev, compareAtPrice: e.target.value }))} placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price</label>
                <Input type="number" step="0.01" value={form.costPrice} onChange={(e) => setForm((prev) => ({ ...prev, costPrice: e.target.value }))} placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Wholesale Price</label>
                <Input type="number" step="0.01" value={form.wholesalePrice} onChange={(e) => setForm((prev) => ({ ...prev, wholesalePrice: e.target.value }))} placeholder="0.00" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Inventory</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                <Input type="number" value={form.stock} onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))} placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
                <Input type="number" value={form.lowStockThreshold} onChange={(e) => setForm((prev) => ({ ...prev, lowStockThreshold: e.target.value }))} placeholder="10" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Supplier */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#003DA5]" />
              Supplier
              {product?.supplierLink && (
                <Badge variant="outline" className="ml-2 border-green-300 text-green-700 bg-green-50 text-xs">Linked</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <select
                  value={form.supplierId}
                  onChange={(e) => setForm((prev) => ({ ...prev, supplierId: e.target.value }))}
                  className={selectClass}
                >
                  <option value="">— No supplier linked —</option>
                  {suppliersList.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name}{s.contactPerson ? ` (${s.contactPerson})` : ''}
                    </option>
                  ))}
                </select>
                {suppliersList.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    No active suppliers yet. <Link href="/admin/suppliers" className="text-[#003DA5] underline">Add a supplier first.</Link>
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier SKU</label>
                <Input
                  value={form.supplierSku}
                  onChange={(e) => setForm((prev) => ({ ...prev, supplierSku: e.target.value }))}
                  placeholder="Supplier's product code"
                  disabled={!form.supplierId}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Cost (£)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.supplierCost}
                  onChange={(e) => setForm((prev) => ({ ...prev, supplierCost: e.target.value }))}
                  placeholder="0.00"
                  disabled={!form.supplierId}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lead Time (days)</label>
                <Input
                  type="number"
                  value={form.supplierLeadTimeDays}
                  onChange={(e) => setForm((prev) => ({ ...prev, supplierLeadTimeDays: e.target.value }))}
                  placeholder="e.g. 7"
                  disabled={!form.supplierId}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min. Order Quantity</label>
                <Input
                  type="number"
                  value={form.supplierMinOrderQty}
                  onChange={(e) => setForm((prev) => ({ ...prev, supplierMinOrderQty: e.target.value }))}
                  placeholder="1"
                  disabled={!form.supplierId}
                />
              </div>
            </div>
            {form.supplierId && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                Linked to: <strong>{suppliersList.find((s: any) => String(s.id) === form.supplierId)?.name}</strong>
                {' '}— Manage all suppliers at <Link href="/admin/suppliers" className="underline">Admin → Suppliers</Link>
              </div>
            )}
            {!form.supplierId && product?.supplierLink && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
                Supplier link will be removed when you save. Select a supplier above to keep a link.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Status & Visibility</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))} className="rounded border-gray-300" />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((prev) => ({ ...prev, isFeatured: e.target.checked }))} className="rounded border-gray-300" />
                <span className="text-sm font-medium text-gray-700">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isOnSale} onChange={(e) => setForm((prev) => ({ ...prev, isOnSale: e.target.checked }))} className="rounded border-gray-300" />
                <span className="text-sm font-medium text-gray-700">On Sale</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sale Percentage (%)</label>
                <Input type="number" value={form.salePercentage} onChange={(e) => setForm((prev) => ({ ...prev, salePercentage: e.target.value }))} placeholder="0" disabled={!form.isOnSale} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SEO */}
        <Card>
          <CardHeader><CardTitle className="text-lg">SEO</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
              <Input value={form.metaTitle} onChange={(e) => setForm((prev) => ({ ...prev, metaTitle: e.target.value }))} placeholder="SEO title" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
              <textarea value={form.metaDescription} onChange={(e) => setForm((prev) => ({ ...prev, metaDescription: e.target.value }))} placeholder="SEO description" rows={3} className={textareaClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
              <Input value={form.tags} onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))} placeholder="tag1, tag2, tag3" />
            </div>
          </CardContent>
        </Card>

      </form>
    </div>
  );
}
