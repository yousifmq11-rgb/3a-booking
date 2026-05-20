import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow:     "#F4C200",
          "yellow-light": "#FFFBEB",
          "yellow-hover": "#E0B000",
          dark:       "#111111",
          "dark-hover": "#2A2A2A",
          red:        "#D6341B",
        },
        background: "#F9F8F5",
      },
      fontFamily: {
        sans: ["var(--font-roboto)", "Roboto", "system-ui", "sans-serif"],
        mono: ["monospace"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card:       "0 1px 3px 0 rgba(0,0,0,0.06), 0 4px 16px 0 rgba(0,0,0,0.07)",
        "card-hover":"0 4px 16px 0 rgba(0,0,0,0.10), 0 8px 32px 0 rgba(0,0,0,0.09)",
        nav:        "0 1px 0 0 rgba(0,0,0,0.07)",
      },
      animation: {
        "fade-up":   "fadeUp 0.4s ease both",
        "fade-in":   "fadeIn 0.3s ease both",
        "scale-in":  "scaleIn 0.3s ease both",
        "spin-slow": "spin 1.5s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
