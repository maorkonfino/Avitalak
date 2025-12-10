import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        'brand-brown': '#8B6F47',
        'brand-brown-light': '#A68A64',
        'brand-brown-dark': '#6B5838',
        'brand-gold': '#D4AF37',
        'brand-gold-light': '#E8D475',
        'brand-cream': '#F5F1E8',
        'brand-beige': '#E8DCC4',
      },
    },
  },
  plugins: [],
} satisfies Config;
