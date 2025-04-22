/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        uniswap: {
          pink: '#FC72FF',
          purple: '#9B51E0',
          'light-purple': '#E8ECFB',
          blue: '#2172E5',
          'dark-blue': '#0E0E23',
          black: '#0D111C',
          gray: '#293249',
          'light-gray': '#CED0D9',
          white: '#FFFFFF',
        },
        success: '#27AE60',
        warning: '#F2994A',
        error: '#EB5757',
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0px 8px 32px rgba(0, 0, 0, 0.08)',
        glow: '0 0 20px rgba(252, 114, 255, 0.5)',
        'inner-glow': 'inset 0 0 10px rgba(252, 114, 255, 0.2)',
      },
      backgroundColor: {
        'glass': 'rgba(255, 255, 255, 0.1)',
      },
      backdropFilter: {
        'blur-card': 'blur(16px)',
      },
      animation: {
        'gradient': 'gradient 5s ease infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};