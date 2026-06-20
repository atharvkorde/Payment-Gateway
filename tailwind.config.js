/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        gpay: '#4285F4',
        phonepe: '#5f259f',
        paytm: '#00baf2',
        bhim: '#00897b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        gpay: '0 8px 24px -4px rgba(66, 133, 244, 0.25)',
        phonepe: '0 8px 24px -4px rgba(95, 37, 159, 0.25)',
        paytm: '0 8px 24px -4px rgba(0, 186, 242, 0.25)',
        bhim: '0 8px 24px -4px rgba(0, 137, 123, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out both',
        'slide-up': 'slideUp 0.45s ease-out both',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
