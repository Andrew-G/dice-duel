import type { DiceTheme } from "@/types/DiceTheme";

export const cursedTheme: DiceTheme = {
  id: "cursed",
  name: "Cursed",

  bgFrom: "rgba(88, 28, 135, 0.45)",
  bgTo: "rgba(15, 23, 42, 0.75)",

  borderLight: "rgba(192, 132, 252, 0.5)",
  borderDark: "rgba(59, 7, 100, 0.8)",

  highlightPrimary: "#c084fc",
  highlightSecondary: "#4ade80",

  shadowColor: "rgba(0, 0, 0, 0.55)",

  pipSrc: "/img/dice/pip/skull.svg",
  pipColor: "#e9d5ff",
  pipSize: "88%",
  pipStyle: "debossed",

  faceOpacity: 0.9,
};
