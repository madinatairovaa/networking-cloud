'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { inventoryApi } from '@/lib/api';

export default function SellerInventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchInventory = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await inventoryApi.getAll(page, 20);
      setItems(res.data.data.content || []);
      setTotalPages(res.data.data.totalPages || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load inventory');
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h2 className="text-2xl font-bold">Inventory Levels</h2><p className="text-muted-foreground">View stock quantities and warehouse allocation</p></div>
      {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}</div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground"><p className="text-lg">No inventory records found</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Product</th>
                  <th className="px-4 py-3 text-left font-medium">Warehouse</th>
                  <th className="px-4 py-3 text-left font-medium">Total Qty</th>
                  <th className="px-4 py-3 text-left font-medium">Reserved</th>
                  <th className="px-4 py-3 text-left font-medium">Available</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                </tr></thead>
                <tbody>{items.map(i => (
                  <tr key={i.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div><span className="font-medium">{i.productName}</span><br /><span className="text-xs text-muted-foreground font-mono">{i.productSku}</span></div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{i.warehouseName}</td>
                    <td className="px-4 py-3">{i.quantity}</td>
                    <td className="px-4 py-3 text-muted-foreground">{i.reservedQuantity}</td>
                    <td className="px-4 py-3 font-medium">{i.availableQuantity}</td>
                    <td className="px-4 py-3">
                      {i.lowStock ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-red-500/10 text-red-500 font-medium">Low Stock</span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-500 font-medium">In Stock</span>
                      )}
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
