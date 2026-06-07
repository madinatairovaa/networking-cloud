'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { userApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function UserProfilePage() {
  const { user, login } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); setSuccess(''); setError(''); setLoading(true);
    try {
      if (!user?.id) return;
      const res = await userApi.updateProfile(user.id, { firstName, lastName, phone, address });
      // Update global context by re-syncing stored user
      const updatedUser = { ...user, firstName, lastName, phone, address };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setSuccess('Profile updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      <div><h2 className="text-2xl font-bold">Profile Settings</h2><p className="text-muted-foreground">Manage your account information</p></div>
      {success && <div className="p-3 rounded-lg bg-green-500/10 text-green-500 text-sm text-center">{success}</div>}
      {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">{error}</div>}

      <Card>
        <CardHeader>
          <CardTitle>Personal Details</CardTitle>
          <CardDescription>Update your contact info and shipping defaults</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>First Name</Label><Input value={firstName} onChange={e => setFirstName(e.target.value)} required /></div>
              <div className="space-y-2"><Label>Last Name</Label><Input value={lastName} onChange={e => setLastName(e.target.value)} required /></div>
            </div>
            <div className="space-y-2"><Label>Email Address (Primary)</Label><Input type="email" value={user?.email || ''} disabled className="bg-muted cursor-not-allowed" /></div>
            <div className="space-y-2"><Label>Phone Number</Label><Input value={phone} onChange={e => setPhone(e.target.value)} /></div>
            <div className="space-y-2"><Label>Default Shipping Address</Label><Input value={address} onChange={e => setAddress(e.target.value)} /></div>
            <Button type="submit" className="w-full h-11" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
