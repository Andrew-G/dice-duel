import type { DiceTheme } from "@/types/DiceTheme";

export const sakuraTheme: DiceTheme = {
  id: "sakura",
  name: "Sakura",

  bgFrom: "rgba(249, 168, 212, 0.3)",
  bgTo: "rgba(219, 39, 119, 0.25)",

  borderLight: "rgba(249, 168, 212, 0.55)",
  borderDark: "rgba(190, 24, 93, 0.55)",

  highlightPrimary: "#f9a8d4",
  highlightSecondary: "#c4b5fd",

  shadowColor: "rgba(0, 0, 0, 0.3)",

  pipSrc: "/img/dice/pip/heart.svg",
  pipColor: "#fce7f3",
  pipSize: "80%",
  pipStyle: "flat",

  faceOpacity: 0.85,
};
