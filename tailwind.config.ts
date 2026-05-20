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
      colors: {
        emeraldDeep: "#073F37",
        emerald: "#0F766E",
        mist: "#EEF6F2",
        gold: "#D6A13D",
        coral: "#D36B4B",
        ink: "#17231F"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(15, 118, 110, 0.14)",
        card: "0 12px 30px rgba(23, 35, 31, 0.10)"
      }
    }
  }
};

export default config;
