import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        // A held die's border pulses between the active dice theme's two
        // highlight colors. GameDice sets the --die-highlight-* variables.
        "die-throb": {
          "0%, 100%": {
            borderColor: "var(--die-highlight-primary)",
            boxShadow: "0 0 5px 0 var(--die-highlight-primary)",
          },
          "50%": {
            borderColor: "var(--die-highlight-secondary)",
            boxShadow: "0 0 10px 1px var(--die-highlight-secondary)",
          },
        },
      },
      animation: {
        "die-throb": "die-throb 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
