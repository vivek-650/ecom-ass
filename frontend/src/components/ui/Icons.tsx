import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

// ---- Chrome / UI icons -------------------------------------------------

export function SearchIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function BagIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M6 8h12l-1 12H7L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

export function HeartIcon({ size = 18, filled = false, ...props }: IconProps & { filled?: boolean }) {
  return (
    <svg {...base(size)} fill={filled ? 'currentColor' : 'none'} {...props}>
      <path d="M12 20s-7-4.4-9.5-9C.7 7.2 3 4 6.5 4c2 0 3.5 1.2 4.5 2.7C12 5.2 13.5 4 15.5 4 19 4 21.3 7.2 19.5 11c-2.5 4.6-7.5 9-7.5 9Z" />
    </svg>
  );
}

export function XIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function ChevronDownIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function ChevronRightIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export function UserIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1.4-3.6 4.3-5.5 7.5-5.5s6.1 1.9 7.5 5.5" />
    </svg>
  );
}

export function GridIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1" />
    </svg>
  );
}

export function ChartIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M4 20V10M12 20V4M20 20v-6" />
    </svg>
  );
}

export function PackageIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </svg>
  );
}

export function UsersIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.8 19c1.2-3 3.4-4.6 6.2-4.6S14 16 15.2 19" />
      <path d="M16 8.2a3 3 0 1 1 3.6 2.9" />
      <path d="M15.5 14.7c2.3.3 4 1.8 5 4.3" />
    </svg>
  );
}

export function AlertTriangleIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M10.3 3.9 1.9 18a1.6 1.6 0 0 0 1.4 2.4h17.4a1.6 1.6 0 0 0 1.4-2.4L13.7 3.9a1.6 1.6 0 0 0-2.8 0Z" />
      <path d="M12 9v4M12 16.5v.01" />
    </svg>
  );
}

export function ArrowRightIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M4 12h16M13 5l7 7-7 7" />
    </svg>
  );
}

export function PlusIcon({ size = 14, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function MinusIcon({ size = 14, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function EditIcon({ size = 14, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export function TrashIcon({ size = 14, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
    </svg>
  );
}

export function CheckIcon({ size = 14, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}

export function BoxEmptyIcon({ size = 22, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
      <path d="m6 6.5 12 7M12 13v8" />
    </svg>
  );
}

// ---- Category icons (mapped by category name in categoryIcons.ts) -----

export function SmartphoneIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.2" />
      <path d="M10.5 18.2h3" />
    </svg>
  );
}

export function LaptopIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <rect x="4" y="4" width="16" height="11" rx="1.4" />
      <path d="M2 19.5h20M9 19.5v-2M15 19.5v-2" />
    </svg>
  );
}

export function ShirtIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M8 3 4 6l1.5 3L8 8v13h8V8l2.5 1L20 6l-4-3-2 2h-4L8 3Z" />
    </svg>
  );
}

export function SofaIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3" />
      <rect x="3" y="11" width="18" height="6" rx="1.6" />
      <path d="M4 17v3M20 17v3" />
    </svg>
  );
}

export function SparkleIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M12 3v4M12 17v4M5 12H3M21 12h-2M6.5 6.5l1.4 1.4M16.1 16.1l1.4 1.4M17.5 6.5l-1.4 1.4M7.9 16.1l-1.4 1.4" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  );
}

export function PlugIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M9 2v5M15 2v5M7 7h10l-1 6a4 4 0 0 1-4 3.4A4 4 0 0 1 8 13L7 7Z" />
      <path d="M12 16.5V22" />
    </svg>
  );
}

export function DumbbellIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M4 9v6M2.5 10.5v3M7 8v8M17 8v8M20 9v6M21.5 10.5v3" />
      <path d="M7 12h10" />
    </svg>
  );
}

export function BookIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H12v18H5.5A1.5 1.5 0 0 1 4 19.5v-15Z" />
      <path d="M12 3h6.5A1.5 1.5 0 0 1 20 4.5v15a1.5 1.5 0 0 1-1.5 1.5H12" />
    </svg>
  );
}

export function ToyIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <circle cx="8" cy="8" r="3.2" />
      <circle cx="16" cy="8" r="3.2" />
      <path d="M6 11c-1.5 1-2.5 3-2.5 6.5h17C20.5 14 19.5 12 18 11" />
      <path d="M9.5 20v-3M14.5 20v-3" />
    </svg>
  );
}

export function BasketIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M4 9h16l-1.5 10a2 2 0 0 1-2 1.7H7.5a2 2 0 0 1-2-1.7L4 9Z" />
      <path d="M8 9 9.5 3M16 9 14.5 3M2.5 9h19" />
    </svg>
  );
}

export function TagIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M20 12.5 12.5 20a1.6 1.6 0 0 1-2.2 0L3.5 13.2a1.6 1.6 0 0 1 0-2.2L11 3.5h6a2.5 2.5 0 0 1 2.5 2.5v6.5Z" />
      <circle cx="15" cy="8" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}
