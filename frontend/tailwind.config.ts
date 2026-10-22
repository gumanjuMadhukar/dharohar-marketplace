import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Dharohar Nepali Heritage Palette
        nepal: {
          crimson: "#C51D24", // National Rhododendron / Sindoor Red
          crimsonDark: "#941319",
          gold: "#D4AF37", // Pagoda temple brass / gold
          goldDark: "#AA8C2C",
          terracotta: "#B2533E", // Bhaktapur brick terracotta
          saffron: "#F29727", // Himalayan marigold
          emerald: "#1B4D3E", // Deep Himalayan pine
          parchment: "#FDFBF7", // Lokta paper off-white
          earth: "#2D2424", // Yak wool charcoal
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

