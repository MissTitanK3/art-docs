"use client";

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { Input } from '@repo/ui';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await auth.login(email, password);
      toast.success('Logged in successfully!');
      router.push('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-sm mx-auto p-4 space-y-4 border border-border rounded bg-card text-card-foreground"
    >
      <h1 className="text-xl font-semibold">Login</h1>
      <div className="space-y-2">
        <label className="block text-sm text-foreground">Email</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm text-foreground">Password</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button
        type="submit"
        className="w-full bg-primary text-primary-foreground py-2 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>

      <p className="text-xs text-muted-foreground text-center">
        Need an account? <Link href="/register" className="text-primary underline">Create one</Link>
      </p>
    </form>
  );
}
