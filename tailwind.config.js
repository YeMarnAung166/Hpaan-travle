/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          light: 'var(--color-primary-light)',
          dark: 'var(--color-primary-dark)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          light: 'var(--color-secondary-light)',
          dark: 'var(--color-secondary-dark)',
        },
        gold: {
          DEFAULT: 'var(--color-gold)',
          light: 'var(--color-gold-light)',
        },
        'accent-orange': {
          1: 'var(--color-accent-orange-1)',
          2: 'var(--color-accent-orange-2)',
        },
        neutral: {
          light: 'var(--color-neutral-light)',
          mid: 'var(--color-neutral-mid)',
          dark: 'var(--color-neutral-dark)',
        },
        text: {
          DEFAULT: 'var(--color-text)',
          soft: 'var(--color-text-soft)',
        },
        glass: {
          DEFAULT: 'var(--color-glass)',
          border: 'var(--color-glass-border)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          light: 'var(--color-border-light)',
        },
        overlay: 'var(--color-overlay)',
        error: 'var(--color-error)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        info: 'var(--color-info)',
      },
      fontFamily: {
        serif: ['var(--font-family-serif)'],
        sans: ['var(--font-family-sans)'],
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        elevated: 'var(--shadow-elevated)',
        glass: 'var(--shadow-glass)',
        lg: 'var(--shadow-lg)',
        card: 'var(--shadow-card)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
    },
  },
  plugins: [],
};