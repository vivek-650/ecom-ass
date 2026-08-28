import { Button } from './Button';

export function RetryState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-display text-xl text-ink">Taking longer than expected</p>
      <p className="max-w-sm text-sm text-ink-muted">{message}</p>
      <Button onClick={onRetry}>Try again</Button>
    </div>
  );
}
