/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        generalsans: ['General Sans', 'sans-serif'],
      },
      screens: {
        xs: '480px',
      },
      colors: {
        black: {
          DEFAULT: '#000',
          100: '#010103',
          200: '#0E0E10',
          300: '#1C1C21',
          500: '#3A3A49',
          600: '#1A1A1A',
        },
        white: {
          DEFAULT: '#FFFFFF',
          800: '#E4E4E6',
          700: '#D6D9E9',
          600: '#AFB0B6',
          500: '#8A8D97', // ≥4.5:1 on the page/card backgrounds (WCAG AA)
        },
        accent: {
          DEFAULT: '#8b7bff',
          violet: '#c77dff',
          cyan: '#5ec8f8',
        },
      },
    },
  },
  plugins: [],
};
