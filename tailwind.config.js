/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        plant: {
          50: "#eff6f3",
          100: "#d7eae1",
          200: "#afd5c4",
          300: "#7eb9a1",
          400: "#529a7e",
          500: "#2D6A4F",
          600: "#23553f",
          700: "#1c4433",
          800: "#17372a",
          900: "#122d23",
        },
        pest: {
          50: "#fef3ee",
          100: "#fde3d5",
          200: "#fac2a8",
          300: "#f69972",
          400: "#f0683b",
          500: "#E76F51",
          600: "#d55430",
          700: "#b14026",
          800: "#8e3524",
          900: "#742f22",
        },
        alert: {
          50: "#fdf2f2",
          100: "#fde3e3",
          200: "#fdc9c9",
          300: "#faa3a3",
          400: "#f56d6d",
          500: "#D62828",
          600: "#c01e1e",
          700: "#a01818",
          800: "#841818",
          900: "#6f1a1a",
        },
        ink: {
          50: "#f7f8fa",
          100: "#eef0f4",
          200: "#d8dde6",
          300: "#b4bccb",
          400: "#8894ab",
          500: "#66738d",
          600: "#505b72",
          700: "#414a5d",
          800: "#383f4e",
          900: "#1f2430",
        },
      },
      fontFamily: {
        sans: [
          '"Source Han Sans SC"',
          '"Noto Sans SC"',
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "sans-serif",
        ],
        serif: [
          '"Source Han Serif SC"',
          '"Noto Serif SC"',
          '"Songti SC"',
          "SimSun",
          "serif",
        ],
        mono: [
          '"JetBrains Mono"',
          '"SF Mono"',
          '"Cascadia Code"',
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.06)",
        pop: "0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 16px 32px -4px rgba(15, 23, 42, 0.10)",
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(214, 40, 40, 0.35)" },
          "50%": { boxShadow: "0 0 0 6px rgba(214, 40, 40, 0)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "fade-up": "fade-up 420ms ease-out both",
      },
    },
  },
  plugins: [],
};
