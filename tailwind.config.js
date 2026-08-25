/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#090D14",
        "bg-elevated": "#0F1620",
        "bg-panel": "#141D2B",
        "bg-card": "#101724",
        accent: {
          DEFAULT: "#E8A33D",
          light: "#FFB84D",
          glow: "#F59E0B",
          dim: "#B47820",
          cyan: "#38BDF8",
        },
        text: {
          DEFAULT: "#ECEFF4",
          dim: "#6B7688",
          muted: "#4B5563",
        },
        border: {
          DEFAULT: "#202B3D",
          accent: "#E8A33D",
          dim: "#1E293B",
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      keyframes: {
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "spin-slow-reverse": {
          from: { transform: "rotate(360deg)" },
          to: { transform: "rotate(0deg)" },
        },
        "spin-fast": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "spin-fast-reverse": {
          from: { transform: "rotate(360deg)" },
          to: { transform: "rotate(0deg)" },
        },
        "pulse-speak": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.08)", opacity: "0.85" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        "radar-sweep": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "spin-slow": "spin-slow 24s linear infinite",
        "spin-slow-reverse": "spin-slow-reverse 36s linear infinite",
        "spin-fast": "spin-fast 8s linear infinite",
        "spin-fast-reverse": "spin-fast-reverse 12s linear infinite",
        "pulse-speak": "pulse-speak 1.2s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.25s ease-out",
        blink: "blink 1s step-start infinite",
        "radar-sweep": "radar-sweep 4s linear infinite",
      },
    },
  },
  plugins: [],
};
