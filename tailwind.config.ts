import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Army-inspired olive green palette. Swap these for your own brand.
        primary: {
          DEFAULT: "#4A5D35",
          dark: "#26331B",
          light: "#5A6D45",
        },
        surface: "#1F2D16",
      },
    },
  },
  plugins: [],
} satisfies Config;
