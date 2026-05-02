/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F8F9FA',
        card: '#FFFFFF',
        input: '#F1F3F5',
        yellow: '#FFB800',
        'yellow-dark': '#E6A500',
        teal: '#4ECDC4',
        orange: '#FF8C42',
        pink: '#FF6B9D',
        danger: '#FF4757',
        success: '#2ED573',
        purple: '#6C63FF',
        'text-main': '#1A1A2E',
        'text-sub': '#6B7280',
        'text-muted': '#9CA3AF',
        border: '#E5E7EB',
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '28px',
      },
      boxShadow: {
        card: '0 2px 16px rgba(0,0,0,0.06)',
        'card-lg': '0 4px 24px rgba(0,0,0,0.10)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
