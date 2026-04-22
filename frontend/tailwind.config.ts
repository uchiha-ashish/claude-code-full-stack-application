import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        band: {
          warning: "#EF4444",
          caution: "#F59E0B",
          normal: "#10B981",
          healthy: "#059669"
        },
        ink: {
          900: "#0F172A",
          700: "#334155",
          500: "#64748B",
          300: "#CBD5E1",
          100: "#F1F5F9"
        },
        brand: {
          primary: "#0B7C5A",
          accent: "#F5F1E8",
          bg: "#FAFAF7"
        }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      maxWidth: {
        mobile: "390px"
      }
    }
  },
  plugins: []
};

export default config;
