'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboardApi } from '@/lib/api';
import Link from 'next/link';

export default function UserDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardApi.getUser()
      .then(res => setStats(res.data.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to fetch user dashboard statistics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{Array.from({length: 2}).map((_, i) => (
    <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-4 bg-muted rounded w-1/2 mb-3" /><div className="h-8 bg-muted rounded w-1/3" /></CardContent></Card>
  ))}</div>;

  if (error) return <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm text-center font-medium my-4">{error}</div>;

  const cards = [
    { label: 'My Orders', value: stats?.myOrders || 0, icon: '🛒', color: 'from-blue-500 to-blue-600' },
    { label: 'Notifications', value: stats?.unreadNotifications || 0, icon: '🔔', color: 'from-amber-500 to-amber-600' },
  ];

  const quickActions = [
    { label: 'Browse Products', href: '/dashboard/user/products' },
    { label: 'Track Orders', href: '/dashboard/user/orders' },
    { label: 'View Notifications', href: '/dashboard/user/notifications' },
    { label: 'Edit Profile', href: '/dashboard/user/profile' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h2 className="text-2xl font-bold">My Dashboard</h2><p className="text-muted-foreground">Your account overview</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card, i) => (
          <Card key={i} className="card-hover overflow-hidden group">
            <CardContent className="p-5 relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">{card.label}</p><p className="text-2xl font-bold mt-1">{card.value}</p></div>
                <div className="text-3xl opacity-80">{card.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action, i) => (
            <Link key={i} href={action.href} className="p-4 rounded-lg border hover:bg-accent hover:text-accent-foreground transition-colors text-center block">
              <p className="text-sm font-medium">{action.label}</p>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
