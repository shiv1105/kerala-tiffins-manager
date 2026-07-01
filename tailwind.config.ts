import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#10221d",
        leaf: "#0f6b4f",
        limeleaf: "#7fb241",
        coconut: "#f7f5ef",
        spice: "#c94f27",
        brass: "#c89b3c",
      },
      boxShadow: {
        soft: "0 18px 40px rgba(16, 34, 29, 0.10)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
