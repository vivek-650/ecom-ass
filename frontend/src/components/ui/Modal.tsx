import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { XIcon } from './Icons';

export function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    // Outer layer scrolls the whole overlay (not just the panel) so a modal
    // taller than the viewport -- a long form on a small phone in landscape,
    // say -- never clips content with no way to reach it.
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm animate-fade-up" onClick={onClose} />
      <div className="relative z-10 flex min-h-full items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-2xl bg-paper p-5 shadow-card-hover animate-fade-up sm:p-8">
          <div className="mb-5 flex items-center justify-between sm:mb-6">
            <h2 className="font-display text-xl text-ink sm:text-2xl">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink"
            >
              <XIcon />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
