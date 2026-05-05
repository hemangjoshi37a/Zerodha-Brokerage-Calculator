/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#030712',
        card: 'rgba(17, 24, 39, 0.6)',
        primary: {
          DEFAULT: '#3b82f6',
          glow: 'rgba(59, 130, 246, 0.5)',
        },
        secondary: {
          DEFAULT: '#8b5cf6',
          glow: 'rgba(139, 92, 246, 0.5)',
        },
        accent: '#10b981',
        muted: '#9ca3af',
        border: 'rgba(255, 255, 255, 0.08)',
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
}
