'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { userApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface UserRow {
  id: string; firstName: string; lastName: string; email: string; phone: string;
  status: string; roles: string[]; emailVerified: boolean; forcePasswordChange: boolean;
  createdAt: string; lastLoginAt: string;
}

export default function AdminUsersPage() {
  const { hasPermission } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '', role: 'SELLER' });
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = search
        ? await userApi.search(search, page)
        : await userApi.getAll(page, 20);
      const data = res.data.data;
      setUsers(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await userApi.updateStatus(id, status);
      fetchUsers();
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to update status'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try { await userApi.delete(id); fetchUsers(); }
    catch (err: any) { setError(err.response?.data?.message || 'Failed to delete user'); }
  };

  const handleRestore = async (id: string) => {
    try { await userApi.restore(id); fetchUsers(); }
    catch (err: any) { setError(err.response?.data?.message || 'Failed to restore user'); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setCreateError(''); setCreateLoading(true);
    try {
      await userApi.create(createForm);
      setShowCreate(false);
      setCreateForm({ firstName: '', lastName: '', email: '', password: '', phone: '', role: 'SELLER' });
      fetchUsers();
    } catch (err: any) {
      setCreateError(err.response?.data?.message || 'Failed to create user');
    } finally { setCreateLoading(false); }
  };

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-500/10 text-green-500', INACTIVE: 'bg-gray-500/10 text-gray-500',
    SUSPENDED: 'bg-red-500/10 text-red-500',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">User Management</h2><p className="text-muted-foreground">Manage all platform users</p></div>
        {hasPermission('CREATE_ADMIN') && (
          <Button onClick={() => setShowCreate(true)}>+ Create User</Button>
        )}
      </div>

      {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

      {/* Search */}
      <div className="flex gap-3">
        <Input placeholder="Search users by name or email..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }} className="max-w-sm" />
      </div>

      {/* Create Modal */}
      {showCreate && (
        <Card className="border-primary/20">
          <CardHeader><CardTitle className="text-lg">Create New User</CardTitle></CardHeader>
          <CardContent>
            {createError && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm mb-4">{createError}</div>}
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>First Name</Label><Input value={createForm.firstName} onChange={e => setCreateForm({...createForm, firstName: e.target.value})} required /></div>
              <div className="space-y-2"><Label>Last Name</Label><Input value={createForm.lastName} onChange={e => setCreateForm({...createForm, lastName: e.target.value})} required /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={createForm.email} onChange={e => setCreateForm({...createForm, email: e.target.value})} required /></div>
              <div className="space-y-2"><Label>Password</Label><Input type="password" value={createForm.password} onChange={e => setCreateForm({...createForm, password: e.target.value})} required /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={createForm.phone} onChange={e => setCreateForm({...createForm, phone: e.target.value})} /></div>
              <div className="space-y-2">
                <Label>Role</Label>
                <select value={createForm.role} onChange={e => setCreateForm({...createForm, role: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="ADMIN">Admin</option><option value="MANAGER">Manager</option><option value="SELLER">Seller</option><option value="USER">User</option>
                </select>
              </div>
              <div className="col-span-full flex gap-3">
                <Button type="submit" disabled={createLoading}>{createLoading ? 'Creating...' : 'Create User'}</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">{Array.from({length: 5}).map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}</div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground"><p className="text-lg">No users found</p><p className="text-sm mt-1">Try adjusting your search criteria</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">User</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Role</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Joined</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr></thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                          <span className="font-medium">{user.firstName} {user.lastName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                      <td className="px-4 py-3"><span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{user.roles?.join(', ')}</span></td>
                      <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[user.status] || ''}`}>{user.status}</span></td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-1 justify-end">
                          {user.status === 'ACTIVE' && hasPermission('MANAGE_ACCOUNT_STATUS') && (
                            <button onClick={() => handleStatusChange(user.id, 'SUSPENDED')} className="px-2 py-1 rounded text-xs bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">Suspend</button>
                          )}
                          {user.status === 'SUSPENDED' && hasPermission('MANAGE_ACCOUNT_STATUS') && (
                            <button onClick={() => handleStatusChange(user.id, 'ACTIVE')} className="px-2 py-1 rounded text-xs bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors">Activate</button>
                          )}
                          {hasPermission('SOFT_DELETE_USERS') && (
                            <button onClick={() => handleDelete(user.id)} className="px-2 py-1 rounded text-xs bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">Delete</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
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
