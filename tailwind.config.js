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
          DEFAULT: '#000000',
          container: '#131B2E', // Midnight Blue
        },
        secondary: {
          DEFAULT: '#E5EEFF', // surface-container
          container: '#86F2E4', // Vibrant Teal container
        },
        accent: {
          DEFAULT: '#006A61', // Vibrant Teal
          dark: '#131B2E', // Midnight Blue
          onContainer: '#006F66',
        },
        error: '#BA1A1A',
        background: {
          start: '#F8F9FF', // surface
          end: '#EFF4FF', // surface-container-low
        },
        text: {
          primary: '#0B1C30', // on-surface
          secondary: '#45464D', // on-surface-variant
        },
        border: '#C6C6CD', // outline-variant
        cardBg: '#FFFFFF', // surface-container-lowest
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
