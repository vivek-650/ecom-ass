import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '@/api/auth.api';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { Role } from '@/types';

export function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Extract<Role, 'user' | 'sales_person'>>('user');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await authApi.signUp({ fullName, email, password, role });
      toast.success('Account created — check your inbox to confirm your email, then sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-lumos flex min-h-[80vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <p className="eyebrow mb-2 text-center">Join the marketplace</p>
        <h1 className="mb-8 text-center font-display text-3xl text-ink">Create your account</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            label="Password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Select label="I want to" value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
            <option value="user">Shop as a customer</option>
            <option value="sales_person">Sell products</option>
          </Select>
          <Button type="submit" className="mt-2 w-full" isLoading={isSubmitting}>
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-gold-deep hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
