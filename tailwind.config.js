// tailwind.config.js
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
          DEFAULT: '#2D6A4F',
          light: '#52B788',
          dark: '#1B4332',
        },
        secondary: {
          DEFAULT: '#D4A373',
          light: '#E9C46A',
          dark: '#B5835A',
        },
        neutral: {
          light: '#F5F5F0',
          mid: '#E7E5DF',
          dark: '#5C5A4C',
        },
        text: {
          DEFAULT: '#2B2B24',
          soft: '#78766B',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}