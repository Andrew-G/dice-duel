import type { DiceTheme } from "@/types/DiceTheme";

export const voidTheme: DiceTheme = {
  id: "void",
  name: "Abyssal Void",

  bgFrom: "rgba(30, 27, 75, 0.4)",
  bgTo: "rgba(15, 23, 42, 0.4)",

  borderLight: "rgba(129, 140, 248, 0.5)",
  borderDark: "rgba(30, 27, 75, 0.7)",

  highlightPrimary: "#818cf8",
  highlightSecondary: "#c084fc",

  shadowColor: "rgba(0, 0, 0, 0.5)",

  pipSrc: "/img/dice/pip/hexagon.svg",
  pipColor: "#c084fc",
  pipSize: "90%",
  pipStyle: "debossed",

  faceOpacity: 0.9,
};
