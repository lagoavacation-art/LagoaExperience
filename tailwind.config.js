/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#B59410',
          light: '#D4AF37',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Italiana', 'serif'],
      },
    },
  },
  plugins: [],
}
