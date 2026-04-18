'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Layers, X, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAdminStore } from '@/lib/admin-store';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: number | null;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
}

interface SubForm {
  name: string;
  slug: string;
  description: string;
  parentId: number | null;
  sortOrder: number;
  isActive: boolean;
}

const emptyForm: SubForm = {
  name: '',
  slug: '',
  description: '',
  parentId: null,
  sortOrder: 0,
  isActive: true,
};

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function AdminSubcategoriesPage() {
  const { token } = useAdminStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<SubForm>(emptyForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const { data: allCategories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['admin', 'categories'],
    queryFn: async () => {
      const res = await fetch('/api/admin/categories', { headers });
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
  });

  const parentCategories = allCategories.filter((c) => !c.parentId);
  const subcategories = allCategories.filter((c) => c.parentId !== null);

  const getParentName = (parentId: number | null) => {
    if (!parentId) return null;
    return parentCategories.find((c) => c.id === parentId)?.name || null;
  };

  const createMutation = useMutation({
    mutationFn: async (data: SubForm) => {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...data, image: '' }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to create'); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      toast({ title: 'Subcategory created successfully' });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: SubForm & { id: number }) => {
      const res = await fetch('/api/admin/categories', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ ...data, image: '' }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to update'); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      toast({ title: 'Subcategory updated successfully' });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE', headers });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to delete'); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      toast({ title: 'Subcategory deleted successfully' });
      setDeleteConfirmId(null);
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setDeleteConfirmId(null);
    },
  });

  function resetForm() {
    setForm(emptyForm);
    setShowForm(false);
    setEditingId(null);
  }

  function handleNameChange(name: string) {
    setForm((prev) => ({
      ...prev,
      name,
      slug: editingId ? prev.slug : generateSlug(name),
    }));
  }

  function handleEdit(sub: Category) {
    setForm({
      name: sub.name,
      slug: sub.slug,
      description: sub.description || '',
      parentId: sub.parentId,
      sortOrder: sub.sortOrder,
      isActive: sub.isActive,
    });
    setEditingId(sub.id);
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.slug) {
      toast({ title: 'Error', description: 'Name and slug are required', variant: 'destructive' });
      return;
    }
    if (!form.parentId) {
      toast({ title: 'Error', description: 'Please select a parent category', variant: 'destructive' });
      return;
    }
    if (editingId) {
      updateMutation.mutate({ ...form, id: editingId });
    } else {
      createMutation.mutate(form);
    }
  }

  const inputClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003DA5]';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Layers className="w-6 h-6" />
            Subcategories
          </h1>
          <p className="text-gray-600">Manage subcategories and link them to parent categories</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="bg-[#003DA5] hover:bg-[#002d7a]">
          <Plus className="w-4 h-4 mr-2" />
          Add Subcategory
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{editingId ? 'Edit Subcategory' : 'Add Subcategory'}</CardTitle>
              <Button variant="ghost" size="icon" onClick={resetForm}><X className="w-4 h-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <Input
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Skincare"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Slug *</label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="e.g. skincare"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Parent Category *</label>
                  <select
                    value={form.parentId ?? ''}
                    onChange={(e) => setForm((prev) => ({
                      ...prev,
                      parentId: e.target.value ? parseInt(e.target.value) : null,
                    }))}
                    className={inputClass}
                    required
                  >
                    <option value="">— Select parent category —</option>
                    {parentCategories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {form.parentId && (
                    <p className="text-xs text-[#003DA5] mt-1">
                      📂 {getParentName(form.parentId)} <ChevronRight className="w-3 h-3 inline" /> {form.name || '…'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sort Order</label>
                  <Input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Subcategory description..."
                    className={`${inputClass} min-h-[80px] resize-none`}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded accent-[#003DA5]"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">Active</label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-[#003DA5] hover:bg-[#002d7a]" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : editingId ? 'Update Subcategory' : 'Create Subcategory'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle>All Subcategories ({subcategories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-gray-500">Loading...</p>
          ) : subcategories.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Layers className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="font-medium">No subcategories yet</p>
              <p className="text-sm text-gray-400 mb-4">Add a subcategory and link it to a parent category</p>
              <Button onClick={() => { resetForm(); setShowForm(true); }} className="bg-[#003DA5] hover:bg-[#002d7a]">
                <Plus className="w-4 h-4 mr-2" />Add Subcategory
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Slug</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Parent Category</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Products</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subcategories.map((sub) => {
                    const parentName = getParentName(sub.parentId);
                    return (
                      <tr key={sub.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-gray-900">{sub.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-500">{sub.slug}</td>
                        <td className="py-3 px-4">
                          {parentName ? (
                            <Badge variant="secondary">{parentName}</Badge>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm">{sub.productCount ?? 0}</td>
                        <td className="py-3 px-4">
                          <Badge variant={sub.isActive ? 'default' : 'secondary'}>
                            {sub.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(sub)} title="Edit">
                              <Edit className="w-4 h-4" />
                            </Button>
                            {deleteConfirmId === sub.id ? (
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" className="text-red-600 text-xs"
                                  onClick={() => deleteMutation.mutate(sub.id)} disabled={deleteMutation.isPending}>
                                  Confirm
                                </Button>
                                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setDeleteConfirmId(null)}>
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button variant="ghost" size="icon" className="text-red-500"
                                onClick={() => setDeleteConfirmId(sub.id)} title="Delete">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
