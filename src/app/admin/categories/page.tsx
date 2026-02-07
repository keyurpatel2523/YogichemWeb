'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, FolderTree, X, ChevronRight } from 'lucide-react';
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
  createdAt: string;
  productCount: number;
}

interface CategoryForm {
  name: string;
  slug: string;
  description: string;
  image: string;
  parentId: number | null;
  sortOrder: number;
  isActive: boolean;
}

const emptyForm: CategoryForm = {
  name: '',
  slug: '',
  description: '',
  image: '',
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

export default function AdminCategoriesPage() {
  const { token } = useAdminStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['admin', 'categories'],
    queryFn: async () => {
      const res = await fetch('/api/admin/categories', { headers });
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CategoryForm) => {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create category');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      toast({ title: 'Category created successfully' });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: CategoryForm & { id: number }) => {
      const res = await fetch('/api/admin/categories', {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update category');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      toast({ title: 'Category updated successfully' });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/categories?id=${id}`, {
        method: 'DELETE',
        headers,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete category');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      toast({ title: 'Category deleted successfully' });
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

  function handleEdit(category: Category) {
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image: category.image || '',
      parentId: category.parentId,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    });
    setEditingId(category.id);
    setShowForm(true);
  }

  function handleAddSubcategory(parentId: number) {
    setForm({ ...emptyForm, parentId });
    setEditingId(null);
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.slug) {
      toast({ title: 'Error', description: 'Name and slug are required', variant: 'destructive' });
      return;
    }
    if (editingId) {
      updateMutation.mutate({ ...form, id: editingId });
    } else {
      createMutation.mutate(form);
    }
  }

  const parentCategories = categories.filter((c) => !c.parentId);
  const getParentName = (parentId: number | null) => {
    if (!parentId) return null;
    const parent = categories.find((c) => c.id === parentId);
    return parent?.name || null;
  };

  const sortedCategories = [...categories].sort((a, b) => {
    if (a.parentId === null && b.parentId !== null) return -1;
    if (a.parentId !== null && b.parentId === null) return 1;
    if (a.parentId === null && b.parentId === null) return a.sortOrder - b.sortOrder;
    if (a.parentId === b.parentId) return a.sortOrder - b.sortOrder;
    const parentA = a.parentId ?? a.id;
    const parentB = b.parentId ?? b.id;
    return parentA - parentB;
  });

  const orderedCategories: Category[] = [];
  const parents = sortedCategories.filter((c) => !c.parentId);
  parents.forEach((parent) => {
    orderedCategories.push(parent);
    const children = sortedCategories.filter((c) => c.parentId === parent.id);
    orderedCategories.push(...children);
  });
  const orphanChildren = sortedCategories.filter(
    (c) => c.parentId && !parents.find((p) => p.id === c.parentId)
  );
  orderedCategories.push(...orphanChildren);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FolderTree className="w-6 h-6" />
            Categories
          </h1>
          <p className="text-gray-600">Manage product categories and subcategories</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{editingId ? 'Edit Category' : 'Add Category'}</CardTitle>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="w-4 h-4" />
              </Button>
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
                    placeholder="Category name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Slug *</label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="category-slug"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Parent Category</label>
                  <select
                    value={form.parentId ?? ''}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        parentId: e.target.value ? parseInt(e.target.value) : null,
                      }))
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="">None (Top Level)</option>
                    {parentCategories
                      .filter((c) => c.id !== editingId)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Image URL</label>
                  <Input
                    value={form.image}
                    onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sort Order</label>
                  <Input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))
                    }
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">
                    Active
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Category description..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm min-h-[80px]"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : editingId
                    ? 'Update Category'
                    : 'Create Category'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Categories ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading categories...</p>
          ) : categories.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No categories yet. Add your first category above.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Slug</th>
                    <th className="text-left py-3 px-4">Parent</th>
                    <th className="text-left py-3 px-4">Products</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orderedCategories.map((category) => {
                    const parentName = getParentName(category.parentId);
                    return (
                      <tr key={category.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            {category.parentId && (
                              <ChevronRight className="w-4 h-4 text-gray-400 ml-4" />
                            )}
                            <span className={category.parentId ? 'text-gray-700' : 'font-medium'}>
                              {category.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">{category.slug}</td>
                        <td className="py-3 px-4">
                          {parentName ? (
                            <Badge variant="secondary">{parentName}</Badge>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">{category.productCount}</td>
                        <td className="py-3 px-4">
                          <Badge variant={category.isActive ? 'default' : 'secondary'}>
                            {category.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            {!category.parentId && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAddSubcategory(category.id)}
                                title="Add Subcategory"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(category)}
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {deleteConfirmId === category.id ? (
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 text-xs"
                                  onClick={() => deleteMutation.mutate(category.id)}
                                  disabled={deleteMutation.isPending}
                                >
                                  Confirm
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => setDeleteConfirmId(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500"
                                onClick={() => setDeleteConfirmId(category.id)}
                                title="Delete"
                              >
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
