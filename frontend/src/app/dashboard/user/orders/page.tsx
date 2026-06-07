'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { orderApi, productApi } from '@/lib/api';

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Order creation form state
  const [shippingAddress, setShippingAddress] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<any[]>([{ productId: '', quantity: 1, size: 'M', color: 'Black' }]);

  const fetchOrders = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await orderApi.getMyOrders(page);
      setOrders(res.data.data.content || []);
      setTotalPages(res.data.data.totalPages || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => {
    fetchOrders();
    productApi.getAll(0, 100).then(r => setProducts(r.data.data.content || [])).catch(() => {});
  }, [fetchOrders]);

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1, size: 'M', color: 'Black' }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, key: string, val: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [key]: val };
    setItems(newItems);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError(''); setFormLoading(true);
    try {
      if (items.some(item => !item.productId)) {
        throw new Error('Please select products for all items.');
      }
      const formattedItems = items.map(item => ({
        ...item,
        quantity: parseInt(item.quantity)
      }));
      await orderApi.create({
        shippingAddress,
        billingAddress,
        notes,
        items: formattedItems
      });
      setShowCreate(false);
      setShippingAddress('');
      setBillingAddress('');
      setNotes('');
      setItems([{ productId: '', quantity: 1, size: 'M', color: 'Black' }]);
      fetchOrders();
    } catch (err: any) {
      setFormError(err.message || err.response?.data?.message || 'Failed to place order');
    } finally { setFormLoading(false); }
  };

  const sc: Record<string, string> = { PENDING: 'bg-amber-500/10 text-amber-500', CONFIRMED: 'bg-blue-500/10 text-blue-500', PROCESSING: 'bg-purple-500/10 text-purple-500', SHIPPED: 'bg-cyan-500/10 text-cyan-500', DELIVERED: 'bg-green-500/10 text-green-500', CANCELLED: 'bg-red-500/10 text-red-500' };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">My Orders</h2><p className="text-muted-foreground">Place and track your wholesale orders</p></div>
        <Button onClick={() => setShowCreate(!showCreate)}>+ New Order</Button>
      </div>
      {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

      {showCreate && (
        <Card className="border-primary/20">
          <CardHeader><CardTitle className="text-lg">Place New Wholesale Order</CardTitle></CardHeader>
          <CardContent>
            {formError && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm mb-4">{formError}</div>}
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Shipping Address*</Label><Input value={shippingAddress} onChange={e => setShippingAddress(e.target.value)} required /></div>
                <div className="space-y-2"><Label>Billing Address*</Label><Input value={billingAddress} onChange={e => setBillingAddress(e.target.value)} required /></div>
              </div>
              <div className="space-y-2"><Label>Order Notes</Label><Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special delivery instructions" /></div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Order Items</Label>
                {items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end bg-accent/30 p-3 rounded-lg">
                    <div className="md:col-span-2 space-y-2">
                      <Label>Product*</Label>
                      <select value={item.productId} onChange={e => handleItemChange(idx, 'productId', e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                        <option value="">Select product...</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} - ${p.wholesalePrice?.toFixed(2) || p.price?.toFixed(2)}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2"><Label>Quantity</Label><Input type="number" min="1" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} required /></div>
                    <div className="space-y-2"><Label>Size</Label><Input value={item.size} onChange={e => handleItemChange(idx, 'size', e.target.value)} /></div>
                    <div className="flex gap-2 items-center">
                      <div className="w-full space-y-2"><Label>Color</Label><Input value={item.color} onChange={e => handleItemChange(idx, 'color', e.target.value)} /></div>
                      {items.length > 1 && (
                        <Button type="button" variant="ghost" onClick={() => handleRemoveItem(idx)} className="mt-6 text-destructive hover:bg-destructive/10 px-2">X</Button>
                      )}
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={handleAddItem} className="w-full">+ Add Item</Button>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={formLoading}>{formLoading ? 'Placing Order...' : 'Submit Order'}</Button>
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
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground"><p className="text-lg">No orders found</p><p className="text-sm mt-1">Submit your first wholesale order above</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Order #</th>
                  <th className="px-4 py-3 text-left font-medium">Total Amount</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Order Date</th>
                  <th className="px-4 py-3 text-left font-medium">Shipped Date</th>
                  <th className="px-4 py-3 text-left font-medium">Items</th>
                </tr></thead>
                <tbody>{orders.map(o => (
                  <tr key={o.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold">{o.orderNumber}</td>
                    <td className="px-4 py-3 font-medium">${o.totalAmount?.toFixed(2)}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${sc[o.status] || ''}`}>{o.status}</span></td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{o.orderDate ? new Date(o.orderDate).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{o.shippedDate ? new Date(o.shippedDate).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{o.items?.length || 0}</td>
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
