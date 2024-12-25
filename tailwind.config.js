/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        coral: {
          100: '#FF7F50',
          200: '#FF6B3D',
          300: '#FF572A',
          400: '#FF4317',
          500: '#FF2F04',
          600: '#E62A03',
          700: '#CC2503',
        },
      },
    },
  },
  plugins: [],
};
