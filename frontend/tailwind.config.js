/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5',
          50: '#EEEDFD',
          100: '#D6D3FA',
          200: '#AEA7F5',
          300: '#857BF0',
          400: '#5D4FEB',
          500: '#4F46E5',
          600: '#3730DD',
          700: '#2822C5',
          800: '#1E1894',
          900: '#140F63',
        },
        secondary: {
          DEFAULT: '#7C3AED',
          500: '#7C3AED',
          600: '#6D28D9',
        },
      },
      fontFamily: {
        urdu: ['"Noto Nastaliq Urdu"', 'serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
