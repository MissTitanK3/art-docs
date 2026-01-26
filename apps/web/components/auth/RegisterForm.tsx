"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth/AuthProvider';
import { Input } from '@repo/ui';

const ROLES = [
  {
    value: 'responder',
    label: 'Responder',
    description: 'I can respond to crisis situations and take action'
  },
  {
    value: 'viewer',
    label: 'Supporter/Viewer',
    description: 'I want to observe and support from the coordination center'
  },
] as const;

type RoleValue = (typeof ROLES)[number]['value'];

export default function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState<RoleValue>('responder');
  const [regions, setRegions] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      toast.error('Passwords must match');
      return;
    }

    const allowed_regions = regions
      .split(',')
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    setLoading(true);
    try {
      await register({ email, password, role, allowed_regions });
      toast.success('Account created! Redirecting...');
      router.push('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg w-full mx-auto p-4 space-y-4"
    >
      <h1 className="text-xl font-semibold">Create Account</h1>

      <div className="space-y-2">
        <label className="block text-sm text-foreground">Email</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="block text-sm text-foreground">Password (min 8 chars)</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm text-foreground">Confirm password</label>
          <Input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm text-foreground">Role</label>
        <div className="space-y-2">
          {ROLES.map((r) => (
            <label key={r.value} className="flex items-start gap-3 p-3 border border-border rounded cursor-pointer hover:bg-muted/50 transition-colors">
              <input
                type="radio"
                name="role"
                value={r.value}
                checked={role === r.value}
                onChange={(e) => setRole(e.target.value as RoleValue)}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-sm">{r.label}</div>
                <div className="text-xs text-muted-foreground">{r.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm text-foreground">Allowed regions (zip codes, comma-separated)</label>
        <Input
          type="text"
          value={regions}
          onChange={(e) => setRegions(e.target.value)}
          placeholder="97201, 80202"
        />
        <p className="text-xs text-muted-foreground">Leave blank to grant no region access yet.</p>
      </div>

      <div className="bg-muted/30 p-3 rounded text-xs text-muted-foreground border border-muted">
        <p><strong>Administrator accounts</strong> are created by existing administrators to manage coordinators and system settings.</p>
      </div>

      <button
        type="submit"
        className="w-full bg-primary text-primary-foreground py-2 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}
