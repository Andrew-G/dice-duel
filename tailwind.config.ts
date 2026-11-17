import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/views/**/*.{js,ts,jsx,tsx,mdx}",
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
        // The Challenge opponent reveal: the portrait slams in, the stage
        // shakes and a ring rolls out from the impact, then the name resolves
        // out of a blur and starts to shimmer.
        "opponent-slam": {
          "0%": {
            opacity: "0",
            transform: "translateY(-140%) scale(1.9) rotate(-8deg)",
            filter: "blur(10px)",
          },
          "55%": {
            opacity: "1",
            transform: "translateY(0) scale(0.9) rotate(1.5deg)",
            filter: "blur(0)",
          },
          "75%": { transform: "translateY(-3%) scale(1.04) rotate(-0.5deg)" },
          "100%": {
            opacity: "1",
            transform: "translateY(0) scale(1) rotate(0)",
          },
        },
        "stage-shake": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "20%": { transform: "translate(-6px, 3px)" },
          "40%": { transform: "translate(5px, -4px)" },
          "60%": { transform: "translate(-3px, 2px)" },
          "80%": { transform: "translate(2px, -1px)" },
        },
        "impact-ring": {
          "0%": { opacity: "0.9", transform: "scale(0.2)" },
          "100%": { opacity: "0", transform: "scale(1.5)" },
        },
        "name-reveal": {
          "0%": {
            opacity: "0",
            transform: "scale(1.5)",
            letterSpacing: "0.35em",
            filter: "blur(14px)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)",
            letterSpacing: "0.04em",
            filter: "blur(0)",
          },
        },
        // A bright band sweeps across the name's gradient fill.
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-100% 0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "die-throb": "die-throb 1.2s ease-in-out infinite",
        "opponent-slam":
          "opponent-slam 0.85s cubic-bezier(0.2, 0.7, 0.3, 1) both",
        "stage-shake": "stage-shake 0.35s linear 0.5s both",
        "impact-ring": "impact-ring 0.7s ease-out 0.5s both",
        // Two animations on one class: the name resolves in, then shimmers.
        "opponent-name":
          "name-reveal 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) 0.95s both, shimmer 2.6s linear 1.8s infinite",
        "fade-up": "fade-up 0.5s ease-out 1.5s both",
      },
    },
  },
  plugins: [],
} satisfies Config;
