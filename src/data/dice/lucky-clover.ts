import type { DiceTheme } from "../types";

export const luckyCloverTheme: DiceTheme = {
  id: "lucky-clover",
  name: "Lucky Clover",

  bgFrom: "rgba(22, 163, 74, 0.35)",
  bgTo: "rgba(20, 83, 45, 0.5)",

  borderLight: "rgba(134, 239, 172, 0.55)",
  borderDark: "rgba(21, 128, 61, 0.7)",

  highlightPrimary: "#4ade80",
  highlightSecondary: "#facc15",

  shadowColor: "rgba(0, 0, 0, 0.35)",

  pipSrc: "/img/dice/pip/clover.svg",
  pipColor: "#fef08a",
  pipSize: "85%",
  pipStyle: "embossed",

  faceOpacity: 0.85,
};
