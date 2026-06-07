'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { categoryApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function SellerCategoriesPage() {
  const { hasPermission } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', parentId: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchCategories = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await categoryApi.getAll();
      setCategories(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load categories');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError(''); setFormLoading(true);
    try {
      await categoryApi.create({
        ...form,
        parentId: form.parentId || null
      });
      setShowCreate(false);
      setForm({ name: '', description: '', parentId: '' });
      fetchCategories();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create category');
    } finally { setFormLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await categoryApi.delete(id);
      fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Categories</h2><p className="text-muted-foreground">Manage clothing categories and collections</p></div>
        {hasPermission('MANAGE_CATEGORIES') && (
          <Button onClick={() => setShowCreate(!showCreate)}>+ Add Category</Button>
        )}
      </div>
      {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

      {showCreate && (
        <Card className="border-primary/20">
          <CardHeader><CardTitle className="text-lg">Add New Category</CardTitle></CardHeader>
          <CardContent>
            {formError && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm mb-4">{formError}</div>}
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Category Name*</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="space-y-2">
                <Label>Parent Category</Label>
                <select value={form.parentId} onChange={e => setForm({ ...form, parentId: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">None (Root Category)</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="col-span-full space-y-2"><Label>Description</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div className="col-span-full flex gap-3">
                <Button type="submit" disabled={formLoading}>{formLoading ? 'Creating...' : 'Create Category'}</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}</div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground"><p className="text-lg">No categories found</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Category Name</th>
                  <th className="px-4 py-3 text-left font-medium">Description</th>
                  <th className="px-4 py-3 text-left font-medium">Parent Category</th>
                  <th className="px-4 py-3 text-left font-medium">Product Count</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr></thead>
                <tbody>{categories.map(c => (
                  <tr key={c.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.description || '-'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.parentName || '-'}</td>
                    <td className="px-4 py-3"><span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{c.productCount || 0}</span></td>
                    <td className="px-4 py-3 text-right">
                      {hasPermission('MANAGE_CATEGORIES') && (
                        <Button variant="outline" size="sm" onClick={() => handleDelete(c.id)} className="text-xs bg-destructive/10 text-destructive hover:bg-destructive/20 border-0 h-8">Delete</Button>
                      )}
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
