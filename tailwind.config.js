/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#68d3b0',
          hover: '#4da789',
        },
      },
      fontSize: {
        '3xs': '11px',
        '2xs': '11.7px',
      },
    },
  },
  experimental: {
    optimizeUniversalDefaults: true,
  },
  plugins: [],
}
