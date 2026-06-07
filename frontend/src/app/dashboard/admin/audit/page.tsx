'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { auditApi } from '@/lib/api';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = actionFilter ? await auditApi.getByAction(actionFilter, page) : await auditApi.getAll(page, 20);
      setLogs(res.data.data.content || []);
      setTotalPages(res.data.data.totalPages || 0);
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to load audit logs'); }
    finally { setLoading(false); }
  }, [page, actionFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const actions = ['','LOGIN','LOGOUT','REGISTRATION','PASSWORD_CHANGE','OTP_VERIFICATION','PRODUCT_CREATION','PRODUCT_UPDATE','PRODUCT_DELETE','INVENTORY_CHANGE','ORDER_CREATION','ORDER_UPDATE','USER_CREATION','USER_UPDATE','ACCOUNT_SUSPENSION','ACCOUNT_ACTIVATION','ACCOUNT_RESTORE','SECURITY_EVENT'];

  const actionColors: Record<string, string> = { LOGIN: 'text-green-500', LOGOUT: 'text-gray-500', REGISTRATION: 'text-blue-500', SECURITY_EVENT: 'text-red-500', PASSWORD_CHANGE: 'text-amber-500' };

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h2 className="text-2xl font-bold">Audit Logs</h2><p className="text-muted-foreground">System activity and security events</p></div>
      {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
      <div className="flex gap-3">
        <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(0); }}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">All Actions</option>
          {actions.filter(Boolean).map(a => <option key={a} value={a}>{a.replace(/_/g,' ')}</option>)}
        </select>
      </div>
      <Card><CardContent className="p-0">
        {loading ? <div className="p-6 space-y-3">{Array.from({length:8}).map((_,i) => <div key={i} className="h-10 bg-muted rounded animate-pulse"/>)}</div>
        : logs.length === 0 ? <div className="p-12 text-center text-muted-foreground">No audit logs found</div>
        : <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">Timestamp</th><th className="px-4 py-3 text-left font-medium">Action</th>
            <th className="px-4 py-3 text-left font-medium">User</th><th className="px-4 py-3 text-left font-medium">Description</th>
            <th className="px-4 py-3 text-left font-medium">IP Address</th>
          </tr></thead>
          <tbody>{logs.map((l, i) => <tr key={i} className="border-b hover:bg-muted/30 transition-colors">
            <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{l.timestamp ? new Date(l.timestamp).toLocaleString() : '-'}</td>
            <td className="px-4 py-3"><span className={`text-xs font-medium ${actionColors[l.action] || 'text-foreground'}`}>{l.action?.replace(/_/g,' ')}</span></td>
            <td className="px-4 py-3 text-muted-foreground text-xs">{l.userEmail || '-'}</td>
            <td className="px-4 py-3 text-xs max-w-xs truncate">{l.description}</td>
            <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{l.ipAddress || '-'}</td>
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
