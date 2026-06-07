'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { productApi, categoryApi } from '@/lib/api';

export default function UserProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true); setError('');
    try {
      let res;
      if (search) {
        res = await productApi.search(search, page);
      } else if (selectedCategory) {
        res = await productApi.getByCategory(selectedCategory, page);
      } else {
        res = await productApi.getAll(page, 20);
      }
      setProducts(res.data.data.content || []);
      setTotalPages(res.data.data.totalPages || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally { setLoading(false); }
  }, [page, search, selectedCategory]);

  useEffect(() => {
    fetchProducts();
    categoryApi.getAll().then(r => setCategories(r.data.data || [])).catch(() => {});
  }, [fetchProducts]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h2 className="text-2xl font-bold">Product Catalog</h2><p className="text-muted-foreground">Browse clothing collections and wholesale pricing</p></div>
      {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

      <div className="flex flex-col sm:flex-row gap-3">
        <Input placeholder="Search products..." value={search} onChange={e => { setSearch(e.target.value); setSelectedCategory(''); setPage(0); }} className="max-w-sm" />
        <select value={selectedCategory} onChange={e => { setSelectedCategory(e.target.value); setSearch(''); setPage(0); }} className="rounded-md border border-input bg-background px-3 py-2 text-sm max-w-xs">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}</div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground"><p className="text-lg">No products found</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Product</th>
                  <th className="px-4 py-3 text-left font-medium">SKU</th>
                  <th className="px-4 py-3 text-left font-medium">Retail Price</th>
                  <th className="px-4 py-3 text-left font-medium">Wholesale Price</th>
                  <th className="px-4 py-3 text-left font-medium">Category</th>
                  <th className="px-4 py-3 text-left font-medium">Brand</th>
                  <th className="px-4 py-3 text-left font-medium">Min Order</th>
                </tr></thead>
                <tbody>{products.map(p => (
                  <tr key={p.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{p.sku}</td>
                    <td className="px-4 py-3">${p.price?.toFixed(2)}</td>
                    <td className="px-4 py-3 font-semibold text-primary">${p.wholesalePrice?.toFixed(2) || p.price?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.categoryName || '-'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.brand || '-'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.minOrderQuantity || 1} units</td>
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
