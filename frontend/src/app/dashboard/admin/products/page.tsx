'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { productApi } from '@/lib/api';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = search ? await productApi.search(search, page) : await productApi.getAll(page, 20);
      const data = res.data.data;
      setProducts(data.content || []); setTotalPages(data.totalPages || 0);
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to load products'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try { await productApi.delete(id); fetchProducts(); }
    catch (err: any) { setError(err.response?.data?.message || 'Failed to delete'); }
  };

  const statusColors: Record<string, string> = { ACTIVE: 'bg-green-500/10 text-green-500', INACTIVE: 'bg-gray-500/10 text-gray-500', DRAFT: 'bg-amber-500/10 text-amber-500' };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Products</h2><p className="text-muted-foreground">All products across the platform</p></div>
      </div>
      {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
      <Input placeholder="Search products..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className="max-w-sm" />
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">{Array.from({length: 5}).map((_, i) => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}</div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground"><p className="text-lg">No products found</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Product</th>
                  <th className="px-4 py-3 text-left font-medium">SKU</th>
                  <th className="px-4 py-3 text-left font-medium">Price</th>
                  <th className="px-4 py-3 text-left font-medium">Category</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Seller</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr></thead>
                <tbody>{products.map(p => (
                  <tr key={p.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{p.sku}</td>
                    <td className="px-4 py-3">${p.price?.toFixed(2)}{p.wholesalePrice && <span className="text-xs text-muted-foreground ml-1">(W: ${p.wholesalePrice?.toFixed(2)})</span>}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.categoryName || '-'}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[p.status] || ''}`}>{p.status}</span></td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{p.sellerName || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(p.id)} className="px-2 py-1 rounded text-xs bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">Delete</button>
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
