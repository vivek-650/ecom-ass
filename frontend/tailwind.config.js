/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1A1A1A',
          soft: '#2B2B2B',
          muted: '#6B7280',
        },
        paper: {
          DEFAULT: '#FFFFFF',
          dim: '#F1F3F6',
        },
        // Brand yellow -- highlights, promo surfaces, the account pill.
        gold: {
          DEFAULT: '#FFC300',
          deep: '#E0A800',
          pale: '#FFF3CC',
        },
        // Brand green -- primary CTA ("ADD"), success states.
        forest: {
          DEFAULT: '#0C9942',
          deep: '#087A34',
          pale: '#E3F8EA',
        },
        // Sale / discount tags.
        ember: '#E23744',
      },
      fontFamily: {
        display: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(26, 26, 26, 0.06)',
        'card-hover': '0 2px 10px rgba(26, 26, 26, 0.12)',
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
