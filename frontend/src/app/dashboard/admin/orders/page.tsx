'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { orderApi } from '@/lib/api';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchOrders = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await orderApi.getAll(page, 20);
      setOrders(res.data.data.content || []);
      setTotalPages(res.data.data.totalPages || 0);
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to load orders'); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (id: string, status: string) => {
    try { await orderApi.updateStatus(id, status); fetchOrders(); }
    catch (err: any) { setError(err.response?.data?.message || 'Failed to update'); }
  };

  const sc: Record<string, string> = { PENDING: 'bg-amber-500/10 text-amber-500', CONFIRMED: 'bg-blue-500/10 text-blue-500', PROCESSING: 'bg-purple-500/10 text-purple-500', SHIPPED: 'bg-cyan-500/10 text-cyan-500', DELIVERED: 'bg-green-500/10 text-green-500', CANCELLED: 'bg-red-500/10 text-red-500' };

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h2 className="text-2xl font-bold">Order Management</h2><p className="text-muted-foreground">All platform orders</p></div>
      {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
      <Card><CardContent className="p-0">
        {loading ? <div className="p-6 space-y-3">{Array.from({length:5}).map((_,i) => <div key={i} className="h-12 bg-muted rounded animate-pulse"/>)}</div>
        : orders.length === 0 ? <div className="p-12 text-center text-muted-foreground">No orders found</div>
        : <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">Order #</th><th className="px-4 py-3 text-left font-medium">Customer</th>
            <th className="px-4 py-3 text-left font-medium">Total</th><th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-left font-medium">Date</th><th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr></thead>
          <tbody>{orders.map(o => <tr key={o.id} className="border-b hover:bg-muted/30 transition-colors">
            <td className="px-4 py-3 font-mono text-xs">{o.orderNumber}</td>
            <td className="px-4 py-3">{o.userName}</td>
            <td className="px-4 py-3 font-medium">${o.totalAmount?.toFixed(2)}</td>
            <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${sc[o.status]||''}`}>{o.status}</span></td>
            <td className="px-4 py-3 text-muted-foreground text-xs">{o.orderDate ? new Date(o.orderDate).toLocaleDateString() : '-'}</td>
            <td className="px-4 py-3 text-right">
              <select value={o.status} onChange={e => handleStatusChange(o.id, e.target.value)} className="text-xs rounded border border-input bg-background px-2 py-1">
                {['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </td>
          </tr>)}</tbody>
        </table></div>}
      </CardContent></Card>
      {totalPages > 1 && <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="sm" disabled={page===0} onClick={() => setPage(p=>p-1)}>Previous</Button>
        <span className="text-sm text-muted-foreground">Page {page+1} of {totalPages}</span>
        <Button variant="outline" size="sm" disabled={page>=totalPages-1} onClick={() => setPage(p=>p+1)}>Next</Button>
      </div>}
    </div>
  );
}
