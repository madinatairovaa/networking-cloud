'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { customerApi } from '@/lib/api';

export default function ManagerCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ companyName:'', contactPerson:'', email:'', phone:'', address:'', city:'', country:'' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true); setError('');
    try { const r = search ? await customerApi.search(search, page) : await customerApi.getAll(page, 20); setCustomers(r.data.data.content||[]); setTotalPages(r.data.data.totalPages||0); }
    catch (e: any) { setError(e.response?.data?.message||'Failed'); } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError(''); setFormLoading(true);
    try { await customerApi.create(form); setShowCreate(false); setForm({ companyName:'', contactPerson:'', email:'', phone:'', address:'', city:'', country:'' }); fetch(); }
    catch (err: any) { setFormError(err.response?.data?.message||'Failed'); } finally { setFormLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this customer?')) return;
    try { await customerApi.delete(id); fetch(); } catch (e: any) { setError(e.response?.data?.message||'Failed'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Customers</h2><p className="text-muted-foreground">Manage B2B customers</p></div>
        <Button onClick={() => setShowCreate(!showCreate)}>+ Add Customer</Button>
      </div>
      {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
      <Input placeholder="Search customers..." value={search} onChange={e=>{setSearch(e.target.value);setPage(0);}} className="max-w-sm"/>
      {showCreate && <Card className="border-primary/20"><CardHeader><CardTitle className="text-lg">New Customer</CardTitle></CardHeader><CardContent>
        {formError && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm mb-4">{formError}</div>}
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Company Name*</Label><Input value={form.companyName} onChange={e=>setForm({...form,companyName:e.target.value})} required/></div>
          <div className="space-y-2"><Label>Contact Person*</Label><Input value={form.contactPerson} onChange={e=>setForm({...form,contactPerson:e.target.value})} required/></div>
          <div className="space-y-2"><Label>Email*</Label><Input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></div>
          <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
          <div className="space-y-2"><Label>City</Label><Input value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/></div>
          <div className="space-y-2"><Label>Country</Label><Input value={form.country} onChange={e=>setForm({...form,country:e.target.value})}/></div>
          <div className="col-span-full space-y-2"><Label>Address</Label><Input value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/></div>
          <div className="col-span-full flex gap-3"><Button type="submit" disabled={formLoading}>{formLoading?'Creating...':'Create'}</Button><Button type="button" variant="outline" onClick={()=>setShowCreate(false)}>Cancel</Button></div>
        </form>
      </CardContent></Card>}
      <Card><CardContent className="p-0">
        {loading ? <div className="p-6 space-y-3">{Array.from({length:5}).map((_,i)=><div key={i} className="h-12 bg-muted rounded animate-pulse"/>)}</div>
        : customers.length===0 ? <div className="p-12 text-center text-muted-foreground">No customers found</div>
        : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b bg-muted/50">
          <th className="px-4 py-3 text-left font-medium">Company</th><th className="px-4 py-3 text-left font-medium">Contact</th>
          <th className="px-4 py-3 text-left font-medium">Email</th><th className="px-4 py-3 text-left font-medium">Location</th>
          <th className="px-4 py-3 text-left font-medium">Status</th><th className="px-4 py-3 text-right font-medium">Actions</th>
        </tr></thead><tbody>{customers.map(c=><tr key={c.id} className="border-b hover:bg-muted/30">
          <td className="px-4 py-3 font-medium">{c.companyName}</td><td className="px-4 py-3">{c.contactPerson}</td>
          <td className="px-4 py-3 text-muted-foreground text-xs">{c.email}</td>
          <td className="px-4 py-3 text-muted-foreground text-xs">{[c.city,c.country].filter(Boolean).join(', ')||'-'}</td>
          <td className="px-4 py-3">{c.active?<span className="px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-500 font-medium">Active</span>:<span className="px-2 py-1 rounded-full text-xs bg-gray-500/10 text-gray-500 font-medium">Inactive</span>}</td>
          <td className="px-4 py-3 text-right"><button onClick={()=>handleDelete(c.id)} className="px-2 py-1 rounded text-xs bg-destructive/10 text-destructive hover:bg-destructive/20">Delete</button></td>
        </tr>)}</tbody></table></div>}
      </CardContent></Card>
      {totalPages>1&&<div className="flex items-center justify-center gap-2"><Button variant="outline" size="sm" disabled={page===0} onClick={()=>setPage(p=>p-1)}>Previous</Button><span className="text-sm text-muted-foreground">Page {page+1} of {totalPages}</span><Button variant="outline" size="sm" disabled={page>=totalPages-1} onClick={()=>setPage(p=>p+1)}>Next</Button></div>}
    </div>
  );
}
