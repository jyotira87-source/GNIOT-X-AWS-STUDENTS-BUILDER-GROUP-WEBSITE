import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#030712",
        foreground: "#E5E7EB",
        card: "#0B1220",
        border: "#1F2937",
        primary: "#2563EB",
        muted: "#94A3B8",
      },
      backgroundImage: {
        "hero-gradient": "radial-gradient(circle at top right, rgba(37,99,235,0.35), transparent 45%), radial-gradient(circle at bottom left, rgba(14,165,233,0.3), transparent 45%)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(56,189,248,0.2), 0 10px 40px rgba(37,99,235,0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
