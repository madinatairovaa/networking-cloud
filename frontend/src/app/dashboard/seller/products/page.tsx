'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { productApi, categoryApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function SellerProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', sku: '', price: '', wholesalePrice: '', minOrderQuantity: '1', size: '', color: '', material: '', brand: '', categoryId: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchProducts = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true); setError('');
    try {
      const res = await productApi.getBySeller(user.id, page);
      setProducts(res.data.data.content || []);
      setTotalPages(res.data.data.totalPages || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally { setLoading(false); }
  }, [page, user?.id]);

  useEffect(() => {
    fetchProducts();
    categoryApi.getAll().then(r => setCategories(r.data.data || [])).catch(() => {});
  }, [fetchProducts]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError(''); setFormLoading(true);
    try {
      await productApi.create({
        ...form,
        price: parseFloat(form.price),
        wholesalePrice: form.wholesalePrice ? parseFloat(form.wholesalePrice) : null,
        minOrderQuantity: parseInt(form.minOrderQuantity),
        categoryId: form.categoryId || null
      });
      setShowCreate(false);
      setForm({ name: '', description: '', sku: '', price: '', wholesalePrice: '', minOrderQuantity: '1', size: '', color: '', material: '', brand: '', categoryId: '' });
      fetchProducts();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create product');
    } finally { setFormLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productApi.delete(id);
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const sc: Record<string, string> = { ACTIVE: 'bg-green-500/10 text-green-500', INACTIVE: 'bg-gray-500/10 text-gray-500', DRAFT: 'bg-amber-500/10 text-amber-500' };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">My Products</h2><p className="text-muted-foreground">Manage your wholesale catalog</p></div>
        <Button onClick={() => setShowCreate(!showCreate)}>+ Add Product</Button>
      </div>
      {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

      {showCreate && (
        <Card className="border-primary/20">
          <CardHeader><CardTitle className="text-lg">Add New Product</CardTitle></CardHeader>
          <CardContent>
            {formError && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm mb-4">{formError}</div>}
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Name*</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="space-y-2"><Label>SKU*</Label><Input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Price*</Label><Input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Wholesale Price</Label><Input type="number" step="0.01" value={form.wholesalePrice} onChange={e => setForm({ ...form, wholesalePrice: e.target.value })} /></div>
              <div className="space-y-2"><Label>Min Order Qty</Label><Input type="number" value={form.minOrderQuantity} onChange={e => setForm({ ...form, minOrderQuantity: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>Category</Label>
                <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">None</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2"><Label>Size</Label><Input value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} /></div>
              <div className="space-y-2"><Label>Color</Label><Input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} /></div>
              <div className="space-y-2"><Label>Brand</Label><Input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} /></div>
              <div className="col-span-full space-y-2"><Label>Description</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div className="col-span-full flex gap-3">
                <Button type="submit" disabled={formLoading}>{formLoading ? 'Creating...' : 'Create Product'}</Button>
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
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground"><p className="text-lg">No products found</p><p className="text-sm mt-1">Start by adding your first product</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Product</th>
                  <th className="px-4 py-3 text-left font-medium">SKU</th>
                  <th className="px-4 py-3 text-left font-medium">Retail Price</th>
                  <th className="px-4 py-3 text-left font-medium">Wholesale Price</th>
                  <th className="px-4 py-3 text-left font-medium">Category</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr></thead>
                <tbody>{products.map(p => (
                  <tr key={p.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{p.sku}</td>
                    <td className="px-4 py-3">${p.price?.toFixed(2)}</td>
                    <td className="px-4 py-3">${p.wholesalePrice?.toFixed(2) || '-'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.categoryName || '-'}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${sc[p.status] || ''}`}>{p.status}</span></td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="outline" size="sm" onClick={() => handleDelete(p.id)} className="text-xs bg-destructive/10 text-destructive hover:bg-destructive/20 border-0 h-8">Delete</Button>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
