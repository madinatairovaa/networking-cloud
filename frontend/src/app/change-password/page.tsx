'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function ChangePasswordPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      // Update local storage to clear forcePasswordChange
      const stored = localStorage.getItem('user');
      if (stored) {
        const u = JSON.parse(stored);
        u.forcePasswordChange = false;
        localStorage.setItem('user', JSON.stringify(u));
      }
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Password change failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="border-0 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl text-center">Change Password</CardTitle>
            <CardDescription className="text-center">
              {user?.forcePasswordChange
                ? 'You must change your default password before continuing'
                : 'Update your password'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2"><Label>Current Password</Label><Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required /></div>
              <div className="space-y-2"><Label>New Password</Label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                <p className="text-xs text-muted-foreground">Min 8 chars, uppercase, lowercase, digit, special char</p>
              </div>
              <Button type="submit" className="w-full h-11" disabled={loading}>{loading ? 'Changing...' : 'Change Password'}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
