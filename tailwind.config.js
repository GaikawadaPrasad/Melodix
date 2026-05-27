/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: { DEFAULT: '#0a0a0f', 100: '#0f0f17', 200: '#14141e', 300: '#1a1a27', 400: '#212133', 500: '#2a2a40' },
        surface: { DEFAULT: '#16161f', hover: '#1e1e2d', border: '#2a2a40' },
        accent: { DEFAULT: '#7c3aed', light: '#a78bfa', dark: '#5b21b6', glow: '#7c3aed33' },
        brand: '#7c3aed',
        muted: '#6b6b8a',
        'text-primary': '#f0eeff',
        'text-secondary': '#9090b0',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      animation: {
        'pulse-slow': 'pulse 2.5s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'wave': 'wave 1.2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.25s ease-out',
      },
      keyframes: {
        wave: { '0%,100%': { transform: 'scaleY(0.4)' }, '50%': { transform: 'scaleY(1)' } },
        glow: { from: { boxShadow: '0 0 10px #7c3aed55' }, to: { boxShadow: '0 0 30px #7c3aed99' } },
        slideUp: { from: { transform: 'translateY(20px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
}
