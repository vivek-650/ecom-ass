export function Footer() {
  return (
    <footer className="mt-24 border-t border-ink/8">
      <div className="container-lumos flex flex-col items-center justify-between gap-4 py-10 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="font-display text-lg text-ink">Lumos</span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">Market</span>
        </div>
        <p className="text-xs text-ink-muted">
          Built for a full-stack internship assessment · Payments run in Razorpay test mode
        </p>
      </div>
    </footer>
  );
}
