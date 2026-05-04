import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        rose: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        pink: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        blush: {
          50: '#fff0f5',
          100: '#ffe0eb',
          200: '#ffc1d7',
          300: '#ff94b8',
          400: '#ff5c93',
          500: '#ff2970',
          600: '#f00058',
          700: '#cc0050',
          800: '#a80047',
          900: '#8c0040',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      backgroundImage: {
        'pink-gradient': 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #ffe4e6 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(253,242,248,0.8) 100%)',
        'nav-gradient': 'linear-gradient(90deg, #fce7f3 0%, #fff1f2 100%)',
        'btn-gradient': 'linear-gradient(135deg, #f472b6 0%, #f43f5e 100%)',
        'profit-gradient': 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
        'loss-gradient': 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
      },
      boxShadow: {
        'pink-sm': '0 2px 8px rgba(244,114,182,0.15)',
        'pink-md': '0 4px 20px rgba(244,114,182,0.25)',
        'pink-lg': '0 8px 40px rgba(244,114,182,0.3)',
        'pink-xl': '0 16px 60px rgba(244,114,182,0.35)',
        'glass': '0 8px 32px rgba(244,114,182,0.1), inset 0 1px 0 rgba(255,255,255,0.8)',
        'glow': '0 0 20px rgba(244,114,182,0.4)',
        'glow-lg': '0 0 40px rgba(244,114,182,0.5)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-in': 'slide-in 0.3s ease-out',
        'fade-up': 'fade-up 0.4s ease-out',
        'counter': 'counter 0.3s ease-out',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(244,114,182,0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(244,114,182,0.6)' },
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}

export default config
