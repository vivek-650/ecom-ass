import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

type Tone = 'gold' | 'forest' | 'ember' | 'neutral';

const toneStyles: Record<Tone, string> = {
  gold: 'bg-gold/20 text-ink',
  forest: 'bg-forest/10 text-forest-deep',
  ember: 'bg-ember/10 text-ember',
  neutral: 'bg-ink/6 text-ink-muted',
};

export function Badge({ children, tone = 'neutral', className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        toneStyles[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
