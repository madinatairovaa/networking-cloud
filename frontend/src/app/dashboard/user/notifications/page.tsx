'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { notificationApi } from '@/lib/api';

export default function UserNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchNotifications = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await notificationApi.getAll(page, 20);
      setNotifications(res.data.data.content || []);
      setTotalPages(res.data.data.totalPages || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load notifications');
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      fetchNotifications();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      fetchNotifications();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark all as read');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationApi.delete(id);
      fetchNotifications();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete notification');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Notifications</h2><p className="text-muted-foreground">Stay updated with platform events</p></div>
        {notifications.some(n => !n.read) && (
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>Mark All as Read</Button>
        )}
      </div>
      {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />)
        ) : notifications.length === 0 ? (
          <Card><CardContent className="p-12 text-center text-muted-foreground">No notifications yet</CardContent></Card>
        ) : (
          notifications.map(n => (
            <Card key={n.id} className={`border-l-4 transition-colors ${n.read ? 'border-l-muted bg-card/50' : 'border-l-primary bg-primary/5'}`}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{n.title}</span>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                  <span className="text-xs text-muted-foreground/60">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</span>
                </div>
                <div className="flex gap-2">
                  {!n.read && (
                    <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(n.id)} className="text-xs h-8">Mark Read</Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(n.id)} className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 h-8">Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

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
