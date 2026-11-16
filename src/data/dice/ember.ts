import type { DiceTheme } from "../types";

export const emberTheme: DiceTheme = {
  id: "ember",
  name: "Ember",

  bgFrom: "rgba(251, 146, 60, 0.3)",
  bgTo: "rgba(220, 38, 38, 0.3)",

  borderLight: "rgba(251, 146, 60, 0.55)",
  borderDark: "rgba(185, 28, 28, 0.6)",

  highlightPrimary: "#fb923c",
  highlightSecondary: "#fde047",

  shadowColor: "rgba(0, 0, 0, 0.35)",

  pipSrc: "/img/dice/pip/fire.svg",
  pipColor: "#fde047",
  pipSize: "100%",
  pipStyle: "embossed",

  faceOpacity: 0.85,
};
