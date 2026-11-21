import type { DiceTheme } from "@/types/DiceTheme";

export const starlightTheme: DiceTheme = {
  id: "starlight",
  name: "Starlight",

  bgFrom: "rgba(30, 41, 59, 0.4)",
  bgTo: "rgba(15, 23, 42, 0.4)",

  borderLight: "rgba(251, 191, 36, 0.55)",
  borderDark: "rgba(30, 41, 59, 0.7)",

  highlightPrimary: "#fbbf24",
  highlightSecondary: "#fef3c7",

  shadowColor: "rgba(0, 0, 0, 0.4)",

  pipSrc: "/img/dice/pip/star.svg",
  pipColor: "#fbbf24",
  pipSize: "100%",
  pipStyle: "embossed",

  faceOpacity: 0.85,
  faceTexture: "/img/dice/texture/steel.jpg",
};
