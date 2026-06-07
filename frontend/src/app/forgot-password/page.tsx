'use client';

import { useState } from 'react';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      if (res.data.data?.otp) setDevOtp(res.data.data.otp);
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await authApi.verifyOtp({ email, code: otp, type: 'PASSWORD_RESET' });
      setStep('reset');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await authApi.resetPassword({ email, code: otp, newPassword });
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Password reset failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      </div>
      <div className="w-full max-w-md relative animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold gradient-text">Reset Password</h1>
        </div>
        <Card className="border-0 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-center">
              {step === 'email' ? 'Forgot Password' : step === 'otp' ? 'Verify OTP' : 'New Password'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center mb-4">{error}</div>}
            {step === 'email' && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                <Button type="submit" className="w-full h-11" disabled={loading}>{loading ? 'Sending...' : 'Send OTP'}</Button>
              </form>
            )}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {devOtp && (<div className="p-3 rounded-lg bg-primary/10 text-sm"><p className="font-medium text-primary">Dev OTP</p><p className="text-2xl font-mono font-bold tracking-widest">{devOtp}</p></div>)}
                <div className="space-y-2"><Label>OTP</Label><Input value={otp} onChange={(e) => setOtp(e.target.value)} className="text-center text-2xl tracking-widest h-14" maxLength={6} required /></div>
                <Button type="submit" className="w-full h-11" disabled={loading}>{loading ? 'Verifying...' : 'Verify'}</Button>
              </form>
            )}
            {step === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2"><Label>New Password</Label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required /></div>
                <Button type="submit" className="w-full h-11" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</Button>
              </form>
            )}
            <p className="text-sm text-center text-muted-foreground mt-4">
              <Link href="/login" className="text-primary hover:underline">Back to Login</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
