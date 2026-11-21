import type { DiceTheme } from "@/types/DiceTheme";

export const blazeTheme: DiceTheme = {
  id: "blaze",
  name: "Blaze",

  bgFrom: "rgba(234, 198, 171, 0.9)",
  bgTo: "rgba(255, 209, 209, 0.9)",

  borderLight: "rgba(251, 146, 60, 0.55)",
  borderDark: "rgba(248, 91, 91, 0.6)",

  highlightPrimary: "#fb923c",
  highlightSecondary: "#B12424",

  shadowColor: "rgba(0, 0, 0, 0.35)",

  pipSrc: "/img/dice/pip/fire.svg",
  pipColor: "#C62400",
  pipSize: "100%",
  pipStyle: "embossed",

  faceOpacity: 1,
};
