import { DiceTheme } from "@/types/DiceTheme";

export const emeraldTheme: DiceTheme = {
  id: "emerald",
  name: "Emerald",

  bgFrom: "rgba(52, 211, 153, 0.25)",
  bgTo: "rgba(5, 150, 105, 0.3)",

  borderLight: "rgba(52, 211, 153, 0.5)",
  borderDark: "rgba(4, 120, 87, 0.6)",

  highlightPrimary: "#6ee7b7",
  highlightSecondary: "#bef264",

  shadowColor: "rgba(0, 0, 0, 0.3)",

  pipSrc: "/img/dice/pip/gem.svg",
  pipColor: "#6ee7b7",
  pipSize: "82%",
  pipStyle: "embossed",

  faceOpacity: 0.85,
};
