import type { DiceTheme } from "../types";

export const celestialTheme: DiceTheme = {
  id: "celestial",
  name: "Celestial",

  bgFrom: "rgba(30, 58, 138, 0.45)",
  bgTo: "rgba(17, 24, 39, 0.7)",

  borderLight: "rgba(147, 197, 253, 0.55)",
  borderDark: "rgba(30, 64, 175, 0.7)",

  highlightPrimary: "#93c5fd",
  highlightSecondary: "#fde047",

  shadowColor: "rgba(0, 0, 0, 0.45)",

  pipSrc: "/img/dice/pip/star.svg",
  pipColor: "#fef08a",
  pipSize: "85%",
  pipStyle: "embossed",

  faceOpacity: 0.9,
};
