'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboardApi } from '@/lib/api';

interface AdminStats {
  totalUsers: number; totalManagers: number; totalSellers: number; activeUsers: number;
  totalRevenue: number; monthlyRevenue: number; totalOrders: number; pendingOrders: number;
  totalProducts: number; totalAuditLogs: number; securityEvents: number;
  serverStatus: string; databaseStatus: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardApi.getAdmin()
      .then(res => setStats(res.data.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to fetch dashboard statistics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({length: 8}).map((_, i) => (
    <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-4 bg-muted rounded w-1/2 mb-3" /><div className="h-8 bg-muted rounded w-1/3" /></CardContent></Card>
  ))}</div>;

  if (error) return <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm text-center font-medium my-4">{error}</div>;

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: 'from-blue-500 to-blue-600' },
    { label: 'Total Managers', value: stats?.totalManagers || 0, icon: '👔', color: 'from-purple-500 to-purple-600' },
    { label: 'Total Sellers', value: stats?.totalSellers || 0, icon: '🏪', color: 'from-green-500 to-green-600' },
    { label: 'Active Users', value: stats?.activeUsers || 0, icon: '✅', color: 'from-emerald-500 to-emerald-600' },
    { label: 'Total Revenue', value: `$${(stats?.totalRevenue || 0).toLocaleString()}`, icon: '💰', color: 'from-yellow-500 to-orange-500' },
    { label: 'Monthly Revenue', value: `$${(stats?.monthlyRevenue || 0).toLocaleString()}`, icon: '📈', color: 'from-pink-500 to-rose-500' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: '🛒', color: 'from-cyan-500 to-cyan-600' },
    { label: 'Pending Orders', value: stats?.pendingOrders || 0, icon: '⏳', color: 'from-amber-500 to-amber-600' },
    { label: 'Total Products', value: stats?.totalProducts || 0, icon: '📦', color: 'from-indigo-500 to-indigo-600' },
    { label: 'Audit Logs', value: stats?.totalAuditLogs || 0, icon: '📋', color: 'from-slate-500 to-slate-600' },
    { label: 'Security Events', value: stats?.securityEvents || 0, icon: '🛡️', color: 'from-red-500 to-red-600' },
    { label: 'Server Status', value: stats?.serverStatus || 'N/A', icon: '🖥️', color: 'from-teal-500 to-teal-600' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <p className="text-muted-foreground">System overview and monitoring</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <Card key={i} className="card-hover overflow-hidden group">
            <CardContent className="p-5 relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                </div>
                <div className="text-3xl opacity-80">{card.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Health & Security */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-lg">System Health</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
              <span className="text-sm">Server Status</span>
              <span className="flex items-center gap-2 text-sm font-medium text-green-500">
                <span className="w-2 h-2 rounded-full bg-green-500 pulse-green" /> {stats?.serverStatus || 'HEALTHY'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
              <span className="text-sm">Database Connection</span>
              <span className="flex items-center gap-2 text-sm font-medium text-green-500">
                <span className="w-2 h-2 rounded-full bg-green-500 pulse-green" /> {stats?.databaseStatus || 'CONNECTED'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
              <span className="text-sm">API Gateway</span>
              <span className="flex items-center gap-2 text-sm font-medium text-green-500">
                <span className="w-2 h-2 rounded-full bg-green-500 pulse-green" /> OPERATIONAL
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Security & Compliance</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
              <span className="text-sm">Total Audit Logs</span>
              <span className="text-sm font-medium">{stats?.totalAuditLogs || 0} logs</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
              <span className="text-sm">Security Events</span>
              <span className={`text-sm font-medium ${(stats?.securityEvents || 0) > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {stats?.securityEvents || 0} alerts
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
              <span className="text-sm">Access Control Policy</span>
              <span className="text-sm font-medium text-primary">ENFORCED (RBAC)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
