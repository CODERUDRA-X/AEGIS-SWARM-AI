// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        aegis: {
          bg: "#050c14", // Deep space navy
          panel: "#0a121e", // Slightly lighter panel bg
          scout: "#58a6ff", // Intel blue
          risk: "#3fb950", // Secure green
          critic: "#f85149", // Threat red/orange
          cmd: "#a371f7", // Commander purple
          border: "#1e2a38", // Subtle borders
        }
      },
      fontFamily: {
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      }
    },
  },
  plugins: [],
};
export default config;