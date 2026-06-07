'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const navItems: Record<string, { label: string; href: string; icon: string }[]> = {
  ADMIN: [
    { label: 'Dashboard', href: '/dashboard/admin', icon: '📊' },
    { label: 'Users', href: '/dashboard/admin/users', icon: '👥' },
    { label: 'Products', href: '/dashboard/admin/products', icon: '📦' },
    { label: 'Orders', href: '/dashboard/admin/orders', icon: '🛒' },
    { label: 'Audit Logs', href: '/dashboard/admin/audit', icon: '📋' },
    { label: 'Settings', href: '/dashboard/admin/settings', icon: '⚙️' },
  ],
  MANAGER: [
    { label: 'Dashboard', href: '/dashboard/manager', icon: '📊' },
    { label: 'Products', href: '/dashboard/manager/products', icon: '📦' },
    { label: 'Inventory', href: '/dashboard/manager/inventory', icon: '📋' },
    { label: 'Orders', href: '/dashboard/manager/orders', icon: '🛒' },
    { label: 'Warehouses', href: '/dashboard/manager/warehouses', icon: '🏭' },
    { label: 'Customers', href: '/dashboard/manager/customers', icon: '👤' },
  ],
  SELLER: [
    { label: 'Dashboard', href: '/dashboard/seller', icon: '📊' },
    { label: 'My Products', href: '/dashboard/seller/products', icon: '📦' },
    { label: 'Categories', href: '/dashboard/seller/categories', icon: '🏷️' },
    { label: 'Inventory', href: '/dashboard/seller/inventory', icon: '📋' },
  ],
  USER: [
    { label: 'Dashboard', href: '/dashboard/user', icon: '🏠' },
    { label: 'Products', href: '/dashboard/user/products', icon: '📦' },
    { label: 'My Orders', href: '/dashboard/user/orders', icon: '🛒' },
    { label: 'Notifications', href: '/dashboard/user/notifications', icon: '🔔' },
    { label: 'Profile', href: '/dashboard/user/profile', icon: '👤' },
  ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  const role = user.roles[0] || 'USER';
  const items = navItems[role] || navItems.USER;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} border-r bg-card/50 backdrop-blur-sm transition-all duration-300 flex flex-col fixed h-full z-30`}>
        <div className="p-4 border-b flex items-center justify-between">
          {sidebarOpen && <h2 className="font-bold text-lg gradient-text truncate">WholeSale</h2>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-accent transition-colors text-sm">
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {items.map((item) => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                pathname === item.href
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                  : 'hover:bg-accent text-muted-foreground hover:text-foreground'
              }`}>
              <span className="text-base">{item.icon}</span>
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t space-y-2">
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors w-full text-muted-foreground">
            <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
            {sidebarOpen && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button onClick={logout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-destructive/10 text-destructive transition-colors w-full">
            <span>🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
        {/* Top bar */}
        <header className="h-16 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-20 flex items-center justify-between px-6">
          <div>
            <h1 className="font-semibold text-lg">{items.find(i => i.href === pathname)?.label || 'Dashboard'}</h1>
            <p className="text-xs text-muted-foreground">Welcome back, {user.firstName}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">{role}</span>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
              {user.firstName[0]}
            </div>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
