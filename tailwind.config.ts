import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        display: ["Outfit", "sans-serif"],
      },
      colors: {
        bg: {
          0: "rgb(var(--bg-0) / <alpha-value>)",
          1: "rgb(var(--bg-1) / <alpha-value>)",
          2: "rgb(var(--bg-2) / <alpha-value>)",
          3: "rgb(var(--bg-3) / <alpha-value>)",
          4: "rgb(var(--bg-4) / <alpha-value>)",
          5: "rgb(var(--bg-5) / <alpha-value>)",
          6: "rgb(var(--bg-6) / <alpha-value>)",
        },
        text: {
          primary: "rgb(var(--text-primary) / <alpha-value>)",
          warm: "rgb(var(--text-warm) / <alpha-value>)",
          muted: "rgb(var(--text-muted) / <alpha-value>)",
        },
        gold: {
          DEFAULT: "#D4AF37",
          light: "#FFD87A",
          lighter: "#FFE5A3",
          dark: "#C99625",
          darkest: "#4B2F01",
        },
        silver: {
          DEFAULT: "#C0C0C0",
          light: "#F7FBFF",
          mid: "#C7D2E0",
          dark: "#5E6879",
        },
        bronze: "#CD7F32",
        success: {
          DEFAULT: "#27E6AC",
          mid: "#0E8A67",
          dark: "#042B22",
        },
        amber: {
          DEFAULT: "#FFF3BA",
          mid: "#DFBE38",
          dark: "#665113",
        },
        danger: {
          DEFAULT: "#FF7AA5",
          mid: "#AD1F49",
          dark: "#2C0714",
        },
        accent: {
          clasificacion: "#D9B449",
          participante: "#6BBF78",
          versus: "#F0417A",
        },
        group: {
          A: "#6BBF78",
          B: "#EC1522",
          C: "#EAEA7E",
          D: "#0C66B6",
          E: "#F48020",
          F: "#006858",
          G: "#B0A8D9",
          H: "#55BCBB",
          I: "#4E3AA2",
          J: "#FEA999",
          K: "#F0417A",
          L: "#82001C",
        },
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        livePulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        countPulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.03)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
        "live-pulse": "livePulse 1.5s infinite",
        "count-pulse": "countPulse 1s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
