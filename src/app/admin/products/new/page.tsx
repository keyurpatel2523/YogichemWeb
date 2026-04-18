'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminStore } from '@/lib/admin-store';
import { toast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/admin/ImageUpload';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

export default function AdminAddProductPage() {
  const router = useRouter();
  const { token } = useAdminStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
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

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => {});

    fetch('/api/admin/suppliers', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => setSuppliersList(Array.isArray(data) ? data.filter((s: any) => s.isActive) : []))
      .catch(() => {});
  }, [token]);

  const handleNameChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: generateSlug(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
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
        imageUrl: form.imageUrl || null,
        tags: form.tags ? form.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : null,
        // Supplier
        supplierId: form.supplierId || null,
        supplierSku: form.supplierSku || null,
        supplierCost: form.supplierCost || null,
        supplierLeadTimeDays: form.supplierLeadTimeDays || null,
        supplierMinOrderQty: form.supplierMinOrderQty || '1',
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create product');
      }

      toast({ title: 'Product created successfully' });
      router.push('/admin/products');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectClass = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';
  const textareaClass = 'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Products
          </Link>
          <h1 className="text-2xl font-bold">Add New Product</h1>
        </div>
        <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-[#003DA5] hover:bg-[#002d7a]">
          {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Create Product
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic Information */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name <span className="text-red-500">*</span></label>
                <Input value={form.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Product name" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug <span className="text-red-500">*</span></label>
                <Input value={form.slug} onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))} placeholder="product-slug" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
              <textarea value={form.shortDescription} onChange={(e) => setForm((prev) => ({ ...prev, shortDescription: e.target.value }))} placeholder="Brief product description" rows={2} className={textareaClass} />
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
                <select value={form.categoryId} onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))} className={selectClass}>
                  <option value="">No category</option>
                  {categories?.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <ImageUpload value={form.imageUrl} onChange={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
              <Input value={form.tags} onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))} placeholder="tag1, tag2, tag3" />
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Pricing</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price <span className="text-red-500">*</span></label>
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
                {' '}— You can manage all suppliers at <Link href="/admin/suppliers" className="underline">Admin → Suppliers</Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Status & Visibility</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-6">
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
            </div>
            {form.isOnSale && (
              <div className="max-w-xs">
                <label className="block text-sm font-medium text-gray-700 mb-1">Sale Percentage (%)</label>
                <Input type="number" min="0" max="100" value={form.salePercentage} onChange={(e) => setForm((prev) => ({ ...prev, salePercentage: e.target.value }))} placeholder="0" />
              </div>
            )}
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
          </CardContent>
        </Card>

      </form>
    </div>
  );
}
