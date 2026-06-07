'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { warehouseApi } from '@/lib/api';

export default function ManagerWarehousesPage() {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name:'', code:'', address:'', city:'', state:'', country:'', zipCode:'', capacity:'' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true); setError('');
    try { const r = await warehouseApi.getAll(page, 20); setWarehouses(r.data.data.content||[]); setTotalPages(r.data.data.totalPages||0); }
    catch (e: any) { setError(e.response?.data?.message||'Failed'); } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError(''); setFormLoading(true);
    try {
      await warehouseApi.create({ ...form, capacity: form.capacity ? parseInt(form.capacity) : null });
      setShowCreate(false); setForm({ name:'', code:'', address:'', city:'', state:'', country:'', zipCode:'', capacity:'' }); fetch();
    } catch (err: any) { setFormError(err.response?.data?.message||'Failed'); } finally { setFormLoading(false); }
  };

  const toggleActive = async (id: string) => { try { await warehouseApi.toggleActive(id); fetch(); } catch (e: any) { setError(e.response?.data?.message||'Failed'); } };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Warehouses</h2><p className="text-muted-foreground">Manage warehouse locations</p></div>
        <Button onClick={() => setShowCreate(!showCreate)}>+ Add Warehouse</Button>
      </div>
      {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
      {showCreate && <Card className="border-primary/20"><CardHeader><CardTitle className="text-lg">New Warehouse</CardTitle></CardHeader><CardContent>
        {formError && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm mb-4">{formError}</div>}
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2"><Label>Name*</Label><Input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></div>
          <div className="space-y-2"><Label>Code*</Label><Input value={form.code} onChange={e=>setForm({...form,code:e.target.value})} required/></div>
          <div className="space-y-2"><Label>Capacity</Label><Input type="number" value={form.capacity} onChange={e=>setForm({...form,capacity:e.target.value})}/></div>
          <div className="col-span-full space-y-2"><Label>Address*</Label><Input value={form.address} onChange={e=>setForm({...form,address:e.target.value})} required/></div>
          <div className="space-y-2"><Label>City</Label><Input value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/></div>
          <div className="space-y-2"><Label>State</Label><Input value={form.state} onChange={e=>setForm({...form,state:e.target.value})}/></div>
          <div className="space-y-2"><Label>Country</Label><Input value={form.country} onChange={e=>setForm({...form,country:e.target.value})}/></div>
          <div className="col-span-full flex gap-3"><Button type="submit" disabled={formLoading}>{formLoading?'Creating...':'Create'}</Button><Button type="button" variant="outline" onClick={()=>setShowCreate(false)}>Cancel</Button></div>
        </form>
      </CardContent></Card>}
      <Card><CardContent className="p-0">
        {loading ? <div className="p-6 space-y-3">{Array.from({length:3}).map((_,i)=><div key={i} className="h-12 bg-muted rounded animate-pulse"/>)}</div>
        : warehouses.length===0 ? <div className="p-12 text-center text-muted-foreground">No warehouses</div>
        : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b bg-muted/50">
          <th className="px-4 py-3 text-left font-medium">Name</th><th className="px-4 py-3 text-left font-medium">Code</th>
          <th className="px-4 py-3 text-left font-medium">Location</th><th className="px-4 py-3 text-left font-medium">Capacity</th>
          <th className="px-4 py-3 text-left font-medium">Status</th><th className="px-4 py-3 text-right font-medium">Actions</th>
        </tr></thead><tbody>{warehouses.map(w=><tr key={w.id} className="border-b hover:bg-muted/30">
          <td className="px-4 py-3 font-medium">{w.name}</td><td className="px-4 py-3 font-mono text-xs text-muted-foreground">{w.code}</td>
          <td className="px-4 py-3 text-muted-foreground text-xs">{[w.city,w.state,w.country].filter(Boolean).join(', ')||w.address}</td>
          <td className="px-4 py-3">{w.capacity||'-'}</td>
          <td className="px-4 py-3">{w.active?<span className="px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-500 font-medium">Active</span>:<span className="px-2 py-1 rounded-full text-xs bg-gray-500/10 text-gray-500 font-medium">Inactive</span>}</td>
          <td className="px-4 py-3 text-right"><button onClick={()=>toggleActive(w.id)} className={`px-2 py-1 rounded text-xs ${w.active?'bg-amber-500/10 text-amber-500':'bg-green-500/10 text-green-500'} hover:opacity-80`}>{w.active?'Deactivate':'Activate'}</button></td>
        </tr>)}</tbody></table></div>}
      </CardContent></Card>
      {totalPages>1&&<div className="flex items-center justify-center gap-2"><Button variant="outline" size="sm" disabled={page===0} onClick={()=>setPage(p=>p-1)}>Previous</Button><span className="text-sm text-muted-foreground">Page {page+1} of {totalPages}</span><Button variant="outline" size="sm" disabled={page>=totalPages-1} onClick={()=>setPage(p=>p+1)}>Next</Button></div>}
    </div>
  );
}
