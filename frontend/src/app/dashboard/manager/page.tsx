'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboardApi } from '@/lib/api';

export default function ManagerDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardApi.getManager()
      .then(res => setStats(res.data.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to fetch manager statistics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({length: 6}).map((_, i) => (
    <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-4 bg-muted rounded w-1/2 mb-3" /><div className="h-8 bg-muted rounded w-1/3" /></CardContent></Card>
  ))}</div>;

  if (error) return <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm text-center font-medium my-4">{error}</div>;

  const cards = [
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: '🛒', color: 'from-blue-500 to-blue-600' },
    { label: 'Pending Orders', value: stats?.ordersByStatus?.PENDING || 0, icon: '⏳', color: 'from-amber-500 to-amber-600' },
    { label: 'Total Warehouses', value: stats?.totalWarehouses || 0, icon: '🏭', color: 'from-green-500 to-green-600' },
    { label: 'Active Warehouses', value: stats?.activeWarehouses || 0, icon: '✅', color: 'from-emerald-500 to-emerald-600' },
    { label: 'Total Customers', value: stats?.totalCustomers || 0, icon: '👤', color: 'from-purple-500 to-purple-600' },
    { label: 'Low Stock Items', value: stats?.lowStockItems || 0, icon: '⚠️', color: 'from-red-500 to-red-600' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h2 className="text-2xl font-bold">Manager Dashboard</h2><p className="text-muted-foreground">Operations overview</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      {stats?.ordersByStatus && (
        <Card><CardHeader><CardTitle>Orders by Status</CardTitle></CardHeader>
          <CardContent><div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(stats.ordersByStatus).map(([status, count]) => (
              <div key={status} className="p-3 rounded-lg bg-accent/50 text-center">
                <p className="text-xs text-muted-foreground">{status}</p><p className="text-xl font-bold">{String(count)}</p>
              </div>
            ))}
          </div></CardContent>
        </Card>
      )}
    </div>
  );
}
