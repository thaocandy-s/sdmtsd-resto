import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#FBF7ED",
          100: "#F5EDDA",
          200: "#EBDBB5",
          300: "#DFC58B",
          400: "#D4AE66",
          500: "#C9A96E",
          600: "#B08B4A",
          700: "#8E6E3C",
          800: "#6B5230",
          900: "#4A3822",
        },
        wood: {
          50: "#FAF6F1",
          100: "#F2EAD9",
          200: "#E5D4B3",
          300: "#D4B987",
          400: "#C39B5E",
          500: "#A87D44",
          600: "#8B6339",
          700: "#6E4C2E",
          800: "#523923",
          900: "#3A2819",
        },
        background: {
          DEFAULT: "#0F0D0B",
          secondary: "#1A1714",
          tertiary: "#252119",
        },
        foreground: {
          DEFAULT: "#F5F0E8",
          secondary: "#C8BFA8",
          tertiary: "#8A7E6B",
        },
        border: {
          DEFAULT: "#3A3228",
          light: "#4D4235",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        jp: ['"Noto Sans JP"', "sans-serif"],
      },
      backgroundImage: {
        "wood-pattern":
          "linear-gradient(135deg, rgba(58,40,25,0.3) 0%, rgba(82,57,35,0.2) 50%, rgba(58,40,25,0.3) 100%)",
        "gold-gradient":
          "linear-gradient(135deg, #C9A96E 0%, #D4AE66 50%, #B08B4A 100%)",
        "dark-overlay":
          "linear-gradient(to bottom, rgba(15,13,11,0.8) 0%, rgba(15,13,11,0.95) 100%)",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [tailwindAnimate],
};

export default config;
