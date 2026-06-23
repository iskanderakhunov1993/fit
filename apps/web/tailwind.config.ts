import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        mira: {
          background: "#FBF8F5",
          card: "#FFFFFF",
          text: "#2D2A26",
          muted: "#9B978F",
          primary: "#E8836B",
          success: "#6BAF8D",
          cycle: "#D4637A",
          ink: "#2D2A26"
        }
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "Inter", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 8px 32px rgba(45, 42, 38, 0.08)",
        glow: "0 12px 40px rgba(232, 131, 107, 0.2)"
      },
      borderRadius: {
        "3xl": "2rem",
        "4xl": "2.5rem"
      }
    }
  },
  plugins: []
};

export default config;
