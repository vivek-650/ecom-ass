import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="container-lumos flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="eyebrow mb-3">404</p>
      <h1 className="font-display text-5xl text-ink">Lost in the catalogue</h1>
      <p className="mt-4 max-w-sm text-sm text-ink-muted">
        The page you're looking for doesn't exist, or has been moved.
      </p>
      <Link to="/">
        <Button className="mt-8">Back home</Button>
      </Link>
    </div>
  );
}
