/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4fa',
          100: '#d9e2f1',
          200: '#b3c5e3',
          300: '#809fcd',
          400: '#4d78b5',
          500: '#2b5a97',
          600: '#1f4577',
          700: '#163559',
          800: '#0f2438',
          900: '#0a1827',
          950: '#060f1a',
        },
        gold: {
          50: '#fbf7ed',
          100: '#f6ecd0',
          200: '#ecd79c',
          300: '#e0bf63',
          400: '#d4a73c',
          500: '#c08f2a',
          600: '#a37022',
          700: '#80561e',
          800: '#68451f',
          900: '#573a1f',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgba(15, 36, 56, 0.08), 0 4px 16px -4px rgba(15, 36, 56, 0.06)',
        float: '0 8px 24px -6px rgba(15, 36, 56, 0.12), 0 16px 48px -12px rgba(15, 36, 56, 0.10)',
        glow: '0 0 0 1px rgba(212, 167, 60, 0.2), 0 8px 24px -8px rgba(212, 167, 60, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        pulseSoft: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
        shimmer: { '0%': { backgroundPosition: '-1000px 0' }, '100%': { backgroundPosition: '1000px 0' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
    },
  },
  plugins: [],
};
