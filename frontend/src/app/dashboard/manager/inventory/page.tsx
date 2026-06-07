'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { inventoryApi } from '@/lib/api';

export default function ManagerInventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filter, setFilter] = useState('all');

  const fetchInventory = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = filter === 'low' ? await inventoryApi.getLowStock(page) : await inventoryApi.getAll(page, 20);
      setItems(res.data.data.content || []); setTotalPages(res.data.data.totalPages || 0);
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to load inventory'); }
    finally { setLoading(false); }
  }, [page, filter]);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  const handleAdjust = async (id: string, adj: number) => {
    try { await inventoryApi.adjustStock(id, adj); fetchInventory(); }
    catch (err: any) { setError(err.response?.data?.message || 'Failed to adjust'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h2 className="text-2xl font-bold">Inventory</h2><p className="text-muted-foreground">Stock levels across warehouses</p></div>
      {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
      <div className="flex gap-2">
        <Button variant={filter==='all'?'default':'outline'} size="sm" onClick={()=>{setFilter('all');setPage(0);}}>All</Button>
        <Button variant={filter==='low'?'default':'outline'} size="sm" onClick={()=>{setFilter('low');setPage(0);}}>⚠️ Low Stock</Button>
      </div>
      <Card><CardContent className="p-0">
        {loading ? <div className="p-6 space-y-3">{Array.from({length:5}).map((_,i)=><div key={i} className="h-12 bg-muted rounded animate-pulse"/>)}</div>
        : items.length === 0 ? <div className="p-12 text-center text-muted-foreground">No inventory records</div>
        : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b bg-muted/50">
          <th className="px-4 py-3 text-left font-medium">Product</th><th className="px-4 py-3 text-left font-medium">Warehouse</th>
          <th className="px-4 py-3 text-left font-medium">Qty</th><th className="px-4 py-3 text-left font-medium">Reserved</th>
          <th className="px-4 py-3 text-left font-medium">Available</th><th className="px-4 py-3 text-left font-medium">Status</th>
          <th className="px-4 py-3 text-right font-medium">Adjust</th>
        </tr></thead><tbody>{items.map(i => <tr key={i.id} className="border-b hover:bg-muted/30 transition-colors">
          <td className="px-4 py-3"><div><span className="font-medium">{i.productName}</span><br/><span className="text-xs text-muted-foreground font-mono">{i.productSku}</span></div></td>
          <td className="px-4 py-3 text-muted-foreground">{i.warehouseName}</td>
          <td className="px-4 py-3">{i.quantity}</td>
          <td className="px-4 py-3 text-muted-foreground">{i.reservedQuantity}</td>
          <td className="px-4 py-3 font-medium">{i.availableQuantity}</td>
          <td className="px-4 py-3">{i.lowStock ? <span className="px-2 py-1 rounded-full text-xs bg-red-500/10 text-red-500 font-medium">Low Stock</span> : <span className="px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-500 font-medium">OK</span>}</td>
          <td className="px-4 py-3 text-right"><div className="flex gap-1 justify-end">
            <button onClick={()=>handleAdjust(i.id, -1)} className="w-7 h-7 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-bold">-</button>
            <button onClick={()=>handleAdjust(i.id, 1)} className="w-7 h-7 rounded bg-green-500/10 text-green-500 hover:bg-green-500/20 text-xs font-bold">+</button>
            <button onClick={()=>handleAdjust(i.id, 10)} className="px-2 h-7 rounded bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 text-xs">+10</button>
          </div></td>
        </tr>)}</tbody></table></div>}
      </CardContent></Card>
      {totalPages > 1 && <div className="flex items-center justify-center gap-2"><Button variant="outline" size="sm" disabled={page===0} onClick={()=>setPage(p=>p-1)}>Previous</Button><span className="text-sm text-muted-foreground">Page {page+1} of {totalPages}</span><Button variant="outline" size="sm" disabled={page>=totalPages-1} onClick={()=>setPage(p=>p+1)}>Next</Button></div>}
    </div>
  );
}
