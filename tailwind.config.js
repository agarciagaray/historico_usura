/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f2fbf6',
          100: '#e6f7ee',
          200: '#c6f0d8',
          300: '#97e6b8',
          400: '#52d48f',
          500: '#16a34a',
          600: '#13803e',
          700: '#0f6b34',
          800: '#0b4e25',
          900: '#08351a',
        },
      },
    },
  },
  plugins: [],
};
