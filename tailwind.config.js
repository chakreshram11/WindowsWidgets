/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        mac: {
          dark: 'rgba(28, 28, 30, 0.75)',
          light: 'rgba(240, 240, 243, 0.75)',
          glass: 'rgba(255, 255, 255, 0.25)',
          border: 'rgba(255, 255, 255, 0.18)',
          accent: '#007AFF'
        }
      },
      backdropBlur: {
        xs: '2px',
        xl: '24px',
        '2xl': '40px'
      },
      boxShadow: {
        'dock': '0 20px 40px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.15) inset',
        'dock-light': '0 15px 35px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.6) inset',
        'glow': '0 0 20px rgba(0, 122, 255, 0.6)'
      },
      keyframes: {
        bounceOnce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-22px)' }
        },
        pulseGlow: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.7, transform: 'scale(1.15)' }
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-6px)' },
          '40%, 80%': { transform: 'translateX(6px)' }
        }
      },
      animation: {
        'bounce-once': 'bounceOnce 0.6s cubic-bezier(0.28, 0.84, 0.42, 1)',
        'pulse-glow': 'pulseGlow 1.2s infinite ease-in-out',
        'shake-icon': 'shake 0.4s ease-in-out'
      }
    },
  },
  plugins: [],
}
