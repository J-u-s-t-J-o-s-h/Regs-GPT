/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4A5D35",
          dark: "#26331B",
          light: "#5A6D45",
        },
      },
    },
  },
  plugins: [],
};
