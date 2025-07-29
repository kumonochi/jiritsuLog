/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kintone-blue': '#0288D1',
        'kintone-orange': '#FF7043',
        primary: '#3498db',
        secondary: '#2ecc71',
        warning: '#f39c12',
        danger: '#e74c3c',
      },
      fontFamily: {
        'kintone': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}