/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        uniswap: {
          pink: '#FF45D8',
          purple: '#B15DFF',
          'light-purple': '#E8ECFB',
          blue: '#4C82FB',
          'dark-blue': '#0A0B1E',
          black: '#06071B',
          gray: '#2D3355',
          'light-gray': '#E8ECFB',
          white: '#FFFFFF',
        },
        success: '#2EE56D',
        warning: '#FFB23F',
        error: '#FF5D5D',
      },
      fontFamily: {
        sans: [
          'Inter',
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
        card: '0 8px 32px rgba(0, 0, 0, 0.32)',
        glow: '0 0 20px rgba(255, 69, 216, 0.35)',
        'inner-glow': 'inset 0 0 10px rgba(255, 69, 216, 0.2)',
      },
      backgroundColor: {
        'glass': 'rgba(255, 255, 255, 0.03)',
      },
      backdropFilter: {
        'blur-card': 'blur(12px)',
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