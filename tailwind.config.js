/** @type {import('tailwindcss').Config} */
export default {
  content: ['popup/popup.html'],

  theme: {
    extend: {
      borderColor: {
        DEFAULT: 'var(--border)',
      },
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
        },
      },
      fontSize: {
        sm: '11px',
        base: '11.7px',
      },
    },
  },

  experimental: {
    optimizeUniversalDefaults: true,
  },
};
