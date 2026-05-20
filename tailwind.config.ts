import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
    "./constants/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Prompt", "sans-serif"],
        body: ["Sarabun", "sans-serif"]
      },
      colors: {
        ink: "#17212B",
        muted: "#6B7280",
        cream: "#FFF8EF",
        sand: "#F0DFC8",
        teal: "#0A6B62",
        tealSoft: "#E6F4EF",
        leaf: "#3E7A4F",
        coral: "#D36B4B",
        gold: "#D6A13D",
        skySoft: "#EAF6F7"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(15, 23, 42, 0.10)",
        card: "0 10px 30px rgba(15, 23, 42, 0.08)",
        glow: "0 20px 50px rgba(7, 94, 99, 0.20)"
      }
    }
  }
};

export default config;
