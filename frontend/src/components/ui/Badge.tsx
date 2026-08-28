import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

type Tone = 'gold' | 'forest' | 'ember' | 'neutral';

const toneStyles: Record<Tone, string> = {
  gold: 'bg-gold/15 text-gold-deep',
  forest: 'bg-forest/10 text-forest',
  ember: 'bg-ember/10 text-ember',
  neutral: 'bg-ink/8 text-ink-muted',
};

export function Badge({ children, tone = 'neutral', className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest',
        toneStyles[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
