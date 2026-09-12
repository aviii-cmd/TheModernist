import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FAFAF8",
        ink: {
          DEFAULT: "#14171B",
          secondary: "#6B7280",
          faint: "#9CA3AF",
        },
        accent: {
          DEFAULT: "#1F3D66",
          hover: "#16304F",
        },
        surface: "#EEF2F6",
        border: {
          DEFAULT: "#E3E1DA",
          strong: "#CBD3DC",
        },
        ink900: "#0F1115",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Helvetica", "Arial", "sans-serif"],
      },
      maxWidth: {
        content: "74ch",
        grid: "1360px",
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
      },
      boxShadow: {
        none: "none",
      },
    },
  },
  plugins: [],
};

export default config;
