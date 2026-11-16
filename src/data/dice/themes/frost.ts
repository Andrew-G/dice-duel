import type { DiceTheme } from "@/types/DiceTheme";

export const frostTheme: DiceTheme = {
  id: "frost",
  name: "Glacial Frost",

  bgFrom: "rgba(56, 189, 248, 0.25)",
  bgTo: "rgba(14, 116, 144, 0.3)",

  borderLight: "rgba(186, 230, 253, 0.6)",
  borderDark: "rgba(8, 51, 68, 0.6)",

  highlightPrimary: "#38bdf8",
  highlightSecondary: "#e0f2fe",

  shadowColor: "rgba(0, 0, 0, 0.3)",

  pipSrc: "/img/dice/pip/circle.svg",
  pipColor: "#e0f2fe",
  pipSize: "85%",
  pipStyle: "debossed",

  faceOpacity: 0.8,
};
