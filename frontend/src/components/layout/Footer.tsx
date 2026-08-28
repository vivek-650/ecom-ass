import type { ReactNode } from 'react';

const COLUMNS: { heading: string; items: string[] }[] = [
  { heading: 'About', items: ['About Lumos', 'Careers', 'Lumos Stories', 'Press', 'Corporate Information'] },
  { heading: 'Help', items: ['Payments', 'Shipping', 'Cancellation & Returns', 'FAQ'] },
  {
    heading: 'Consumer Policy',
    items: ['Cancellation & Returns', 'Terms of Use', 'Security', 'Privacy', 'Sitemap', 'Grievance Redressal'],
  },
];

const PAYMENT_METHODS = ['Visa', 'Mastercard', 'RuPay', 'UPI', 'Net Banking'];

export function Footer() {
  return (
    <footer className="mt-16 bg-ink text-white/70">
      <div className="container-lumos grid grid-cols-2 gap-8 py-10 sm:grid-cols-3 lg:grid-cols-5">
        {COLUMNS.map((col) => (
          <div key={col.heading}>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-white/40">{col.heading}</p>
            <ul className="space-y-2">
              {col.items.map((item) => (
                <li key={item} className="text-sm text-white/70 transition-colors hover:text-white">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-white/40">Mail Us</p>
          <p className="text-sm leading-relaxed text-white/70">
            Lumos Market
            <br />
            support@lumosmarket.example
            <br />
            Built for a full-stack internship assessment
          </p>
        </div>

        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-white/40">Connect with us</p>
          <div className="flex gap-3">
            <SocialIcon label="Facebook">
              <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v6h3v-6h2.5l.5-3H14V9.5c0-.3.2-.5.5-.5Z" />
            </SocialIcon>
            <SocialIcon label="Instagram">
              <rect x="4" y="4" width="16" height="16" rx="4" />
              <circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="16.2" cy="7.8" r="0.9" />
            </SocialIcon>
            <SocialIcon label="Twitter / X">
              <path d="m4 4 7 8.5L4.4 20H6l6-6.9 4.7 6.9H20l-7.3-9L19 4h-1.6l-5.6 6.4L6.9 4H4Z" />
            </SocialIcon>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-lumos flex flex-col items-center justify-between gap-4 py-5 sm:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/60">
            <span className="hover:text-white">Become a Seller</span>
            <span className="hover:text-white">Advertise</span>
            <span className="hover:text-white">Gift Cards</span>
            <span className="hover:text-white">Help Center</span>
          </div>

          <div className="flex items-center gap-2">
            {PAYMENT_METHODS.map((method) => (
              <span
                key={method}
                className="rounded border border-white/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/50"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-xs text-white/40">
          © {new Date().getFullYear()} Lumos Market — payments run in Razorpay test mode.
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span
      aria-label={label}
      className="grid h-8 w-8 place-items-center rounded-full border border-white/15 text-white/60 transition-colors hover:border-white/40 hover:text-white"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        {children}
      </svg>
    </span>
  );
}
