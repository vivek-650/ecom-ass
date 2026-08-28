/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0F172A',
          soft: '#1E293B',
          muted: '#64748B',
        },
        paper: {
          DEFAULT: '#FFFFFF',
          dim: '#F7F8FA',
        },
        // The single brand accent -- used only for primary actions, links,
        // and focus states. Nothing else carries color.
        forest: {
          DEFAULT: '#15803D',
          deep: '#116C32',
          pale: '#E9F5EE',
        },
        // Errors and discount/sale tags only.
        ember: '#DC2626',
      },
      fontFamily: {
        display: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.05)',
        'card-hover': '0 4px 14px rgba(15, 23, 42, 0.10)',
      },
      backgroundImage: {
        'radial-glow': 'none',
      },
      letterSpacing: {
        widest: '0.14em',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.3s ease-out both',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
};
