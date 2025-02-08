/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"], // Ensure Tailwind scans the correct files
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4A5D35',
          dark: '#26331B',
          light: '#5A6D45',
        }
      }
    },
  },
  plugins: [],
};
