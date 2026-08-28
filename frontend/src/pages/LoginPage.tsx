import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location })?.from?.pathname || '/';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not sign in');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-lumos flex min-h-[80vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <p className="eyebrow mb-2 text-center">Welcome back</p>
        <h1 className="mb-8 text-center font-display text-3xl text-ink">Sign in to Lumos</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" className="mt-2 w-full" isLoading={isSubmitting}>
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          New here?{' '}
          <Link to="/register" className="text-gold-deep hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
