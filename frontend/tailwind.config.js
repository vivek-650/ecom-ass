/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#14110F',
          soft: '#221D19',
          muted: '#5C554D',
        },
        paper: {
          DEFAULT: '#FBF8F2',
          dim: '#F2ECDF',
        },
        gold: {
          DEFAULT: '#C9A15A',
          deep: '#9C7A3C',
          pale: '#E8D6AE',
        },
        forest: {
          DEFAULT: '#1F3A34',
          deep: '#132724',
        },
        ember: '#B65C43',
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 120px 40px rgba(201, 161, 90, 0.18)',
        card: '0 1px 2px rgba(20, 17, 15, 0.06), 0 8px 24px -8px rgba(20, 17, 15, 0.12)',
        'card-hover': '0 4px 8px rgba(20, 17, 15, 0.08), 0 16px 40px -12px rgba(20, 17, 15, 0.18)',
      },
      backgroundImage: {
        'radial-glow':
          'radial-gradient(circle at 50% 0%, rgba(201, 161, 90, 0.16), transparent 60%)',
      },
      letterSpacing: {
        widest: '0.18em',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
};
